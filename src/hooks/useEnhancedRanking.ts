import { useState, useEffect, useCallback, useMemo } from 'react';
import { CatalogItem } from '@/types/catalog';
import { 
  ProductRanking, 
  UserInteraction, 
  RankingConfig,
  UserSegment,
  PersonalizedRanking,
  MultiLayerRanking,
  EnhancedRankingConfig,
  AdvancedAnalytics
} from '@/types/ranking';
import { 
  trackEnhancedInteraction, 
  calculateMultiLayerRanking,
  getPersonalizedRanking,
  getSegmentAnalytics,
  clearSessionData,
  ENHANCED_RANKING_CONFIG
} from '@/utils/enhancedRanking';

interface UseEnhancedRankingReturn {
  // Core ranking functions
  applyEnhancedRanking: (items: CatalogItem[]) => ProductRanking[];
  getMultiLayerRanking: (productId: string) => MultiLayerRanking;
  
  // Personalization
  personalizedRanking: PersonalizedRanking | undefined;
  userSegment: UserSegment | undefined;
  recommendations: string[];
  
  // Analytics
  analytics: AdvancedAnalytics | undefined;
  segmentAnalytics: Map<string, any>;
  
  // Interaction tracking
  trackEnhancedPageView: () => Promise<void>;
  trackEnhancedProductView: (productId: string, brand?: string) => Promise<void>;
  trackEnhancedResultClick: (productId: string, brand?: string) => Promise<void>;
  trackEnhancedSearch: (searchTerm: string) => Promise<void>;
  trackEnhancedCategoryView: (category: string) => Promise<void>;
  
  // Configuration
  config: EnhancedRankingConfig;
  updateConfig: (updates: Partial<EnhancedRankingConfig>) => void;
  
  // State
  loading: boolean;
  error: string | null;
  sessionId: string;
}

export function useEnhancedRanking(
  items: CatalogItem[] = [],
  initialConfig?: Partial<EnhancedRankingConfig>
): UseEnhancedRankingReturn {
  const [config, setConfig] = useState<EnhancedRankingConfig>({
    ...ENHANCED_RANKING_CONFIG,
    ...initialConfig
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | undefined>();

  // Generate session ID for tracking
  const sessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('enhanced_ranking_session_id') || 
             `enhanced_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return `enhanced_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Store session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('enhanced_ranking_session_id', sessionId);
    }
  }, [sessionId]);

  // Get personalized ranking for current session
  const personalizedRanking = useMemo(() => {
    return getPersonalizedRanking(sessionId);
  }, [sessionId]);

  // Get user segment from personalized ranking
  const userSegment = useMemo(() => {
    return personalizedRanking?.userSegment;
  }, [personalizedRanking]);

  // Get recommendations from personalized ranking
  const recommendations = useMemo(() => {
    return personalizedRanking?.recommendations || [];
  }, [personalizedRanking]);

  // Get segment analytics
  const segmentAnalytics = useMemo(() => {
    return getSegmentAnalytics();
  }, []);

  // Enhanced interaction tracking functions
  const trackEnhancedPageView = useCallback(async () => {
    try {
      await trackEnhancedInteraction({
        type: 'page_view',
        sessionId
      }, sessionId);
    } catch (err) {
      console.error('Error tracking enhanced page view:', err);
    }
  }, [sessionId]);

  const trackEnhancedProductView = useCallback(async (productId: string, brand?: string) => {
    try {
      await trackEnhancedInteraction({
        type: 'product_view',
        productId,
        brand,
        sessionId
      }, sessionId);
    } catch (err) {
      console.error('Error tracking enhanced product view:', err);
    }
  }, [sessionId]);

  const trackEnhancedResultClick = useCallback(async (productId: string, brand?: string) => {
    try {
      await trackEnhancedInteraction({
        type: 'result_click',
        productId,
        brand,
        sessionId
      }, sessionId);
    } catch (err) {
      console.error('Error tracking enhanced result click:', err);
    }
  }, [sessionId]);

  const trackEnhancedSearch = useCallback(async (searchTerm: string) => {
    try {
      await trackEnhancedInteraction({
        type: 'search',
        searchTerm,
        sessionId
      }, sessionId);
    } catch (err) {
      console.error('Error tracking enhanced search:', err);
    }
  }, [sessionId]);

  const trackEnhancedCategoryView = useCallback(async (category: string) => {
    try {
      await trackEnhancedInteraction({
        type: 'category_view',
        category,
        sessionId
      }, sessionId);
    } catch (err) {
      console.error('Error tracking enhanced category view:', err);
    }
  }, [sessionId]);

  // Multi-layer ranking calculation
  const getMultiLayerRanking = useCallback((productId: string): MultiLayerRanking => {
    return calculateMultiLayerRanking(productId, sessionId, config);
  }, [productId, sessionId, config]);

  // Apply enhanced ranking to items
  const applyEnhancedRanking = useCallback((items: CatalogItem[]): ProductRanking[] => {
    if (!config.personalizationEnabled) {
      // Fallback to basic ranking if personalization is disabled
      return items.map((item, index) => ({
        productId: item.id,
        brand: item.brand,
        name: item.name,
        score: 100 - index, // Simple reverse index scoring
        metrics: {
          pageViews: 0,
          categoryViews: 0,
          productViews: 0,
          resultClicks: 0,
          searches: 0,
          lastViewed: new Date(),
          conversionRate: 0
        },
        rank: index + 1
      }));
    }

    // Calculate multi-layer ranking for each item
    const rankings = items.map(item => {
      const multiLayerRanking = calculateMultiLayerRanking(item.id, sessionId, config);
      
      return {
        productId: item.id,
        brand: item.brand,
        name: item.name,
        score: multiLayerRanking.finalScore,
        metrics: {
          pageViews: 0,
          categoryViews: 0,
          productViews: 0,
          resultClicks: 0,
          searches: 0,
          lastViewed: new Date(),
          conversionRate: 0
        },
        rank: 0,
        // Add enhanced ranking data
        multiLayerRanking
      };
    });

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }, [items, sessionId, config]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<EnhancedRankingConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!config.analyticsEnabled) return;

    try {
      setLoading(true);
      
      // This would fetch analytics from backend
      // For now, create mock analytics
      const mockAnalytics: AdvancedAnalytics = {
        conversionRates: {
          overall: 0.15,
          byBrand: {
            'Apple': 0.18,
            'Google': 0.12,
            'Samsung': 0.14
          },
          byCategory: {
            'phones': 0.16,
            'tablets': 0.13,
            'laptops': 0.17
          },
          byTimeRange: {
            'day': 0.12,
            'week': 0.15,
            'month': 0.18
          }
        },
        userEngagement: {
          averageSessionDuration: 180, // seconds
          pagesPerSession: 3.2,
          bounceRate: 0.45,
          returnRate: 0.25
        },
        productPerformance: {
          topPerformers: [],
          underperformers: [],
          trendingUp: [],
          trendingDown: []
        },
        segmentInsights: {
          segmentBreakdown: {
            'tech_enthusiasts': 0.35,
            'budget_conscious': 0.28,
            'business_users': 0.37
          },
          segmentPreferences: {
            'tech_enthusiasts': ['Apple', 'Google'],
            'budget_conscious': ['Samsung'],
            'business_users': ['Apple', 'Google']
          }
        }
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [config.analyticsEnabled]);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Cleanup session data on unmount
  useEffect(() => {
    return () => {
      // Optionally clear session data when component unmounts
      // clearSessionData(sessionId);
    };
  }, [sessionId]);

  return {
    // Core ranking functions
    applyEnhancedRanking,
    getMultiLayerRanking,
    
    // Personalization
    personalizedRanking,
    userSegment,
    recommendations,
    
    // Analytics
    analytics,
    segmentAnalytics,
    
    // Interaction tracking
    trackEnhancedPageView,
    trackEnhancedProductView,
    trackEnhancedResultClick,
    trackEnhancedSearch,
    trackEnhancedCategoryView,
    
    // Configuration
    config,
    updateConfig,
    
    // State
    loading,
    error,
    sessionId
  };
}
