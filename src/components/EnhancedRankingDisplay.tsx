'use client';

import { useState } from 'react';
import { CatalogItem } from '@/types/catalog';
import { MultiLayerRanking } from '@/types/ranking';
import { useEnhancedRanking } from '@/hooks/useEnhancedRanking';

interface EnhancedRankingDisplayProps {
  items: CatalogItem[];
  showMultiLayer?: boolean;
  showPersonalization?: boolean;
  showAnalytics?: boolean;
  showSegmentInsights?: boolean;
}

export default function EnhancedRankingDisplay({ 
  items, 
  showMultiLayer = true,
  showPersonalization = true,
  showAnalytics = true,
  showSegmentInsights = true
}: EnhancedRankingDisplayProps) {
  const {
    applyEnhancedRanking,
    getMultiLayerRanking,
    personalizedRanking,
    userSegment,
    recommendations,
    analytics
  } = useEnhancedRanking(items);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ranking' | 'personalization' | 'analytics' | 'segments'>('ranking');

  // Apply enhanced ranking
  const rankedItems = applyEnhancedRanking(items);

  // Get multi-layer ranking for selected product
  const selectedProductRanking = selectedProduct ? getMultiLayerRanking(selectedProduct) : null;

  const renderMultiLayerBreakdown = (ranking: MultiLayerRanking) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Layer Breakdown</h4>
          <div className="text-xs text-gray-500">
            Confidence: {(ranking.confidence * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="space-y-2">
          {ranking.layers.map((layer) => (
            <div key={layer.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">{layer.name}</div>
                  <div className="text-xs text-gray-500">{layer.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-600">
                    {ranking.layerContributions[layer.id]?.toFixed(1) || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">Weight: {layer.weight}</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(ranking.layerContributions[layer.id] || 0) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Final Score</span>
            <span className="text-lg font-bold text-blue-900">
              {ranking.finalScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalization = () => {
    if (!personalizedRanking) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No personalization data yet</p>
          <p className="text-xs text-gray-400 mt-1">Interact with products to see personalized insights</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* User Segment */}
        {userSegment && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your Segment</h4>
            <div className="space-y-2">
              <div>
                <div className="text-lg font-semibold text-purple-900">{userSegment.name}</div>
                <div className="text-sm text-gray-600">{userSegment.description}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Segment Weight:</span>
                <span className="text-sm font-medium text-purple-700">{userSegment.weight}</span>
              </div>
            </div>
          </div>
        )}

        {/* Personalization Score */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Personalization Score</h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${personalizedRanking.personalizationScore}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {personalizedRanking.personalizationScore.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Products</h4>
            <div className="space-y-2">
              {recommendations.slice(0, 5).map((productId, index) => {
                const item = items.find(i => i.id === productId);
                return item ? (
                  <div key={productId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.brand}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Analytics not available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Conversion Rates */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Conversion Rates</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall</span>
              <span className="text-sm font-semibold text-green-600">
                {(analytics.conversionRates.overall * 100).toFixed(1)}%
              </span>
            </div>
            {Object.entries(analytics.conversionRates.byBrand).map(([brand, rate]) => (
              <div key={brand} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{brand}</span>
                <span className="text-sm font-semibold text-blue-600">
                  {(rate * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">User Engagement</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(analytics.userEngagement.averageSessionDuration / 60)}m
              </div>
              <div className="text-xs text-gray-500">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {analytics.userEngagement.pagesPerSession.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Pages/Session</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {(analytics.userEngagement.bounceRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Bounce Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {(analytics.userEngagement.returnRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Return Rate</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSegmentInsights = () => {
    if (!analytics?.segmentInsights) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Segment insights not available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Segment Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">User Segments</h4>
          <div className="space-y-3">
            {Object.entries(analytics.segmentInsights.segmentBreakdown).map(([segment, percentage]) => (
              <div key={segment} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {segment.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {(percentage * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Segment Preferences */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Segment Preferences</h4>
          <div className="space-y-3">
            {Object.entries(analytics.segmentInsights.segmentPreferences).map(([segment, preferences]) => (
              <div key={segment}>
                <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                  {segment.replace('_', ' ')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {preferences.map((pref) => (
                    <span key={pref} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Enhanced Ranking Insights</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1">
          {showMultiLayer && (
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'ranking'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Multi-Layer
            </button>
          )}
          {showPersonalization && (
            <button
              onClick={() => setActiveTab('personalization')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'personalization'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Personalization
            </button>
          )}
          {showAnalytics && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          )}
          {showSegmentInsights && (
            <button
              onClick={() => setActiveTab('segments')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'segments'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Segments
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'ranking' && showMultiLayer && (
          <div>
            {/* Product Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product for Analysis
              </label>
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a product...</option>
                {rankedItems.slice(0, 10).map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.name} (Score: {item.score.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-Layer Breakdown */}
            {selectedProductRanking && (
              renderMultiLayerBreakdown(selectedProductRanking)
            )}
          </div>
        )}

        {activeTab === 'personalization' && showPersonalization && (
          renderPersonalization()
        )}

        {activeTab === 'analytics' && showAnalytics && (
          renderAnalytics()
        )}

        {activeTab === 'segments' && showSegmentInsights && (
          renderSegmentInsights()
        )}
      </div>
    </div>
  );
}
