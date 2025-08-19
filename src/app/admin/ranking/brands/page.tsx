'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BrandAnalytics {
  brand: string;
  totalInteractions: number;
  brandScore: number;
  productCount: number;
  interactionBreakdown: {
    pageViews: number;
    categoryViews: number;
    productViews: number;
    resultClicks: number;
    searches: number;
  };
  conversionRate: number;
  averagePrice: number;
  topProducts: Array<{
    productId: string;
    name: string;
    views: number;
    clicks: number;
    score: number;
  }>;
  recentInteractions: Array<{
    type: string;
    productId?: string;
    searchTerm?: string;
    timestamp: string;
  }>;
  performanceMetrics: {
    engagementRate: number;
    searchToClickRate: number;
    viewToClickRate: number;
  };
  lastUpdated: string;
}

interface BrandData {
  brand: string;
  analytics: BrandAnalytics;
  productCount: number;
}

interface BrandAnalyticsResponse {
  success: boolean;
  brands: BrandData[];
  totalBrands: number;
  totalProducts: number;
  lastUpdated: string;
  summary?: {
    totalInteractions: number;
    brandsWithInteractions: number;
    topPerformingBrand: string;
  };
}

export default function BrandRankingPage() {
  const [brandsData, setBrandsData] = useState<BrandAnalyticsResponse | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandDetails, setBrandDetails] = useState<BrandAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const router = useRouter();

  // Load brand analytics data
  const loadBrandAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ranking/brands');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load brand analytics`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load brand analytics');
      }
      setBrandsData(data);
    } catch (err) {
      console.error('Error loading brand analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brand analytics');
    } finally {
      setLoading(false);
    }
  };

  // Load specific brand details
  const loadBrandDetails = async (brand: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/ranking/brands?brand=${encodeURIComponent(brand)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load brand details`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load brand details');
      }
      setBrandDetails(data);
      setSelectedBrand(brand);
    } catch (err) {
      console.error('Error loading brand details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brand details');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    loadBrandAnalytics();
    if (selectedBrand) {
      loadBrandDetails(selectedBrand);
    }
  };

  useEffect(() => {
    loadBrandAnalytics();
  }, [refreshKey]);

  if (loading && !brandsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Analytics</h1>
              <p className="text-gray-600">
                Dynamic ranking analytics by brand with weighted interaction scoring
              </p>
              {brandsData && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(brandsData.lastUpdated).toLocaleString()} | 
                  {brandsData.totalBrands} brands | {brandsData.totalProducts} products
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Admin</span>
              </button>
              <button
                onClick={() => router.push('/admin/ranking')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Ranking</span>
              </button>
              <button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Brand Overview Cards */}
        {brandsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Brands</h3>
              <p className="text-3xl font-bold text-blue-600">{brandsData.totalBrands}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-green-600">{brandsData.totalProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Brands</h3>
              <p className="text-3xl font-bold text-purple-600">
                {brandsData.brands.filter(b => b.analytics.totalInteractions > 0).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Interactions</h3>
              <p className="text-3xl font-bold text-orange-600">
                {brandsData.brands.reduce((sum, b) => sum + b.analytics.totalInteractions, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Brand Score</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {brandsData.brands.reduce((sum, b) => sum + b.analytics.brandScore, 0)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Brands</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {brandsData?.brands.map((brandData) => (
                  <div
                    key={brandData.brand}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBrand === brandData.brand
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => loadBrandDetails(brandData.brand)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{brandData.brand}</h3>
                        <p className="text-sm text-gray-500">
                          {brandData.productCount} products
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {brandData.analytics.brandScore}
                        </p>
                        <p className="text-xs text-gray-500">score</p>
                        <p className="text-xs text-gray-400">
                          {brandData.analytics.totalInteractions} interactions
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Details */}
          <div className="lg:col-span-2">
            {selectedBrand && brandDetails ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBrand}</h2>
                  <span className="text-sm text-gray-500">
                    {brandDetails.brand.productCount} products
                  </span>
                </div>

                {/* Brand Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {brandDetails.brand.brandScore}
                    </p>
                    <p className="text-sm text-gray-600">Brand Score</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {brandDetails.brand.totalInteractions}
                    </p>
                    <p className="text-sm text-gray-600">Total Interactions</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {brandDetails.brand.interactionBreakdown.productViews}
                    </p>
                    <p className="text-sm text-gray-600">Product Views</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {brandDetails.brand.interactionBreakdown.resultClicks}
                    </p>
                    <p className="text-sm text-gray-600">Result Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">
                      {(brandDetails.brand.conversionRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                </div>

                {/* Interaction Breakdown */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">
                        {brandDetails.brand.interactionBreakdown.pageViews}
                      </p>
                      <p className="text-xs text-gray-600">Page Views</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">
                        {brandDetails.brand.interactionBreakdown.categoryViews}
                      </p>
                      <p className="text-xs text-gray-600">Category Views</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">
                        {brandDetails.brand.interactionBreakdown.productViews}
                      </p>
                      <p className="text-xs text-gray-600">Product Views</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">
                        {brandDetails.brand.interactionBreakdown.resultClicks}
                      </p>
                      <p className="text-xs text-gray-600">Result Clicks</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">
                        {brandDetails.brand.interactionBreakdown.searches}
                      </p>
                      <p className="text-xs text-gray-600">Searches</p>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                  {brandDetails.brand.topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {brandDetails.brand.topProducts.map((product: any, index: number) => (
                        <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index < 3 ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">
                                {product.views} views, {product.clicks} clicks
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Score: {product.score}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No interaction data for products yet</p>
                  )}
                </div>

                {/* Product List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Products</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {brandDetails.products && Array.isArray(brandDetails.products) ? (
                          brandDetails.products.map((product: any) => (
                            <tr key={product.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${product.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.grade}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.minQty}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No products available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No brand selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a brand from the list to view detailed analytics
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
