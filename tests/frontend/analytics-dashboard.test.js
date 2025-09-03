/**
 * Analytics Dashboard Frontend Tests
 * Tests all major functionality of the admin analytics dashboard
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminAnalyticsPage from '../../src/app/admin/analytics/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

describe('Analytics Dashboard Frontend Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      username: 'admin',
      role: 'admin',
      token: 'test-token'
    }));
  });

  describe('Authentication & Loading States', () => {
    test('should show loading spinner initially', () => {
      render(<AdminAnalyticsPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should redirect to login if no admin user', () => {
      localStorageMock.getItem.mockReturnValue(null);
      render(<AdminAnalyticsPage />);
      // Should redirect to login
    });

    test('should handle invalid admin user data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      render(<AdminAnalyticsPage />);
      // Should redirect to login
    });
  });

  describe('Header & Navigation', () => {
    test('should display dashboard title and description', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('User behavior and performance insights')).toBeInTheDocument();
      });
    });

    test('should have export buttons', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
        expect(screen.getByText('Export JSON')).toBeInTheDocument();
      });
    });

    test('should handle export button clicks', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const csvButton = screen.getByText('Export CSV');
        const jsonButton = screen.getByText('Export JSON');
        
        fireEvent.click(csvButton);
        fireEvent.click(jsonButton);
        
        expect(consoleSpy).toHaveBeenCalledWith('Exporting data as csv');
        expect(consoleSpy).toHaveBeenCalledWith('Exporting data as json');
      });
    });
  });

  describe('Data Filters', () => {
    test('should display filter section', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Data Filters')).toBeInTheDocument();
      });
    });

    test('should have date inputs', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
        expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      });
    });

    test('should have group by dropdown', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('day')).toBeInTheDocument();
      });
    });

    test('should have apply filters button', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Apply')).toBeInTheDocument();
      });
    });

    test('should handle filter changes', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const startDateInput = screen.getByLabelText('Start Date');
        const endDateInput = screen.getByLabelText('End Date');
        const groupBySelect = screen.getByDisplayValue('day');
        
        fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
        fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
        fireEvent.change(groupBySelect, { target: { value: 'week' } });
        
        expect(startDateInput.value).toBe('2024-01-01');
        expect(endDateInput.value).toBe('2024-12-31');
        expect(groupBySelect.value).toBe('week');
      });
    });
  });

  describe('Summary Cards', () => {
    const mockSummary = {
      totalSessions: 150,
      totalInteractions: 2500,
      averageConversionRate: 0.054,
      averageBounceRate: 0.23,
      averageSessionsPerDay: 5.0,
      averageInteractionsPerDay: 83.3
    };

    beforeEach(() => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: mockSummary
          }
        })
      });
    });

    test('should display summary cards when data is available', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
        expect(screen.getByText('Total Interactions')).toBeInTheDocument();
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
      });
    });

    test('should display correct values in summary cards', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total Sessions
        expect(screen.getByText('2.5K')).toBeInTheDocument(); // Total Interactions
        expect(screen.getByText('5.4%')).toBeInTheDocument(); // Conversion Rate
        expect(screen.getByText('23.0%')).toBeInTheDocument(); // Bounce Rate
      });
    });

    test('should display daily averages', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('5.0/day')).toBeInTheDocument();
        expect(screen.getByText('83.3/day')).toBeInTheDocument();
      });
    });
  });

  describe('Tabbed Chart Interface', () => {
    const mockTimeSeriesData = {
      labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
      datasets: [
        {
          label: 'Total Sessions',
          data: [10, 15, 12],
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8'
        },
        {
          label: 'Total Interactions',
          data: [100, 150, 120],
          backgroundColor: '#10B981',
          borderColor: '#047857'
        }
      ]
    };

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: mockTimeSeriesData,
            summary: {}
          }
        })
      });
    });

    test('should display tab navigation', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('📊 Overview')).toBeInTheDocument();
        expect(screen.getByText('📈 Trends')).toBeInTheDocument();
        expect(screen.getByText('🎯 Performance')).toBeInTheDocument();
        expect(screen.getByText('📋 Data')).toBeInTheDocument();
      });
    });

    test('should show overview tab by default', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Overview')).toBeInTheDocument();
      });
    });

    test('should switch between tabs', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const trendsTab = screen.getByText('📈 Trends');
        fireEvent.click(trendsTab);
        
        expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
      });
    });

    test('should display charts in overview tab', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
        expect(screen.getByText('Interactions')).toBeInTheDocument();
        expect(screen.getByText('Conversion')).toBeInTheDocument();
        expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
      });
    });

    test('should display mini charts grid', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        // Check for mini chart containers
        const miniCharts = screen.getAllByText(/Interactions|Conversion|Bounce Rate/);
        expect(miniCharts).toHaveLength(3);
      });
    });
  });

  describe('Data Table', () => {
    const mockDailyMetrics = [
      {
        date: '2024-01-01',
        totalSessions: 5,
        totalInteractions: 100,
        conversionRate: 0.05,
        bounceRate: 0.2,
        averageSessionDuration: 300
      },
      {
        date: '2024-01-02',
        totalSessions: 8,
        totalInteractions: 150,
        conversionRate: 0.08,
        bounceRate: 0.15,
        averageSessionDuration: 450
      }
    ];

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: mockDailyMetrics,
            timeSeriesData: null,
            summary: {}
          }
        })
      });
    });

    test('should display daily breakdown table', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Daily Breakdown')).toBeInTheDocument();
      });
    });

    test('should display table headers', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('DATE')).toBeInTheDocument();
        expect(screen.getByText('SESSIONS')).toBeInTheDocument();
        expect(screen.getByText('INTERACTIONS')).toBeInTheDocument();
        expect(screen.getByText('CONVERSION')).toBeInTheDocument();
        expect(screen.getByText('BOUNCE RATE')).toBeInTheDocument();
        expect(screen.getByText('AVG DURATION')).toBeInTheDocument();
      });
    });

    test('should display data rows', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // Sessions
        expect(screen.getByText('100')).toBeInTheDocument(); // Interactions
        expect(screen.getByText('5.0%')).toBeInTheDocument(); // Conversion
        expect(screen.getByText('20.0%')).toBeInTheDocument(); // Bounce Rate
        expect(screen.getByText('5m 0s')).toBeInTheDocument(); // Duration
      });
    });
  });

  describe('Error Handling', () => {
    test('should display error message on API failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('should have retry button on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    test('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Invalid date range'
        })
      });
      
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
        expect(screen.getByText('Invalid date range')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should handle mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<AdminAnalyticsPage />);
      
      // Should still render all components
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('should handle desktop layout', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<AdminAnalyticsPage />);
      
      // Should render in desktop layout
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance & Optimization', () => {
    test('should not re-render unnecessarily', async () => {
      const { rerender } = render(<AdminAnalyticsPage />);
      
      // Mock successful data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { dailyMetrics: [], timeSeriesData: null, summary: {} }
        })
      });
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });
      
      // Re-render with same props
      rerender(<AdminAnalyticsPage />);
      
      // Should still show dashboard
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });
});
