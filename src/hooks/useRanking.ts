import { useState, useEffect, useCallback, useMemo } from 'react';
import { CatalogItem } from '@/types/catalog';
import { ProductRanking, UserInteraction, RankingConfig, RankingFilters } from '@/types/ranking';
import { 
  trackInteraction, 
  applyRanking, 
  getTopRankedProducts, 
  searchWithRanking, 
  getTrendingProducts,
  DEFAULT_RANKING_CONFIG 
} from '@/utils/ranking';

interface UseRankingReturn {
  // Ranking data
  rankedItems: ProductRanking[];
  topProducts: ProductRanking[];
  trendingProducts: ProductRanking[];
  
  // Interaction tracking
  trackPageView: () => Promise<void>;
  trackCategoryView: (category: string) => Promise<void>;
  trackProductView: (productId: string) => Promise<void>;
  trackResultClick: (productId: string, brand?: string) => Promise<void>;
  trackSearch: (searchTerm: string) => Promise<void>;
  
  // Ranking functions
  applyRankingToItems: (items: CatalogItem[], config?: RankingConfig) => ProductRanking[];
  searchWithRanking: (items: CatalogItem[], searchTerm: string) => ProductRanking[];
  getTopProducts: (items: CatalogItem[], limit?: number) => ProductRanking[];
  getTrending: (items: CatalogItem[], days?: number, limit?: number) => ProductRanking[];
  
  // Configuration
  updateRankingConfig: (config: Partial<RankingConfig>) => void;
  rankingConfig: RankingConfig;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useRanking(
  items: CatalogItem[] = [],
  initialConfig?: Partial<RankingConfig>
): UseRankingReturn {
  const [rankingConfig, setRankingConfig] = useState<RankingConfig>({
    ...DEFAULT_RANKING_CONFIG,
    ...initialConfig
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate session ID for tracking
  const sessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ranking_session_id') || 
             `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Store session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ranking_session_id', sessionId);
    }
  }, [sessionId]);

  // Track page view
  const trackPageView = useCallback(async () => {
    try {
      await trackInteraction({
        type: 'page_view',
        sessionId
      });
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  }, [sessionId]);

  // Track category view
  const trackCategoryView = useCallback(async (category: string) => {
    try {
      await trackInteraction({
        type: 'category_view',
        category,
        sessionId
      });
    } catch (err) {
      console.error('Error tracking category view:', err);
    }
  }, [sessionId]);

  // Track product view
  const trackProductView = useCallback(async (productId: string, brand?: string) => {
    try {
      await trackInteraction({
        type: 'product_view',
        productId,
        brand,
        sessionId
      });
    } catch (err) {
      console.error('Error tracking product view:', err);
    }
  }, [sessionId]);

  // Track result click
  const trackResultClick = useCallback(async (productId: string, brand?: string) => {
    try {
      await trackInteraction({
        type: 'result_click',
        productId,
        brand,
        sessionId
      });
    } catch (err) {
      console.error('Error tracking result click:', err);
    }
  }, [sessionId]);

  // Track search
  const trackSearch = useCallback(async (searchTerm: string) => {
    try {
      await trackInteraction({
        type: 'search',
        searchTerm,
        sessionId
      });
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  }, [sessionId]);

  // Apply ranking to items
  const applyRankingToItems = useCallback((items: CatalogItem[], config?: RankingConfig) => {
    try {
      return applyRanking(items, config || rankingConfig);
    } catch (err) {
      console.error('Error applying ranking:', err);
      return [];
    }
  }, [rankingConfig]);

  // Search with ranking
  const searchWithRankingResults = useCallback((items: CatalogItem[], searchTerm: string) => {
    try {
      return searchWithRanking(items, searchTerm, rankingConfig);
    } catch (err) {
      console.error('Error searching with ranking:', err);
      return [];
    }
  }, [rankingConfig]);

  // Get top products
  const getTopProducts = useCallback((items: CatalogItem[], limit: number = 10) => {
    try {
      return getTopRankedProducts(items, limit, rankingConfig);
    } catch (err) {
      console.error('Error getting top products:', err);
      return [];
    }
  }, [rankingConfig]);

  // Get trending products
  const getTrending = useCallback((items: CatalogItem[], days: number = 7, limit: number = 10) => {
    try {
      return getTrendingProducts(items, days, limit);
    } catch (err) {
      console.error('Error getting trending products:', err);
      return [];
    }
  }, []);

  // Update ranking configuration
  const updateRankingConfig = useCallback((config: Partial<RankingConfig>) => {
    setRankingConfig(prev => ({ ...prev, ...config }));
  }, []);

  // Memoized computed values
  const rankedItems = useMemo(() => {
    return applyRankingToItems(items);
  }, [items, applyRankingToItems]);

  const topProducts = useMemo(() => {
    return getTopProducts(items, 10);
  }, [items, getTopProducts]);

  const trendingProducts = useMemo(() => {
    return getTrending(items, 7, 10);
  }, [items, getTrending]);

  return {
    // Ranking data
    rankedItems,
    topProducts,
    trendingProducts,
    
    // Interaction tracking
    trackPageView,
    trackCategoryView,
    trackProductView,
    trackResultClick,
    trackSearch,
    
    // Ranking functions
    applyRankingToItems,
    searchWithRanking: searchWithRankingResults,
    getTopProducts,
    getTrending,
    
    // Configuration
    updateRankingConfig,
    rankingConfig,
    
    // State
    loading,
    error
  };
}

// Hook for ranking analytics
interface UseRankingAnalyticsReturn {
  getPopularCategories: () => { category: string; count: number }[];
  getPopularBrands: () => { brand: string; count: number }[];
  getSearchTrends: () => { term: string; count: number }[];
  getConversionRates: () => { productId: string; rate: number }[];
}

export function useRankingAnalytics(): UseRankingAnalyticsReturn {
  const getPopularCategories = useCallback(() => {
    // This would analyze interactions to find popular categories
    // Implementation would depend on your data structure
    return [];
  }, []);

  const getPopularBrands = useCallback(() => {
    // This would analyze interactions to find popular brands
    return [];
  }, []);

  const getSearchTrends = useCallback(() => {
    // This would analyze search interactions
    return [];
  }, []);

  const getConversionRates = useCallback(() => {
    // This would calculate conversion rates from interactions
    return [];
  }, []);

  return {
    getPopularCategories,
    getPopularBrands,
    getSearchTrends,
    getConversionRates
  };
}
