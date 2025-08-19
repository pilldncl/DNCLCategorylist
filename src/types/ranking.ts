export interface RankingMetrics {
  pageViews: number;
  categoryViews: number;
  productViews: number;
  resultClicks: number;
  searches: number;
  lastViewed: Date;
  conversionRate: number;
}

export interface ProductRanking {
  productId: string;
  brand: string;
  name: string;
  score: number;
  metrics: RankingMetrics;
  rank: number;
}

export interface UserInteraction {
  type: 'page_view' | 'category_view' | 'product_view' | 'result_click' | 'search';
  productId?: string;
  brand?: string;
  category?: string;
  searchTerm?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface ProductBaseScore {
  productId: string;
  baseScore: number;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  brand?: string;
}

export interface RankingConfig {
  weights: {
    pageViews: number;
    categoryViews: number;
    productViews: number;
    resultClicks: number;
    searches: number;
    recency: number;
  };
  brandWeights?: {
    [brand: string]: number;
    default?: number;
  };
  decayFactor: number; // How quickly old interactions lose weight
  minInteractions: number; // Minimum interactions before ranking applies
  baseScoreStrategy: 'default' | 'interaction_only' | 'hybrid';
  defaultBaseScore: number; // Base score for products with no interactions
  timeDecayEnabled: boolean;
  categoryPriority?: {
    [category: string]: number;
  };
}

export interface RankingFilters {
  sortBy: 'relevance' | 'popularity' | 'recent' | 'price' | 'brand' | 'personalized' | 'trending';
  timeRange?: 'day' | 'week' | 'month' | 'all';
  userSegment?: string;
}

// New types for enhanced ranking features
export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    brandPreferences?: string[];
    categoryPreferences?: string[];
    interactionPatterns?: string[];
    purchaseHistory?: string[];
  };
  weight: number;
}

export interface PersonalizedRanking {
  userId?: string;
  sessionId: string;
  userSegment?: UserSegment;
  personalizationScore: number;
  recommendations: string[]; // Product IDs
  lastUpdated: Date;
}

export interface AdvancedAnalytics {
  conversionRates: {
    overall: number;
    byBrand: Record<string, number>;
    byCategory: Record<string, number>;
    byTimeRange: Record<string, number>;
  };
  userEngagement: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    returnRate: number;
  };
  productPerformance: {
    topPerformers: ProductRanking[];
    underperformers: ProductRanking[];
    trendingUp: ProductRanking[];
    trendingDown: ProductRanking[];
  };
  segmentInsights: {
    segmentBreakdown: Record<string, number>;
    segmentPreferences: Record<string, string[]>;
  };
}

export interface RankingLayer {
  id: string;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
  config: any;
}

export interface MultiLayerRanking {
  layers: RankingLayer[];
  finalScore: number;
  layerContributions: Record<string, number>;
  confidence: number;
}

// Enhanced ranking config with new features
export interface EnhancedRankingConfig extends RankingConfig {
  // Personalization settings
  personalizationEnabled: boolean;
  personalizationWeight: number;
  userSegments: UserSegment[];
  
  // Multi-layer ranking
  layers: {
    interaction: { weight: number; isActive: boolean };
    trending: { weight: number; isActive: boolean };
    personalization: { weight: number; isActive: boolean };
    brandAffinity: { weight: number; isActive: boolean };
    categoryPreference: { weight: number; isActive: boolean };
    timeDecay: { weight: number; isActive: boolean };
  };
  
  // Advanced analytics
  analyticsEnabled: boolean;
  conversionTracking: boolean;
  segmentAnalysis: boolean;
  
  // A/B testing
  abTestingEnabled: boolean;
  abTestVariants: {
    id: string;
    name: string;
    config: Partial<RankingConfig>;
    trafficPercentage: number;
  }[];
}
