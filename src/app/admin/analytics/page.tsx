'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DailyMetrics, TimeSeriesData, AnalyticsFilters } from '@/types/analytics';

// Custom CSS for animations
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

interface AdminUser {
  username: string;
  role: 'admin' | 'user';
  token: string;
}

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [rowLimit, setRowLimit] = useState(10);
  const router = useRouter();
  
  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    groupBy: 'day',
    metrics: ['all'],
    brands: [],
    categories: []
  });

  // Check authentication and load analytics
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      fetchAnalytics();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
        metrics: filters.metrics.join(','),
        ...(filters.brands && filters.brands.length > 0 && { brands: filters.brands.join(',') }),
        ...(filters.categories && filters.categories.length > 0 && { categories: filters.categories.join(',') })
      });
      
      const response = await fetch(`/api/analytics/historical?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🔍 Frontend received data:', {
          dailyMetrics: data.data.dailyMetrics,
          summary: data.data.summary,
          summaryKeys: Object.keys(data.data.summary || {}),
          hasTotalLeads: 'totalLeads' in (data.data.summary || {}),
          totalLeadsValue: data.data.summary?.totalLeads
        });
        
        setDailyMetrics(data.data.dailyMetrics);
        setTimeSeriesData(data.data.timeSeriesData);
        setSummary(data.data.summary);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return (num * 100).toFixed(1) + '%';
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Export data
  const exportData = (format: 'csv' | 'json') => {
    console.log(`Exporting data as ${format}`);
    // Implementation would go here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
        {/* Header - More compact */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back to Admin Dashboard Button */}
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Admin</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">User behavior and performance insights</p>
              </div>
            </div>
            
            {/* Quick Actions - Smaller buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Filters - More compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Data Filters</h2>
            </div>
            
            {/* Date Range Picker - Smaller inputs */}
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Quick Date Presets */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    setFilters(prev => ({ 
                      ...prev, 
                      startDate: yesterday.toISOString().split('T')[0], 
                      endDate: today.toISOString().split('T')[0] 
                    }));
                  }}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                >
                  Last 2 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    setFilters(prev => ({ 
                      ...prev, 
                      startDate: weekAgo.toISOString().split('T')[0], 
                      endDate: today.toISOString().split('T')[0] 
                    }));
                  }}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                >
                  Last Week
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Group By</label>
                <select
                  value={filters.groupBy}
                  onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
              <button
                onClick={fetchAnalytics}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Loading State - Smaller */}
        {analyticsLoading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading analytics data...</p>
          </div>
        )}

        {/* Error State - More compact */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <h3 className="text-base font-medium text-red-900 mb-2">Error Loading Analytics</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards - Smaller and more compact */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <SummaryCard
              title="Total Sessions"
              value={formatNumber(summary.totalSessions)}
              change={`${summary.averageSessionsPerDay.toFixed(1)}/day`}
              icon="👥"
              color="blue"
            />
            <SummaryCard
              title="Total Interactions"
              value={formatNumber(summary.totalInteractions)}
              change={`${summary.averageInteractionsPerDay.toFixed(1)}/day`}
              icon="🔄"
              color="green"
            />
            <SummaryCard
              title="Total Leads"
              value={formatNumber(summary.totalLeads || 0)}
              change={`${formatPercentage(summary.leadConversionRate || 0)} conversion`}
              icon="📞"
              color="purple"
            />
            <SummaryCard
              title="Contact Forms"
              value={formatNumber(summary.contactFormSubmissions || 0)}
              change={`${summary.whatsappClicks || 0} WhatsApp`}
              icon="📝"
              color="indigo"
            />
          </div>
        )}

        {/* Charts Section - Tabbed Layout */}
        {timeSeriesData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
            {/* Chart Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4" aria-label="Chart tabs">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'trends', name: 'Trends', icon: '📈' },
                  { id: 'performance', name: 'Performance', icon: '🎯' },
                  { id: 'leads', name: 'Leads', icon: '📞' },
                  { id: 'data', name: 'Data', icon: '📋' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Overview</h3>
                  
                  {/* Main Chart - Sessions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Total Sessions</h4>
                      <span className="text-xs text-gray-500">{timeSeriesData.datasets[0]?.data.length || 0} data points</span>
                    </div>
                    
                    {/* Enhanced Bar Chart */}
                    <div className="flex items-end space-x-2 h-20">
                      {timeSeriesData.datasets[0]?.data.map((value, dataIndex) => {
                        const maxValue = Math.max(...timeSeriesData.datasets[0].data);
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        
                        return (
                          <div
                            key={dataIndex}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t shadow-sm"
                            style={{ height: `${height}%` }}
                            title={`${timeSeriesData.labels[dataIndex]}: ${value}`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Chart Labels */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{timeSeriesData.labels[0]}</span>
                      <span>{timeSeriesData.labels[timeSeriesData.labels.length - 1]}</span>
                    </div>
                  </div>

                  {/* Lead Generation Overview */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">Lead Generation Overview</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{summary?.totalLeads || 0}</div>
                        <div className="text-xs text-blue-600">Total Leads</div>
                        <div className="text-xs text-blue-500 mt-1">{formatPercentage(summary?.leadConversionRate || 0)} conversion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-900">{summary?.contactFormSubmissions || 0}</div>
                        <div className="text-xs text-green-600">Contact Forms</div>
                        <div className="text-xs text-green-500 mt-1">Form submissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-900">{summary?.whatsappClicks || 0}</div>
                        <div className="text-xs text-purple-600">WhatsApp</div>
                        <div className="text-xs text-purple-500 mt-1">WhatsApp inquiries</div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Charts Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-600 mb-2">Interactions</h5>
                      <div className="flex items-end space-x-1 h-12">
                        {timeSeriesData.datasets[1]?.data.map((value, dataIndex) => {
                          const maxValue = Math.max(...timeSeriesData.datasets[1].data);
                          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                          
                          return (
                            <div
                              key={dataIndex}
                              className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>

                                                                                                                         <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-300">
                      <h5 className="text-xs font-medium text-gray-600 mb-2">Lead Conversion</h5>
                      {/* Sleek Horizontal Progress Bar Chart */}
                      <div className="relative w-full h-12 flex items-center justify-center">
                        <div className="w-full max-w-20">
                          {/* Background Track */}
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            {/* Animated Progress Bar */}
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{ width: `${(summary?.leadConversionRate || 0) * 100}%` }}
                            />
                          </div>
                          
                          {/* Percentage Display */}
                          <div className="text-center mt-2">
                            <div className="text-xs font-bold text-yellow-700">
                              {formatPercentage(summary?.leadConversionRate || 0)}
                            </div>
                          </div>
                          
                          {/* Subtle Glow Effect */}
                          <div className="absolute inset-0 bg-yellow-500 opacity-5 blur-sm scale-105 pointer-events-none" />
                        </div>
                      </div>
                      <div className="text-xs text-center text-yellow-600 mt-1">Lead Conversion</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-600 mb-2">Bounce Rate</h5>
                      <div className="flex items-end space-x-1 h-12">
                        {timeSeriesData.datasets[3]?.data.map((value, dataIndex) => {
                          const maxValue = Math.max(...timeSeriesData.datasets[3].data);
                          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                          
                          return (
                            <div
                              key={dataIndex}
                              className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trend Analysis</h3>
                  
                  {timeSeriesData.datasets.map((dataset, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">{dataset.label}</h4>
                        <span className="text-xs text-gray-500">{dataset.data.length} data points</span>
                      </div>
                      
                      {/* Trend Chart */}
                      <div className="flex items-end space-x-2 h-16">
                        {dataset.data.map((value, dataIndex) => {
                          const maxValue = Math.max(...dataset.data);
                          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                          
                          return (
                            <div
                              key={dataIndex}
                              className="flex-1 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t shadow-sm"
                              style={{ height: `${height}%` }}
                              title={`${timeSeriesData.labels[dataIndex]}: ${value}`}
                            />
                          );
                        })}
                      </div>
                      
                      {/* Trend Labels */}
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{timeSeriesData.labels[0]}</span>
                        <span>{timeSeriesData.labels[timeSeriesData.labels.length - 1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Session Performance</h4>
                      <div className="text-2xl font-bold text-blue-900">
                        {summary?.totalSessions || 0}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {summary?.averageSessionsPerDay?.toFixed(1) || 0} per day
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Interaction Rate</h4>
                      <div className="text-2xl font-bold text-green-900">
                        {summary?.totalInteractions || 0}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {summary?.averageInteractionsPerDay?.toFixed(1) || 0} per day
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Lead Conversion</h4>
                      <div className="text-2xl font-bold text-yellow-900">
                        {formatPercentage(summary?.leadConversionRate || 0)}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">Lead conversion rate</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Bounce Rate</h4>
                      <div className="text-2xl font-bold text-red-900">
                        {formatPercentage(summary?.averageBounceRate || 0)}
                      </div>
                      <div className="text-xs text-red-600 mt-1">Overall average</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Lead Generation Analytics</h3>
                  
                  {/* Lead Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Total Leads</h4>
                      <div className="text-2xl font-bold text-blue-900">
                        {summary?.totalLeads || 0}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {formatPercentage(summary?.leadConversionRate || 0)} conversion
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Contact Forms</h4>
                      <div className="text-2xl font-bold text-green-900">
                        {summary?.contactFormSubmissions || 0}
                      </div>
                      <div className="text-xs text-green-600 mt-1">Form submissions</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-2">WhatsApp</h4>
                      <div className="text-2xl font-bold text-purple-900">
                        {summary?.whatsappClicks || 0}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">WhatsApp inquiries</div>
                    </div>
                  </div>

                  {/* Contact Method Preference */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Method Preference</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Forms: {summary?.contactFormSubmissions || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">WhatsApp: {summary?.whatsappClicks || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Contacted Products */}
                  {summary?.topContactedProducts && summary.topContactedProducts.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Top Contacted Products</h4>
                      <div className="space-y-2">
                        {summary.topContactedProducts.slice(0, 5).map((product: any, index: number) => (
                          <div key={product.productId} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{product.productName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{product.contactCount} contacts</span>
                              <span className="text-xs text-gray-500">
                                ({formatPercentage(product.contactRate)} rate)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Data View</h3>
                  
                  {/* Data Table */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interactions</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bounce</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {dailyMetrics.slice(0, 10).map((metric) => (
                            <tr key={metric.date} className="hover:bg-gray-100">
                              <td className="px-3 py-2 text-xs text-gray-900">
                                {new Date(metric.date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900">{metric.totalSessions}</td>
                              <td className="px-3 py-2 text-xs text-gray-900">{metric.totalInteractions}</td>
                              <td className="px-3 py-2 text-xs text-gray-900">{formatPercentage(metric.conversionRate)}</td>
                              <td className="px-3 py-2 text-xs text-gray-900">{formatPercentage(metric.bounceRate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily Metrics Table - More compact */}
        {dailyMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Daily Breakdown</h2>
                
                {/* Interactive Filters for Daily Breakdown */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">Show:</label>
                    <select
                      value={filters.groupBy}
                      onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">Limit:</label>
                    <select
                      value={rowLimit}
                      onChange={(e) => setRowLimit(parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5 rows</option>
                      <option value={10}>10 rows</option>
                      <option value={20}>20 rows</option>
                      <option value={dailyMetrics.length}>All ({dailyMetrics.length})</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFilters(prev => ({ ...prev, startDate: today, endDate: today }));
                      // Auto-fetch after setting today's date
                      setTimeout(() => fetchAnalytics(), 100);
                    }}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Today
                  </button>
                  
                  <button
                    onClick={fetchAnalytics}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interactions
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bounce Rate
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyMetrics.slice(0, rowLimit).map((metric) => (
                    <tr 
                      key={metric.date} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        // Set filters to show this specific date
                        setFilters(prev => ({ 
                          ...prev, 
                          startDate: metric.date, 
                          endDate: metric.date 
                        }));
                        // Auto-fetch after setting the date
                        setTimeout(() => fetchAnalytics(), 100);
                      }}
                      title={`Click to view details for ${new Date(metric.date).toLocaleDateString()}`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(metric.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {metric.totalSessions}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {metric.totalInteractions}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(metric.conversionRate)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(metric.bounceRate)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(metric.averageSessionDuration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// Summary Card Component - More compact
interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

function SummaryCard({ title, value, change, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{change}</p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}
