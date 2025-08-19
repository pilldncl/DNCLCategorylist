'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  username: string;
  role: 'admin' | 'user';
  token: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalBrands: number;
    totalProducts: number;
    trendingProducts: number;
    activeUsers: number;
    totalInteractions: number;
    fireBadges: number;
    dynamicImages: number;
    lastUpdated: string;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      // Load dashboard stats after user is authenticated
      loadDashboardStats();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
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

  const adminTools = [
    {
      title: 'Brand Analytics',
      description: 'View brand performance and interaction analytics',
      href: '/admin/ranking/brands',
      icon: '📊',
      adminOnly: false
    },
    {
      title: 'Ranking System',
      description: 'Configure and manage ranking algorithms',
      href: '/admin/ranking',
      icon: '🎯',
      adminOnly: true
    },
    {
      title: 'Trending Products',
      description: 'Monitor and manage trending product data',
      href: '/admin/trending',
      icon: '🔥',
      adminOnly: false
    },
    {
      title: 'User Management',
      description: 'Add, edit, and manage user accounts',
      href: '/admin/users',
      icon: '👥',
      adminOnly: true
    },
    {
      title: 'Image Management',
      description: 'Upload and manage product images',
      href: '/admin/images',
      icon: '🖼️',
      adminOnly: false
    },
    {
      title: 'Catalog Management',
      description: 'Manage product catalog and inventory',
      href: '/admin/catalog',
      icon: '📦',
      adminOnly: true
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      href: '/admin/settings',
      icon: '⚙️',
      adminOnly: true
    },
    {
      title: 'Activity Logs',
      description: 'View system activity and user logs',
      href: '/admin/logs',
      icon: '📋',
      adminOnly: true
    },
    {
      title: 'Sync Management',
      description: 'Sync data between Google Sheets and Supabase',
      href: '/admin/sync',
      icon: '🔄',
      adminOnly: true
    },
    {
      title: 'Fire Badges',
      description: 'Monitor and manage dynamic fire badges',
      href: '/admin/fire-badges',
      icon: '🔥',
      adminOnly: true
    }
  ];

  const filteredTools = adminTools.filter(tool => 
    user.role === 'admin' || !tool.adminOnly
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user.username} ({user.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardStats}
                disabled={statsLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{statsLoading ? 'Refreshing...' : 'Refresh Stats'}</span>
              </button>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">📊</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Brands</p>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalBrands || 0}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">🔥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trending Products</p>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.trendingProducts || 0}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">👥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users (24h)</p>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">📦</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="text-2xl">🖱️</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInteractions || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="text-2xl">🏆</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Fire Badges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.fireBadges || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="text-2xl">🖼️</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dynamic Images</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.dynamicImages || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated Info */}
        {stats && !statsLoading && (
          <div className="mb-6 text-sm text-gray-500 text-center">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        )}

        {/* Admin Tools */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Admin Tools</h2>
            <p className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Full access to all tools' : 'Limited access - view only'}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div
                  key={tool.title}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(tool.href)}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{tool.icon}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{tool.title}</h3>
                      {tool.adminOnly && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin Only
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <span>Access Tool</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Brand analytics updated</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New trending product detected</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">User login: john.doe</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
