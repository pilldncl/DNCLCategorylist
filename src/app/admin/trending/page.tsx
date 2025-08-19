'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  username: string;
  role: 'admin' | 'user';
  token: string;
}

interface TrendingProduct {
  productId: string;
  name: string;
  brand: string;
  trendingScore: number;
  totalViews: number;
  totalClicks: number;
  totalSearches: number;
  hasFireBadge?: boolean;
  fireBadgePosition?: number | 'new';
  fireBadgeTimeRemaining?: number;
  lastInteraction: string;
}

interface TrendingResponse {
  trending: TrendingProduct[];
  totalProducts: number;
  lastUpdated: string;
  cached?: boolean;
  config?: {
    updateInterval: number;
    isEnabled: boolean;
  };
}

export default function TrendingPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [totalProducts, setTotalProducts] = useState(0);
  const router = useRouter();

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
      loadTrendingData();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadTrendingData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Force refresh to get latest data
      const response = await fetch('/api/ranking/trending?force=true');
      const data: TrendingResponse = await response.json();
      
      if (data.trending) {
        setTrendingProducts(data.trending);
        setTotalProducts(data.totalProducts);
        setLastUpdated(data.lastUpdated);
        setConfig(data.config);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Invalid response format from trending API');
      }
    } catch (error) {
      console.error('Error loading trending data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTrendingData();
  };

  const handleForceUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forceUpdate' })
      });
      
      if (response.ok) {
        await loadTrendingData();
      } else {
        setError('Failed to force update trending data');
      }
    } catch (error) {
      console.error('Error forcing update:', error);
      setError('Failed to force update trending data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all trending data? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await fetch('/api/ranking/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'forceClear' })
        });
        
        if (response.ok) {
          setTrendingProducts([]);
          setTotalProducts(0);
          setLastUpdated(new Date().toISOString());
          setError('');
        } else {
          setError('Failed to clear trending data');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        setError('Failed to clear trending data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDebugMetrics = async () => {
    try {
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'debugMetrics' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Debug Metrics:', data.debug);
        alert(`Debug info logged to console. Total products: ${data.debug.totalProducts}`);
      }
    } catch (error) {
      console.error('Error getting debug metrics:', error);
    }
  };

  const formatTimeRemaining = (milliseconds: number) => {
    if (!milliseconds) return 'N/A';
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getFireBadgeLabel = (position: number | 'new') => {
    if (position === 'new') return 'NEW';
    return `#${position}`;
  };

  const getFireBadgeColor = (position: number | 'new') => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    if (position === 2) return 'bg-gradient-to-r from-orange-400 to-red-500 text-white';
    if (position === 3) return 'bg-gradient-to-r from-red-400 to-pink-500 text-white';
    if (position === 'new') return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white';
    return 'bg-gray-500 text-white';
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

  const totalInteractions = trendingProducts.reduce((sum, product) => 
    sum + product.totalViews + product.totalClicks + product.totalSearches, 0
  );

  const avgScore = trendingProducts.length > 0 
    ? (trendingProducts.reduce((sum, product) => sum + product.trendingScore, 0) / trendingProducts.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trending Products</h1>
              <p className="text-gray-600">
                Monitor trending product performance and interactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleDebugMetrics}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Debug Metrics
              </button>
              <button
                onClick={handleForceUpdate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Force Update
              </button>
              <button
                onClick={handleClearData}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Clear Data
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">🔥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trending Products</p>
                <p className="text-2xl font-bold text-gray-900">{trendingProducts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">📊</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalInteractions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">⭐</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">🕒</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-2xl">⚙️</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-sm font-bold text-gray-900">
                  {config?.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Products List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Trending Products ({trendingProducts.length})
            </h2>
            <p className="text-sm text-gray-600">
              Products ranked by trending score and interaction volume
            </p>
          </div>
          <div className="overflow-x-auto">
            {trendingProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trending products</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start interacting with products to see trending data.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trending Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fire Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Interaction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendingProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.brand}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-medium">{product.trendingScore.toFixed(1)}</span>
                          <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((product.trendingScore / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-xs space-y-1">
                          <div>👁️ {product.totalViews} views</div>
                          <div>🖱️ {product.totalClicks} clicks</div>
                          <div>🔍 {product.totalSearches} searches</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.hasFireBadge && product.fireBadgePosition ? (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFireBadgeColor(product.fireBadgePosition)} animate-pulse`}>
                              🔥 {getFireBadgeLabel(product.fireBadgePosition)}
                            </span>

                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.lastInteraction ? new Date(product.lastInteraction).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How Trending Works</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>Trending Score:</strong> Calculated based on user interactions (views, clicks, searches)</p>
            <p>• <strong>Interaction Weight:</strong> Product views (3.0), Clicks (5.0), Searches (1.5)</p>
            <p>• <strong>Time Decay:</strong> Recent interactions have higher weight (1 week decay period)</p>
            <p>• <strong>Fire Badges:</strong> Top 3 products get fire badges with time limits (2h, 1h, 30m)</p>
            <p>• <strong>Auto-Update:</strong> Scores are recalculated automatically as users interact with products</p>
            <p>• <strong>Cache:</strong> Data is cached for 5 minutes to improve performance</p>
          </div>
        </div>

        {/* Configuration Panel */}
        {config && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-900 mb-3">System Configuration</h3>
            <div className="text-sm text-green-800 space-y-2">
              <p>• <strong>Status:</strong> {config.isEnabled ? 'Enabled' : 'Disabled'}</p>
              <p>• <strong>Update Interval:</strong> {config.updateInterval} minutes</p>
              <p>• <strong>Total Products Tracked:</strong> {totalProducts}</p>
              <p>• <strong>Last Update:</strong> {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
