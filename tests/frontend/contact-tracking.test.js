/**
 * Contact Tracking System Frontend Tests
 * Tests the new lead generation and contact tracking functionality
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

describe('Contact Tracking System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      username: 'admin',
      role: 'admin',
      token: 'test-token'
    }));
  });

  describe('Contact Tracking Tab Integration', () => {
    const mockContactData = {
      totalLeads: 25,
      contactFormSubmissions: 15,
      phoneClicks: 7,
      whatsappClicks: 3,
      leadConversionRate: 0.08,
      topContactedProducts: [
        {
          productId: 'prod-1',
          productName: 'Premium Widget',
          contactCount: 8,
          contactRate: 0.12
        },
        {
          productId: 'prod-2',
          productName: 'Standard Widget',
          contactCount: 5,
          contactRate: 0.08
        }
      ],
      contactMethodPreference: {
        form: 15,
        phone: 7,
        whatsapp: 3
      }
    };

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalSessions: 300,
              totalInteractions: 1500,
              totalLeads: mockContactData.totalLeads,
              contactFormSubmissions: mockContactData.contactFormSubmissions,
              phoneClicks: mockContactData.phoneClicks,
              whatsappClicks: mockContactData.whatsappClicks,
              leadConversionRate: mockContactData.leadConversionRate,
              topContactedProducts: mockContactData.topContactedProducts
            }
          }
        })
      });
    });

    test('should display leads tab in navigation', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('📞 Leads')).toBeInTheDocument();
      });
    });

    test('should show leads tab content when selected', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Lead Generation Analytics')).toBeInTheDocument();
      });
    });

    test('should display lead summary cards', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Total Leads')).toBeInTheDocument();
        expect(screen.getByText('Contact Forms')).toBeInTheDocument();
        expect(screen.getByText('Phone Clicks')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      });
    });

    test('should display correct lead values', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('25')).toBeInTheDocument(); // Total Leads
        expect(screen.getByText('15')).toBeInTheDocument(); // Contact Forms
        expect(screen.getByText('7')).toBeInTheDocument(); // Phone Clicks
        expect(screen.getByText('3')).toBeInTheDocument(); // WhatsApp
      });
    });

    test('should display lead conversion rate', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('8.0% conversion')).toBeInTheDocument();
      });
    });

    test('should display contact method preference', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Contact Method Preference')).toBeInTheDocument();
        expect(screen.getByText('Forms: 15')).toBeInTheDocument();
        expect(screen.getByText('Phone: 7')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp: 3')).toBeInTheDocument();
      });
    });

    test('should display top contacted products', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Top Contacted Products')).toBeInTheDocument();
        expect(screen.getByText('Premium Widget')).toBeInTheDocument();
        expect(screen.getByText('Standard Widget')).toBeInTheDocument();
        expect(screen.getByText('8 contacts')).toBeInTheDocument();
        expect(screen.getByText('5 contacts')).toBeInTheDocument();
      });
    });

    test('should display product contact rates', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('(12.0% rate)')).toBeInTheDocument(); // Premium Widget
        expect(screen.getByText('(8.0% rate)')).toBeInTheDocument(); // Standard Widget
      });
    });
  });

  describe('Updated Summary Cards', () => {
    const mockSummaryWithLeads = {
      totalSessions: 300,
      totalInteractions: 1500,
      totalLeads: 25,
      contactFormSubmissions: 15,
      phoneClicks: 7,
      whatsappClicks: 3,
      leadConversionRate: 0.08
    };

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: mockSummaryWithLeads
          }
        })
      });
    });

    test('should display total leads in summary cards', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Leads')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('8.0% conversion')).toBeInTheDocument();
      });
    });

    test('should display contact forms in summary cards', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Contact Forms')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('7 phone, 3 WhatsApp')).toBeInTheDocument();
      });
    });

    test('should have correct icons for lead metrics', async () => {
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('📞')).toBeInTheDocument(); // Total Leads
        expect(screen.getByText('📝')).toBeInTheDocument(); // Contact Forms
      });
    });
  });

  describe('Contact Tracking API Integration', () => {
    test('should fetch contact tracking data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/analytics/historical')
        );
      });
    });

    test('should handle contact tracking API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Contact tracking API failed'));
      
      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
        expect(screen.getByText('Contact tracking API failed')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Tracking Data Validation', () => {
    test('should handle missing contact data gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalSessions: 300,
              totalInteractions: 1500
              // Missing contact tracking data
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        // Should display 0 values for missing data
        expect(screen.getByText('0')).toBeInTheDocument(); // Total Leads
        expect(screen.getByText('0')).toBeInTheDocument(); // Contact Forms
      });
    });

    test('should handle empty top contacted products', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalLeads: 0,
              contactFormSubmissions: 0,
              phoneClicks: 0,
              whatsappClicks: 0,
              topContactedProducts: []
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        // Should not display top contacted products section
        expect(screen.queryByText('Top Contacted Products')).not.toBeInTheDocument();
      });
    });
  });

  describe('Contact Tracking UI Responsiveness', () => {
    test('should handle mobile layout for leads tab', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Lead Generation Analytics')).toBeInTheDocument();
      });
    });

    test('should handle desktop layout for leads tab', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        const leadsTab = screen.getByText('📞 Leads');
        fireEvent.click(leadsTab);
        
        expect(screen.getByText('Lead Generation Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Tracking Performance', () => {
    test('should not re-render unnecessarily when switching to leads tab', async () => {
      const { rerender } = render(<AdminAnalyticsPage />);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      await waitFor(() => {
        expect(screen.getByText('📞 Leads')).toBeInTheDocument();
      });

      // Re-render with same props
      rerender(<AdminAnalyticsPage />);
      
      // Should still show leads tab
      expect(screen.getByText('📞 Leads')).toBeInTheDocument();
    });
  });

  describe('Contact Tracking Integration with Existing Features', () => {
    test('should maintain existing analytics functionality', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalSessions: 300,
              totalInteractions: 1500,
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        // Existing functionality should still work
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
        expect(screen.getByText('Total Interactions')).toBeInTheDocument();
        
        // New functionality should work
        expect(screen.getByText('Total Leads')).toBeInTheDocument();
        expect(screen.getByText('Contact Forms')).toBeInTheDocument();
      });
    });

    test('should allow switching between all tabs including leads', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dailyMetrics: [],
            timeSeriesData: null,
            summary: {
              totalSessions: 300,
              totalInteractions: 1500,
              totalLeads: 25,
              contactFormSubmissions: 15,
              phoneClicks: 7,
              whatsappClicks: 3
            }
          }
        })
      });

      render(<AdminAnalyticsPage />);
      
      await waitFor(() => {
        // Test all tabs
        const overviewTab = screen.getByText('📊 Overview');
        const trendsTab = screen.getByText('📈 Trends');
        const performanceTab = screen.getByText('🎯 Performance');
        const leadsTab = screen.getByText('📞 Leads');
        const dataTab = screen.getByText('📋 Data');

        // Click each tab
        fireEvent.click(overviewTab);
        expect(screen.getByText('Performance Overview')).toBeInTheDocument();

        fireEvent.click(trendsTab);
        expect(screen.getByText('Trend Analysis')).toBeInTheDocument();

        fireEvent.click(performanceTab);
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

        fireEvent.click(leadsTab);
        expect(screen.getByText('Lead Generation Analytics')).toBeInTheDocument();

        fireEvent.click(dataTab);
        expect(screen.getByText('Raw Data View')).toBeInTheDocument();
      });
    });
  });
});
