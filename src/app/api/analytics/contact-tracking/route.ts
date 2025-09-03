import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ContactTrackingSummary } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || getDefaultStartDate();
    const endDate = searchParams.get('endDate') || getDefaultEndDate();
    const productId = searchParams.get('productId');

    console.log('📞 GET /api/analytics/contact-tracking - Fetching contact analytics:', {
      startDate,
      endDate,
      productId
    });

    // Fetch contact tracking data
    const contactSummary = await getContactTrackingSummary(startDate, endDate, productId);
    
    // Generate cache key for ETag
    const cacheKey = `contact-tracking-${startDate}-${endDate}-${productId || 'all'}`;
    const etag = Buffer.from(cacheKey).toString('base64').slice(0, 8);

    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes cache
    headers.set('ETag', etag);

    return NextResponse.json({
      success: true,
      data: contactSummary
    }, { headers });

  } catch (error) {
    console.error('Error fetching contact tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact tracking data' },
      { status: 500 }
    );
  }
}

// Get contact tracking summary
async function getContactTrackingSummary(startDate: string, endDate: string, productId?: string): Promise<ContactTrackingSummary> {
  try {
    // Build base query for contact interactions
    let query = supabaseAdmin
      .from('user_interactions')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59')
      .or('contact_form_submitted.eq.true,phone_clicked.eq.true,whatsapp_clicked.eq.true');

    // Apply product filter if specified
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: interactions, error } = await query;

    if (error) {
      console.error('Error fetching contact interactions:', error);
      return getEmptyContactSummary();
    }

    // Calculate contact metrics
    const contactFormSubmissions = interactions?.filter(i => i.contact_form_submitted).length || 0;
    const phoneClicks = interactions?.filter(i => i.phone_clicked).length || 0;
    const whatsappClicks = interactions?.filter(i => i.whatsapp_clicked).length || 0;
    const totalLeads = contactFormSubmissions + phoneClicks + whatsappClicks;

    // Get total sessions for lead conversion rate
    const { data: totalSessions } = await supabaseAdmin
      .from('user_interactions')
      .select('session_id')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59')
      .not('session_id', 'is', null);

    const uniqueSessions = new Set(totalSessions?.map(s => s.session_id) || []);
    const leadConversionRate = uniqueSessions.size > 0 ? totalLeads / uniqueSessions.size : 0;

    // Get top contacted products
    const topContactedProducts = await getTopContactedProducts(startDate, endDate);

    // Get daily contact trend
    const dailyContactTrend = await getDailyContactTrend(startDate, endDate);

    return {
      totalLeads,
      contactFormSubmissions,
      phoneClicks,
      whatsappClicks,
      leadConversionRate,
      topContactedProducts,
      contactMethodPreference: {
        form: contactFormSubmissions,
        phone: phoneClicks,
        whatsapp: whatsappClicks
      },
      dailyContactTrend
    };

  } catch (error) {
    console.error('Error in getContactTrackingSummary:', error);
    return getEmptyContactSummary();
  }
}

// Get top contacted products
async function getTopContactedProducts(startDate: string, endDate: string) {
  try {
    const { data: productContacts, error } = await supabaseAdmin
      .from('user_interactions')
      .select('product_id, product_name, contact_form_submitted, phone_clicked, whatsapp_clicked')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59')
      .or('contact_form_submitted.eq.true,phone_clicked.eq.true,whatsapp_clicked.eq.true')
      .not('product_id', 'is', null);

    if (error || !productContacts) return [];

    // Group by product and count contacts
    const productMap = new Map<string, { productId: string; productName: string; contactCount: number; views: number }>();
    
    productContacts.forEach(contact => {
      const productId = contact.product_id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: contact.product_name || 'Unknown Product',
          contactCount: 0,
          views: 0
        });
      }
      
      const product = productMap.get(productId)!;
      if (contact.contact_form_submitted || contact.phone_clicked || contact.whatsapp_clicked) {
        product.contactCount++;
      }
    });

    // Get product views for contact rate calculation
    const { data: productViews } = await supabaseAdmin
      .from('user_interactions')
      .select('product_id')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59')
      .eq('type', 'product_view')
      .not('product_id', 'is', null);

    // Count views per product
    productViews?.forEach(view => {
      const product = productMap.get(view.product_id);
      if (product) {
        product.views++;
      }
    });

    // Convert to array and calculate contact rates
    return Array.from(productMap.values())
      .map(product => ({
        productId: product.productId,
        productName: product.productName,
        contactCount: product.contactCount,
        contactRate: product.views > 0 ? product.contactCount / product.views : 0
      }))
      .sort((a, b) => b.contactCount - a.contactCount)
      .slice(0, 10); // Top 10

  } catch (error) {
    console.error('Error getting top contacted products:', error);
    return [];
  }
}

// Get daily contact trend
async function getDailyContactTrend(startDate: string, endDate: string) {
  try {
    const { data: dailyContacts, error } = await supabaseAdmin
      .from('user_interactions')
      .select('timestamp, contact_form_submitted, phone_clicked, whatsapp_clicked')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + 'T23:59:59')
      .or('contact_form_submitted.eq.true,phone_clicked.eq.true,whatsapp_clicked.eq.true');

    if (error || !dailyContacts) return [];

    // Group by date
    const dailyMap = new Map<string, { leads: number; formSubmissions: number; phoneClicks: number; whatsappClicks: number }>();
    
    dailyContacts.forEach(contact => {
      const date = new Date(contact.timestamp).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { leads: 0, formSubmissions: 0, phoneClicks: 0, whatsappClicks: 0 });
      }
      
      const day = dailyMap.get(date)!;
      if (contact.contact_form_submitted) day.formSubmissions++;
      if (contact.phone_clicked) day.phoneClicks++;
      if (contact.whatsapp_clicked) day.whatsappClicks++;
      day.leads++;
    });

    // Convert to array and sort by date
    return Array.from(dailyMap.entries())
      .map(([date, metrics]) => ({
        date,
        ...metrics
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

  } catch (error) {
    console.error('Error getting daily contact trend:', error);
    return [];
  }
}

// Get default start date (30 days ago)
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

// Get default end date (today)
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get empty contact summary
function getEmptyContactSummary(): ContactTrackingSummary {
  return {
    totalLeads: 0,
    contactFormSubmissions: 0,
    phoneClicks: 0,
    whatsappClicks: 0,
    leadConversionRate: 0,
    topContactedProducts: [],
    contactMethodPreference: {
      form: 0,
      phone: 0,
      whatsapp: 0
    },
    dailyContactTrend: []
  };
}
