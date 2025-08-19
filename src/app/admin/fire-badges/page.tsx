'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FireBadge {
  productId: string;
  position: number | 'new';
  startTime: string;
  endTime: string;
  isActive: boolean;
  timeRemaining?: number;
}

interface TrendingProduct {
  productId: string;
  name: string;
  brand: string;
  trendingScore: number;
  hasFireBadge: boolean;
  fireBadgePosition?: number | 'new';
  fireBadgeTimeRemaining?: number;
}

export default function FireBadgesPage() {
  const [fireBadges, setFireBadges] = useState<FireBadge[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFireBadges();
  }, []);

  const fetchFireBadges = async () => {
    try {
      setLoading(true);
      
      // Fetch trending data which includes fire badge information
      const response = await fetch('/api/ranking/trending?force=true');
      if (!response.ok) {
        throw new Error('Failed to fetch fire badges');
      }
      
      const data = await response.json();
      setTrendingProducts(data.trending || []);
      
      // Extract fire badges from trending data
      const badges: FireBadge[] = data.trending
        .filter((product: TrendingProduct) => product.hasFireBadge)
        .map((product: TrendingProduct) => ({
          productId: product.productId,
          position: product.fireBadgePosition!,
          startTime: new Date().toISOString(), // We don't have exact start time in API
          endTime: new Date(Date.now() + (product.fireBadgeTimeRemaining || 0)).toISOString(),
          isActive: true,
          timeRemaining: product.fireBadgeTimeRemaining
        }));
      
      setFireBadges(badges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fire badges');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getPositionLabel = (position: number | 'new') => {
    if (position === 'new') return 'NEW';
    return `#${position}`;
  };

  const getPositionColor = (position: number | 'new') => {
    switch (position) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-red-600 bg-red-100';
      case 'new': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeStyle = (position: number | 'new') => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 2: return 'bg-gradient-to-r from-orange-400 to-red-500';
      case 3: return 'bg-gradient-to-r from-red-400 to-pink-500';
      case 'new': return 'bg-gradient-to-r from-blue-400 to-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fire badges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchFireBadges} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔥 Fire Badge Management</h1>
              <p className="mt-2 text-gray-600">Monitor and manage dynamic fire badges for trending products</p>
            </div>
            <button
              onClick={fetchFireBadges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fire Badges</p>
                <p className="text-2xl font-bold text-gray-900">{fireBadges.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🥇</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Position #1</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fireBadges.filter(b => b.position === 1).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🥈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Position #2</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fireBadges.filter(b => b.position === 2).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🆕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fireBadges.filter(b => b.position === 'new').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fire Badges Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Active Fire Badges</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time status of all active fire badges</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trending Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fireBadges.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🔥</span>
                        <p className="text-lg font-medium">No active fire badges</p>
                        <p className="text-sm">Fire badges will appear here when products become trending</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fireBadges.map((badge) => {
                    const product = trendingProducts.find(p => p.productId === badge.productId);
                    const timeRemaining = badge.timeRemaining || 0;
                    const isExpiringSoon = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes
                    
                    return (
                      <tr key={badge.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product?.name || badge.productId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product?.brand || 'Unknown Brand'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(badge.position)}`}>
                            {getPositionLabel(badge.position)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product?.trendingScore || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getBadgeStyle(badge.position)}`}>
                              🔥
                            </span>
                            <span className="ml-2 text-sm text-gray-900">
                              {badge.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fire Badge Rules */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔥 Fire Badge Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Position-Based Badges</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-yellow-400 to-orange-500 mr-2">🔥 #1</span>
                  <span>2 hours duration</span>
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-orange-400 to-red-500 mr-2">🔥 #2</span>
                  <span>1 hour duration</span>
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-red-400 to-pink-500 mr-2">🔥 #3</span>
                  <span>30 minutes duration</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">New Item Badges</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-400 to-purple-500 mr-2">🔥 NEW</span>
                  <span>1 hour duration for new items</span>
                </li>
                <li>• Items with interactions within 24 hours</li>
                <li>• Appears after top 3 trending products</li>
                <li>• Automatically expires after 1 hour</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
