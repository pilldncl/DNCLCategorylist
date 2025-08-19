'use client';

import { useState, useEffect } from 'react';
import { CatalogItem } from '@/types/catalog';
import { ProductRanking } from '@/types/ranking';
import { useRanking } from '@/hooks/useRanking';
import Image from 'next/image';

interface RankingDisplayProps {
  items: CatalogItem[];
  showTrending?: boolean;
  showTopProducts?: boolean;
  showRankingScores?: boolean;
}

export default function RankingDisplay({ 
  items, 
  showTrending = true, 
  showTopProducts = true,
  showRankingScores = false 
}: RankingDisplayProps) {
  const {
    topProducts,
    trendingProducts,
    trackProductView,
    trackResultClick,
    sessionId
  } = useRanking(items);

  const [activeTab, setActiveTab] = useState<'trending' | 'top'>('trending');

  // Track page view when component mounts
  useEffect(() => {
    if (items.length > 0) {
      trackProductView(items[0].id, sessionId);
    }
  }, [items, trackProductView, sessionId]);

  const handleProductClick = (productId: string) => {
    trackResultClick(productId, sessionId);
  };

  const renderProductCard = (ranking: ProductRanking, index: number) => {
    const item = items.find(i => i.id === ranking.productId);
    if (!item) return null;

    return (
      <div 
        key={ranking.productId}
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleProductClick(ranking.productId)}
      >
        <div className="flex items-center space-x-3">
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              index < 3 ? 'bg-yellow-500' : 'bg-gray-500'
            }`}>
              {index + 1}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-xs text-gray-500">{item.brand}</p>
            {showRankingScores && (
              <p className="text-xs text-blue-600">
                Score: {ranking.score.toFixed(2)}
              </p>
            )}
          </div>

          {/* Metrics */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-500">
              <div>Views: {ranking.metrics.productViews}</div>
              <div>Clicks: {ranking.metrics.resultClicks}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!showTrending && !showTopProducts) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Popular Products</h2>
        
        {/* Tab Navigation */}
        {showTrending && showTopProducts && (
          <div className="flex space-x-1 bg-white rounded-lg p-1">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'trending'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'top'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Top Rated
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'trending' && showTrending && (
          <>
            {trendingProducts.length > 0 ? (
              trendingProducts.slice(0, 5).map((ranking, index) => 
                renderProductCard(ranking, index)
              )
            ) : (
              <p className="text-gray-500 text-sm">No trending products yet</p>
            )}
          </>
        )}

        {activeTab === 'top' && showTopProducts && (
          <>
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((ranking, index) => 
                renderProductCard(ranking, index)
              )
            ) : (
              <p className="text-gray-500 text-sm">No top products yet</p>
            )}
          </>
        )}
      </div>

      {/* Show both if only one type is enabled */}
      {(!showTrending || !showTopProducts) && (
        <div className="space-y-3">
          {showTrending && trendingProducts.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-gray-700">Trending</h3>
              {trendingProducts.slice(0, 3).map((ranking, index) => 
                renderProductCard(ranking, index)
              )}
            </>
          )}
          
          {showTopProducts && topProducts.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-gray-700">Top Rated</h3>
              {topProducts.slice(0, 3).map((ranking, index) => 
                renderProductCard(ranking, index)
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
