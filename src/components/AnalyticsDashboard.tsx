'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DailyMetrics, TimeSeriesData, AnalyticsFilters } from '@/types/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    groupBy: 'day',
    metrics: ['all'],
    brands: [],
    categories: []
  });

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
        metrics: filters.metrics.join(','),
        ...(filters.brands.length > 0 && { brands: filters.brands.join(',') }),
        ...(filters.categories.length > 0 && { categories: filters.categories.join(',') })
      });
      
      const response = await fetch(`/api/analytics/historical?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      if (data.success) {
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
      setLoading(false);
    }
  }, [filters]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  if (loading) {
    return (
      <div className={`${className} bg-white rounded-lg shadow-sm border border-gray-200 p-6`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-6`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Analytics</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Historical data and performance metrics</p>
          </div>
          
          {/* Date Range Picker */}
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title="Conversion Rate"
            value={formatPercentage(summary.averageConversionRate)}
            change="Overall average"
            icon="📈"
            color="yellow"
          />
          <SummaryCard
            title="Bounce Rate"
            value={formatPercentage(summary.averageBounceRate)}
            change="Overall average"
            icon="📉"
            color="red"
          />
        </div>
      )}

      {/* Charts Section */}
      {timeSeriesData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
          
          {/* Simple Chart Visualization */}
          <div className="space-y-6">
            {timeSeriesData.datasets.map((dataset, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{dataset.label}</h3>
                  <span className="text-xs text-gray-500">
                    {dataset.data.length} data points
                  </span>
                </div>
                
                {/* Simple Bar Chart */}
                <div className="flex items-end space-x-1 h-20">
                  {dataset.data.map((value, dataIndex) => {
                    const maxValue = Math.max(...dataset.data);
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    
                    return (
                      <div
                        key={dataIndex}
                        className="flex-1 bg-gray-200 rounded-t"
                        style={{
                          height: `${height}%`,
                          backgroundColor: dataset.backgroundColor,
                          border: `1px solid ${dataset.borderColor}`
                        }}
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
            ))}
          </div>
        </div>
      )}

      {/* Daily Metrics Table */}
      {dailyMetrics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daily Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bounce Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyMetrics.map((metric) => (
                  <tr key={metric.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(metric.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.totalInteractions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(metric.conversionRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(metric.bounceRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(metric.averageSessionDuration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <p className="text-gray-600 mt-1">Download analytics data for external analysis</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function SummaryCard({ title, value, change, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{change}</p>
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

// Export functionality
function exportData(format: 'csv' | 'json') {
  // This would implement actual export logic
  console.log(`Exporting data as ${format}`);
  // In a real implementation, you'd create and download the file
}
