import { useState, useEffect, useCallback } from 'react';

interface TrendingProduct {
  productId: string;
  brand: string;
  name: string;
  description?: string;
  grade?: string;
  minQty?: number;
  totalViews: number;
  totalClicks: number;
  totalSearches: number;
  lastInteraction: string;
  trendingScore: number;
  hasFireBadge?: boolean;
  fireBadgePosition?: number | string;
  fireBadgeTimeRemaining?: number;
}

interface TrendingResponse {
  trending: TrendingProduct[];
  totalProducts: number;
  lastUpdated: string;
}

interface UseTrendingProductsReturn {
  trendingProducts: TrendingProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export function useTrendingProducts(limit: number = 5): UseTrendingProductsReturn {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ranking/trending-db?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending products');
      }
      
      const data: TrendingResponse = await response.json();
      setTrendingProducts(data.trending);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending products');
      console.error('Error fetching trending products:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(async () => {
    await fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  useEffect(() => {
    fetchTrendingProducts();
    
    // Refresh trending products every 5 minutes
    const interval = setInterval(fetchTrendingProducts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchTrendingProducts]);

  return {
    trendingProducts,
    loading,
    error,
    refresh,
    lastUpdated
  };
}
