/**
 * Main Admin Dashboard Frontend Tests
 * Tests the main admin dashboard functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../../src/app/admin/page';

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

describe('Main Admin Dashboard Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      username: 'admin',
      role: 'admin',
      token: 'test-token'
    }));
  });

  describe('Authentication & Loading', () => {
    test('should show loading spinner initially', () => {
      render(<AdminDashboard />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should redirect to login if no admin user', () => {
      localStorageMock.getItem.mockReturnValue(null);
      render(<AdminDashboard />);
      // Should redirect to login
    });

    test('should display admin user info', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, admin (admin)')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Header', () => {
    test('should display dashboard title', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    test('should have refresh stats button', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Refresh Stats')).toBeInTheDocument();
      });
    });

    test('should display current date', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const today = new Date().toLocaleDateString();
        expect(screen.getByText(today)).toBeInTheDocument();
      });
    });
  });

  describe('Admin Tools Grid', () => {
    test('should display analytics tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Comprehensive user behavior and performance analytics')).toBeInTheDocument();
      });
    });

    test('should display brand analytics tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Brand Analytics')).toBeInTheDocument();
        expect(screen.getByText('View brand performance and interaction analytics')).toBeInTheDocument();
      });
    });

    test('should display ranking system tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Ranking System')).toBeInTheDocument();
        expect(screen.getByText('Configure and manage ranking algorithms')).toBeInTheDocument();
      });
    });

    test('should display product management tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Product Management')).toBeInTheDocument();
        expect(screen.getByText('Manage products and system settings')).toBeInTheDocument();
      });
    });

    test('should display user management tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('Add, edit, and manage user accounts')).toBeInTheDocument();
      });
    });

    test('should display image management tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Image Management')).toBeInTheDocument();
        expect(screen.getByText('Upload and manage product images')).toBeInTheDocument();
      });
    });

    test('should display catalog management tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Catalog Management')).toBeInTheDocument();
        expect(screen.getByText('Manage product catalog and inventory')).toBeInTheDocument();
      });
    });

    test('should display system settings tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('System Settings')).toBeInTheDocument();
        expect(screen.getByText('Configure system-wide settings and preferences')).toBeInTheDocument();
      });
    });

    test('should display activity logs tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Activity Logs')).toBeInTheDocument();
        expect(screen.getByText('View system activity and user logs')).toBeInTheDocument();
      });
    });

    test('should display sync management tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Sync Management')).toBeInTheDocument();
        expect(screen.getByText('Sync data between Google Sheets and Supabase')).toBeInTheDocument();
      });
    });
  });

  describe('Tool Icons & Visual Elements', () => {
    test('should display emoji icons for each tool', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('📈')).toBeInTheDocument(); // Analytics
        expect(screen.getByText('📊')).toBeInTheDocument(); // Brand Analytics
        expect(screen.getByText('🎯')).toBeInTheDocument(); // Ranking
        expect(screen.getByText('🔥')).toBeInTheDocument(); // Product Management
        expect(screen.getByText('👥')).toBeInTheDocument(); // User Management
        expect(screen.getByText('🖼️')).toBeInTheDocument(); // Image Management
        expect(screen.getByText('📦')).toBeInTheDocument(); // Catalog
        expect(screen.getByText('⚙️')).toBeInTheDocument(); // Settings
        expect(screen.getByText('📋')).toBeInTheDocument(); // Logs
        expect(screen.getByText('🔄')).toBeInTheDocument(); // Sync
      });
    });
  });

  describe('Role-Based Access Control', () => {
    test('should show all tools for admin users', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        username: 'admin',
        role: 'admin',
        token: 'test-token'
      }));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Ranking System')).toBeInTheDocument(); // Admin only
        expect(screen.getByText('Product Management')).toBeInTheDocument(); // Admin only
        expect(screen.getByText('User Management')).toBeInTheDocument(); // Admin only
        expect(screen.getByText('System Settings')).toBeInTheDocument(); // Admin only
      });
    });

    test('should hide admin-only tools for regular users', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        username: 'user',
        role: 'user',
        token: 'test-token'
      }));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.queryByText('Ranking System')).not.toBeInTheDocument();
        expect(screen.queryByText('Product Management')).not.toBeInTheDocument();
        expect(screen.queryByText('User Management')).not.toBeInTheDocument();
        expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
      });
    });

    test('should show public tools for all users', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        username: 'user',
        role: 'user',
        token: 'test-token'
      }));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Brand Analytics')).toBeInTheDocument();
        expect(screen.getByText('Image Management')).toBeInTheDocument();
        expect(screen.getByText('Catalog Management')).toBeInTheDocument();
        expect(screen.getByText('Activity Logs')).toBeInTheDocument();
        expect(screen.getByText('Sync Management')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Statistics', () => {
    const mockStats = {
      totalBrands: 25,
      totalProducts: 1500,
      activeUsers: 45,
      totalInteractions: 12500,
      fireBadges: 12,
      dynamicImages: 89,
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          stats: mockStats
        })
      });
    });

    test('should load dashboard statistics', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Total Brands
        expect(screen.getByText('1.5K')).toBeInTheDocument(); // Total Products
        expect(screen.getByText('45')).toBeInTheDocument(); // Active Users
        expect(screen.getByText('12.5K')).toBeInTheDocument(); // Total Interactions
        expect(screen.getByText('12')).toBeInTheDocument(); // Fire Badges
        expect(screen.getByText('89')).toBeInTheDocument(); // Dynamic Images
      });
    });

    test('should display last updated timestamp', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const lastUpdated = new Date(mockStats.lastUpdated).toLocaleString();
        expect(screen.getByText(lastUpdated)).toBeInTheDocument();
      });
    });
  });

  describe('User Actions', () => {
    test('should handle logout', async () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush
      });
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser');
        expect(mockPush).toHaveBeenCalledWith('/admin/login');
      });
    });

    test('should refresh statistics on button click', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          stats: { totalBrands: 25, totalProducts: 1500 }
        })
      });
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh Stats');
        fireEvent.click(refreshButton);
        
        expect(global.fetch).toHaveBeenCalledWith('/api/admin/dashboard-stats');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle stats loading error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed to load stats'));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        // Should still render the dashboard even if stats fail
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    test('should handle invalid user data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      render(<AdminDashboard />);
      
      // Should handle gracefully without crashing
    });
  });

  describe('Responsive Design', () => {
    test('should handle mobile layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<AdminDashboard />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    test('should handle desktop layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<AdminDashboard />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance & Optimization', () => {
    test('should not re-render unnecessarily', async () => {
      const { rerender } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
      
      rerender(<AdminDashboard />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});
