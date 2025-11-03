'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RankingConfig } from '@/types/ranking';
import { useRanking } from '@/hooks/useRanking';
import { formatTimestamp } from '@/utils/dateFormatting';

export default function RankingAnalyticsPage() {
  const [interactionStats, setInteractionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { rankingConfig, updateRankingConfig } = useRanking();
  const router = useRouter();

  // Load interaction statistics
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ranking/track');
      if (!response.ok) {
        throw new Error('Failed to load interaction stats');
      }
      const data = await response.json();
      setInteractionStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleConfigUpdate = (key: keyof RankingConfig['weights'], value: number) => {
    updateRankingConfig({
      weights: {
        ...rankingConfig.weights,
        [key]: value
      }
    });
  };

  const handleDecayFactorUpdate = (value: number) => {
    updateRankingConfig({
      decayFactor: value
    });
  };

  const handleMinInteractionsUpdate = (value: number) => {
    updateRankingConfig({
      minInteractions: value
    });
  };

  const handleBrandWeightUpdate = (brand: string, value: number) => {
    updateRankingConfig({
      brandWeights: {
        ...rankingConfig.brandWeights,
        [brand]: value
      }
    });
  };

  const handleBaseScoreUpdate = (value: number) => {
    updateRankingConfig({
      defaultBaseScore: value
    });
  };

  const handleStrategyUpdate = (strategy: 'default' | 'interaction_only' | 'hybrid') => {
    updateRankingConfig({
      baseScoreStrategy: strategy
    });
  };

  const handleTimeDecayUpdate = (checked: boolean) => {
    updateRankingConfig({
      timeDecayEnabled: checked
    });
  };

  if (loading) {
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Admin</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking Analytics</h1>
                <p className="text-gray-600">Monitor and configure your product ranking system</p>
              </div>
            </div>
                                               <div className="flex space-x-3">
               <button
                 onClick={() => router.push('/admin/ranking/brands')}
                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 <span>Brand Analytics</span>
               </button>
               {/* Trending Management button removed */}
             </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Interaction Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Interactions</h3>
            <p className="text-3xl font-bold text-blue-600">
              {interactionStats?.totalInteractions || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Views</h3>
            <p className="text-3xl font-bold text-green-600">
              {interactionStats?.byType?.page_view || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Views</h3>
            <p className="text-3xl font-bold text-purple-600">
              {interactionStats?.byType?.product_view || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Result Clicks</h3>
            <p className="text-3xl font-bold text-orange-600">
              {interactionStats?.byType?.result_click || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Searches</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {interactionStats?.byType?.search || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Views</h3>
            <p className="text-3xl font-bold text-teal-600">
              {interactionStats?.byType?.category_view || 0}
            </p>
          </div>
        </div>

                 {/* Ranking Configuration */}
         <div className="bg-white rounded-lg shadow p-6 mb-8">
           <h2 className="text-xl font-semibold text-gray-900 mb-6">Ranking Configuration</h2>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weight Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Weights</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Views Weight: {rankingConfig.weights.pageViews}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.pageViews}
                    onChange={(e) => handleConfigUpdate('pageViews', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Views Weight: {rankingConfig.weights.categoryViews}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.categoryViews}
                    onChange={(e) => handleConfigUpdate('categoryViews', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Views Weight: {rankingConfig.weights.productViews}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.productViews}
                    onChange={(e) => handleConfigUpdate('productViews', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result Clicks Weight: {rankingConfig.weights.resultClicks}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.resultClicks}
                    onChange={(e) => handleConfigUpdate('resultClicks', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Searches Weight: {rankingConfig.weights.searches}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.searches}
                    onChange={(e) => handleConfigUpdate('searches', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recency Weight: {rankingConfig.weights.recency}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rankingConfig.weights.recency}
                    onChange={(e) => handleConfigUpdate('recency', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

                         {/* System Configuration */}
             <div>
               <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Decay Factor: {rankingConfig.decayFactor}
                   </label>
                   <input
                     type="range"
                     min="0.8"
                     max="0.99"
                     step="0.01"
                     value={rankingConfig.decayFactor}
                     onChange={(e) => handleDecayFactorUpdate(parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     How quickly old interactions lose weight (higher = slower decay)
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Minimum Interactions: {rankingConfig.minInteractions}
                   </label>
                   <input
                     type="range"
                     min="1"
                     max="20"
                     step="1"
                     value={rankingConfig.minInteractions}
                     onChange={(e) => handleMinInteractionsUpdate(parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Minimum interactions before ranking applies
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Default Base Score: {rankingConfig.defaultBaseScore || 50}
                   </label>
                   <input
                     type="range"
                     min="0"
                     max="100"
                     step="5"
                     value={rankingConfig.defaultBaseScore || 50}
                     onChange={(e) => handleBaseScoreUpdate(parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Base score for products with no interactions
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Ranking Strategy
                   </label>
                   <select
                     value={rankingConfig.baseScoreStrategy || 'hybrid'}
                     onChange={(e) => handleStrategyUpdate(e.target.value as 'default' | 'interaction_only' | 'hybrid')}
                     className="w-full p-2 border border-gray-300 rounded-md"
                   >
                     <option value="default">Default (Base + Interactions)</option>
                     <option value="interaction_only">Interaction Only</option>
                     <option value="hybrid">Hybrid (Smart Default)</option>
                   </select>
                   <p className="text-xs text-gray-500 mt-1">
                     How to handle products with no interactions
                   </p>
                 </div>

                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     id="timeDecay"
                     checked={rankingConfig.timeDecayEnabled !== false}
                     onChange={(e) => handleTimeDecayUpdate(e.target.checked)}
                     className="mr-2"
                   />
                   <label htmlFor="timeDecay" className="text-sm font-medium text-gray-700">
                     Enable Time Decay
                   </label>
                 </div>
               </div>
             </div>

             {/* Brand Configuration */}
             <div>
               <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Ranking Weights</h3>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Google Brand Weight: {rankingConfig.brandWeights?.google || 1.0}
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2.0"
                     step="0.1"
                     value={rankingConfig.brandWeights?.google || 1.0}
                     onChange={(e) => handleBrandWeightUpdate('google', parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Multiplier for Google products (1.0 = normal)
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Apple Brand Weight: {rankingConfig.brandWeights?.apple || 1.0}
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2.0"
                     step="0.1"
                     value={rankingConfig.brandWeights?.apple || 1.0}
                     onChange={(e) => handleBrandWeightUpdate('apple', parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Multiplier for Apple products (1.0 = normal)
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Samsung Brand Weight: {rankingConfig.brandWeights?.samsung || 1.0}
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2.0"
                     step="0.1"
                     value={rankingConfig.brandWeights?.samsung || 1.0}
                     onChange={(e) => handleBrandWeightUpdate('samsung', parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Multiplier for Samsung products (1.0 = normal)
                   </p>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Default Brand Weight: {rankingConfig.brandWeights?.default || 1.0}
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2.0"
                     step="0.1"
                     value={rankingConfig.brandWeights?.default || 1.0}
                     onChange={(e) => handleBrandWeightUpdate('default', parseFloat(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Multiplier for all other brands (1.0 = normal)
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </div>

        {/* Recent Interactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Interactions</h2>
          
          {interactionStats?.recentInteractions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product/Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interactionStats.recentInteractions.map((interaction: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {interaction.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {interaction.productId || interaction.brand || interaction.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {interaction.sessionId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(interaction.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent interactions</p>
          )}
        </div>

        {/* Enhanced Ranking Link */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Enhanced Ranking Features</h3>
              <p className="text-sm text-gray-600">Access advanced multi-layer ranking, personalization, and analytics</p>
            </div>
            <button
              disabled
              className="px-6 py-2 bg-gray-400 text-gray-600 rounded-lg cursor-not-allowed opacity-50 transition-all duration-200"
              title="Enhanced Ranking is currently disabled"
            >
              Configure Enhanced Ranking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
