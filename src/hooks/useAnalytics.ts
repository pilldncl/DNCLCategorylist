import { useState, useEffect, useCallback } from 'react';
import { DailyMetrics, TimeSeriesData, AnalyticsFilters } from '@/types/analytics';

interface UseAnalyticsReturn {
  // Data
  dailyMetrics: DailyMetrics[];
  timeSeriesData: TimeSeriesData | null;
  summary: any;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAnalytics: (filters?: Partial<AnalyticsFilters>) => Promise<void>;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  exportData: (format: 'csv' | 'json') => Promise<void>;
  
  // Current filters
  currentFilters: AnalyticsFilters;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default filters
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    groupBy: 'day',
    metrics: ['all'],
    brands: [],
    categories: []
  });

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (newFilters?: Partial<AnalyticsFilters>) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = { ...filters, ...newFilters };
      const params = new URLSearchParams({
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
        groupBy: currentFilters.groupBy,
        metrics: currentFilters.metrics.join(','),
        ...(currentFilters.brands.length > 0 && { brands: currentFilters.brands.join(',') }),
        ...(currentFilters.categories.length > 0 && { categories: currentFilters.categories.join(',') })
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
        
        // Update filters if new ones were provided
        if (newFilters) {
          setFilters(prev => ({ ...prev, ...newFilters }));
        }
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        await exportToCSV();
      } else if (format === 'json') {
        await exportToJSON();
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  }, [dailyMetrics, timeSeriesData, summary]);

  // Load initial data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    dailyMetrics,
    timeSeriesData,
    summary,
    loading,
    error,
    fetchAnalytics,
    updateFilters,
    exportData,
    currentFilters: filters
  };
}

// Export to CSV
async function exportToCSV(): Promise<void> {
  // This would implement actual CSV export
  console.log('Exporting to CSV...');
  
  // Example CSV generation
  const csvContent = generateCSVContent();
  downloadFile(csvContent, 'analytics-data.csv', 'text/csv');
}

// Export to JSON
async function exportToJSON(): Promise<void> {
  // This would implement actual JSON export
  console.log('Exporting to JSON...');
  
  const jsonContent = JSON.stringify({
    dailyMetrics: [],
    timeSeriesData: null,
    summary: null,
    exportedAt: new Date().toISOString()
  }, null, 2);
  
  downloadFile(jsonContent, 'analytics-data.json', 'application/json');
}

// Generate CSV content
function generateCSVContent(): string {
  // This would generate actual CSV from your data
  const headers = ['Date', 'Sessions', 'Interactions', 'Conversion Rate', 'Bounce Rate'];
  const rows = [
    ['2024-01-01', '100', '500', '15%', '25%'],
    ['2024-01-02', '120', '600', '18%', '22%']
  ];
  
  const csvRows = [headers, ...rows];
  return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
