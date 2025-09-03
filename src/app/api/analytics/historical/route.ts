import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DailyMetrics, AnalyticsFilters, TimeSeriesData } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || getDefaultStartDate();
    const endDate = searchParams.get('endDate') || getDefaultEndDate();
    const groupBy = searchParams.get('groupBy') || 'day';
    const metrics = searchParams.get('metrics')?.split(',') || ['all'];
    const brands = searchParams.get('brands')?.split(',') || [];
    const categories = searchParams.get('categories')?.split(',') || [];

    console.log('📊 GET /api/analytics/historical - Fetching analytics:', {
      startDate,
      endDate,
      groupBy,
      metrics,
      brands,
      categories
    });

    // Fetch daily aggregated metrics
    const dailyMetrics = await getDailyMetrics(startDate, endDate, brands, categories);
    
    // Generate time series data for charts
    const timeSeriesData = generateTimeSeriesData(dailyMetrics, groupBy, metrics);
    
    // Calculate summary statistics
    const summary = calculateSummary(dailyMetrics);
    
    // Generate cache key for ETag
    const cacheKey = `analytics-${startDate}-${endDate}-${groupBy}-${metrics.join('-')}-${brands.join('-')}-${categories.join('-')}`;
    const etag = Buffer.from(cacheKey).toString('base64').slice(0, 8);

    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes cache
    headers.set('ETag', etag);

    return NextResponse.json({
      success: true,
      data: {
        dailyMetrics,
        timeSeriesData,
        summary,
        filters: {
          startDate,
          endDate,
          groupBy,
          metrics,
          brands,
          categories
        }
      }
    }, { headers });

  } catch (error) {
    console.error('Error fetching historical analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Get daily metrics from user interactions
async function getDailyMetrics(startDate: string, endDate: string, brands: string[], categories: string[]): Promise<DailyMetrics[]> {
  try {
    // Build base query for user interactions
    let query = supabaseAdmin
      .from('user_interactions')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59');

    // Apply brand filter if specified
    if (brands.length > 0) {
      query = query.in('brand', brands);
    }

    // Apply category filter if specified
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data: interactions, error } = await query;

    if (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }

    // Group interactions by date
    const dailyGroups = new Map<string, any[]>();
    
    interactions?.forEach(interaction => {
      const date = new Date(interaction.timestamp).toISOString().split('T')[0];
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(interaction);
    });

    // Calculate metrics for each day
    const dailyMetrics: DailyMetrics[] = [];
    
    for (const [date, dayInteractions] of dailyGroups) {
      const metrics = calculateDailyMetrics(date, dayInteractions);
      dailyMetrics.push(metrics);
    }

    // Sort by date
    return dailyMetrics.sort((a, b) => a.date.localeCompare(b.date));

  } catch (error) {
    console.error('Error in getDailyMetrics:', error);
    return [];
  }
}

// Calculate metrics for a specific day
function calculateDailyMetrics(date: string, interactions: any[]): DailyMetrics {
  const uniqueSessions = new Set(interactions.map(i => i.session_id));
  const uniqueUsers = new Set(interactions.map(i => i.user_id).filter(Boolean));
  
  const pageViews = interactions.filter(i => i.type === 'page_view').length;
  const searches = interactions.filter(i => i.type === 'search').length;
  const productViews = interactions.filter(i => i.type === 'product_view').length;
  const resultClicks = interactions.filter(i => i.type === 'result_click').length;
  const categoryViews = interactions.filter(i => i.type === 'category_view').length;
  
  const totalInteractions = interactions.length;
  const conversionRate = totalInteractions > 0 ? resultClicks / totalInteractions : 0;
  
  // Calculate session duration (simplified - in production you'd track this more accurately)
  const sessionDurations = calculateSessionDurations(interactions);
  const averageSessionDuration = sessionDurations.length > 0 
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
    : 0;
  
  // Calculate bounce rate (sessions with only 1 interaction)
  const bounceSessions = Array.from(uniqueSessions).filter(sessionId => {
    const sessionInteractions = interactions.filter(i => i.session_id === sessionId);
    return sessionInteractions.length === 1;
  });
  const bounceRate = uniqueSessions.size > 0 ? bounceSessions.length / uniqueSessions.size : 0;

  // New: Contact tracking metrics
  const contactFormSubmissions = interactions.filter(i => i.contact_form_submitted).length;
  const phoneClicks = interactions.filter(i => i.phone_clicked).length;
  const whatsappClicks = interactions.filter(i => i.whatsapp_clicked).length;
  const totalLeads = contactFormSubmissions + phoneClicks + whatsappClicks;
  const leadConversionRate = uniqueSessions.size > 0 ? totalLeads / uniqueSessions.size : 0;

  // Debug logging for lead metrics
  console.log('🔍 Lead Metrics Debug for date', date, ':', {
    totalInteractions: interactions.length,
    uniqueSessions: uniqueSessions.size,
    contactFormSubmissions,
    phoneClicks,
    whatsappClicks,
    totalLeads,
    leadConversionRate,
    sampleInteractions: interactions.slice(0, 3).map(i => ({
      type: i.type,
      contact_form_submitted: i.contact_form_submitted,
      phone_clicked: i.phone_clicked,
      whatsapp_clicked: i.whatsapp_clicked
    }))
  });

  return {
    date,
    totalSessions: uniqueSessions.size,
    uniqueUsers: uniqueUsers.size,
    totalInteractions,
    pageViews,
    searches,
    productViews,
    resultClicks,
    categoryViews,
    averageSessionDuration,
    bounceRate,
    conversionRate,
    // New contact tracking metrics
    contactFormSubmissions,
    phoneClicks,
    whatsappClicks,
    totalLeads,
    leadConversionRate
  };
}

// Calculate session durations from interactions
function calculateSessionDurations(interactions: any[]): number[] {
  const sessionGroups = new Map<string, any[]>();
  
  // Group interactions by session
  interactions.forEach(interaction => {
    if (!sessionGroups.has(interaction.session_id)) {
      sessionGroups.set(interaction.session_id, []);
    }
    sessionGroups.get(interaction.session_id)!.push(interaction);
  });
  
  const durations: number[] = [];
  
  for (const [sessionId, sessionInteractions] of sessionGroups) {
    if (sessionInteractions.length > 1) {
      // Sort by timestamp
      const sorted = sessionInteractions.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const start = new Date(sorted[0].timestamp);
      const end = new Date(sorted[sorted.length - 1].timestamp);
      const duration = (end.getTime() - start.getTime()) / 1000; // Convert to seconds
      
      if (duration > 0 && duration < 3600) { // Filter out unrealistic durations (>1 hour)
        durations.push(duration);
      }
    }
  }
  
  return durations;
}

// Generate time series data for charts
function generateTimeSeriesData(dailyMetrics: DailyMetrics[], groupBy: string, metrics: string[]): TimeSeriesData {
  const labels = dailyMetrics.map(d => d.date);
  
  const datasets = [];
  
  if (metrics.includes('all') || metrics.includes('sessions')) {
    datasets.push({
      label: 'Total Sessions',
      data: dailyMetrics.map(d => d.totalSessions),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    });
  }
  
  if (metrics.includes('all') || metrics.includes('interactions')) {
    datasets.push({
      label: 'Total Interactions',
      data: dailyMetrics.map(d => d.totalInteractions),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true
    });
  }
  
  if (metrics.includes('all') || metrics.includes('conversions')) {
    datasets.push({
      label: 'Conversion Rate (%)',
      data: dailyMetrics.map(d => d.conversionRate * 100),
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: false
    });
  }
  
  if (metrics.includes('all') || metrics.includes('bounce')) {
    datasets.push({
      label: 'Bounce Rate (%)',
      data: dailyMetrics.map(d => d.bounceRate * 100),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: false
    });
  }

  return {
    labels,
    datasets
  };
}

// Calculate summary statistics
function calculateSummary(dailyMetrics: DailyMetrics[]) {
  if (dailyMetrics.length === 0) {
    return {
      totalDays: 0,
      averageSessionsPerDay: 0,
      averageInteractionsPerDay: 0,
      totalSessions: 0,
      totalInteractions: 0,
      averageConversionRate: 0,
      averageBounceRate: 0,
      // Add lead metrics
      totalLeads: 0,
      contactFormSubmissions: 0,
      phoneClicks: 0,
      whatsappClicks: 0,
      leadConversionRate: 0
    };
  }

  const totalSessions = dailyMetrics.reduce((sum, d) => sum + d.totalSessions, 0);
  const totalInteractions = dailyMetrics.reduce((sum, d) => sum + d.totalInteractions, 0);
  const totalConversionRate = dailyMetrics.reduce((sum, d) => sum + d.conversionRate, 0);
  const totalBounceRate = dailyMetrics.reduce((sum, d) => sum + d.bounceRate, 0);
  
  // Add lead metrics calculation
  const totalLeads = dailyMetrics.reduce((sum, d) => sum + d.totalLeads, 0);
  const contactFormSubmissions = dailyMetrics.reduce((sum, d) => sum + d.contactFormSubmissions, 0);
  const phoneClicks = dailyMetrics.reduce((sum, d) => sum + d.phoneClicks, 0);
  const whatsappClicks = dailyMetrics.reduce((sum, d) => sum + d.whatsappClicks, 0);
  const leadConversionRate = totalSessions > 0 ? totalLeads / totalSessions : 0;

  return {
    totalDays: dailyMetrics.length,
    averageSessionsPerDay: totalSessions / dailyMetrics.length,
    averageInteractionsPerDay: totalInteractions / dailyMetrics.length,
    totalSessions,
    totalInteractions,
    averageConversionRate: totalConversionRate / dailyMetrics.length,
    averageBounceRate: totalBounceRate / dailyMetrics.length,
    // Add lead metrics
    totalLeads,
    contactFormSubmissions,
    phoneClicks,
    whatsappClicks,
    leadConversionRate
  };
}

// Helper functions for default date ranges
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30); // Last 30 days
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}
