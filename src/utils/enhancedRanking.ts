import { CatalogItem } from '@/types/catalog';
import { 
  ProductRanking, 
  UserInteraction, 
  RankingConfig, 
  RankingMetrics,
  UserSegment,
  PersonalizedRanking,
  MultiLayerRanking,
  EnhancedRankingConfig,
  AdvancedAnalytics
} from '@/types/ranking';

// Enhanced ranking configuration with new features
export const ENHANCED_RANKING_CONFIG: EnhancedRankingConfig = {
  // Base ranking config
  weights: {
    pageViews: 1.0,
    categoryViews: 2.0,
    productViews: 3.0,
    resultClicks: 5.0,
    searches: 1.5,
    recency: 2.0
  },
  brandWeights: {
    google: 1.0,
    apple: 1.0,
    samsung: 1.0,
    default: 1.0
  },
  decayFactor: 0.95,
  minInteractions: 3,
  baseScoreStrategy: 'hybrid',
  defaultBaseScore: 50,
  timeDecayEnabled: true,
  categoryPriority: {
    'phones': 1.2,
    'tablets': 1.1,
    'laptops': 1.0,
    'accessories': 0.9
  },
  
  // Enhanced features
  personalizationEnabled: true,
  personalizationWeight: 0.3,
  userSegments: [
    {
      id: 'tech_enthusiasts',
      name: 'Tech Enthusiasts',
      description: 'Users who prefer high-end tech products',
      criteria: {
        brandPreferences: ['Apple', 'Google', 'Samsung'],
        categoryPreferences: ['phones', 'tablets', 'laptops'],
        interactionPatterns: ['product_view', 'result_click']
      },
      weight: 1.2
    },
    {
      id: 'budget_conscious',
      name: 'Budget Conscious',
      description: 'Users who prefer affordable options',
      criteria: {
        brandPreferences: ['Samsung', 'Google'],
        categoryPreferences: ['accessories'],
        interactionPatterns: ['search', 'category_view']
      },
      weight: 0.8
    },
    {
      id: 'business_users',
      name: 'Business Users',
      description: 'Users focused on business solutions',
      criteria: {
        brandPreferences: ['Apple', 'Google'],
        categoryPreferences: ['laptops', 'tablets'],
        interactionPatterns: ['product_view', 'result_click']
      },
      weight: 1.1
    }
  ],
  
  // Multi-layer ranking
  layers: {
    interaction: { weight: 0.4, isActive: true },
    trending: { weight: 0.25, isActive: true },
    personalization: { weight: 0.2, isActive: true },
    brandAffinity: { weight: 0.1, isActive: true },
    categoryPreference: { weight: 0.05, isActive: true },
    timeDecay: { weight: 0.1, isActive: true }
  },
  
  // Analytics
  analyticsEnabled: true,
  conversionTracking: true,
  segmentAnalysis: true,
  
  // A/B testing
  abTestingEnabled: false,
  abTestVariants: []
};

// In-memory storage for enhanced features
const userSessions: Map<string, UserInteraction[]> = new Map();
const personalizedRankings: Map<string, PersonalizedRanking> = new Map();
const segmentAnalytics: Map<string, any> = new Map();

// Enhanced interaction tracking with session management
export async function trackEnhancedInteraction(
  interaction: Omit<UserInteraction, 'timestamp'>,
  sessionId: string
): Promise<void> {
  const fullInteraction: UserInteraction = {
    ...interaction,
    timestamp: new Date()
  };
  
  // Store in session
  if (!userSessions.has(sessionId)) {
    userSessions.set(sessionId, []);
  }
  userSessions.get(sessionId)!.push(fullInteraction);
  
  // Update personalized ranking
  await updatePersonalizedRanking(sessionId);
  
  // Update segment analytics
  updateSegmentAnalytics(fullInteraction);
  
  // Send to existing tracking endpoint
  try {
    await fetch('/api/ranking/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction),
    });
  } catch (error) {
    console.error('Failed to send interaction to API:', error);
  }
}

// Multi-layer ranking calculation
export function calculateMultiLayerRanking(
  productId: string,
  sessionId: string,
  config: EnhancedRankingConfig = ENHANCED_RANKING_CONFIG
): MultiLayerRanking {
  const layerScores: Record<string, number> = {};
  const layerContributions: Record<string, number> = {};
  
  // Layer 1: Interaction Score
  if (config.layers.interaction.isActive) {
    layerScores.interaction = calculateInteractionScore(productId, config);
  }
  
  // Layer 2: Trending Score
  if (config.layers.trending.isActive) {
    layerScores.trending = calculateTrendingScore(productId, config);
  }
  
  // Layer 3: Personalization Score
  if (config.layers.personalization.isActive) {
    layerScores.personalization = calculateProductPersonalizationScore(productId, sessionId, config);
  }
  
  // Layer 4: Brand Affinity Score
  if (config.layers.brandAffinity.isActive) {
    layerScores.brandAffinity = calculateBrandAffinityScore(productId, sessionId, config);
  }
  
  // Layer 5: Category Preference Score
  if (config.layers.categoryPreference.isActive) {
    layerScores.categoryPreference = calculateCategoryPreferenceScore(productId, sessionId, config);
  }
  
  // Layer 6: Time Decay Score
  if (config.layers.timeDecay.isActive) {
    layerScores.timeDecay = calculateTimeDecayScore(productId, config);
  }
  
  // Calculate weighted final score
  let finalScore = 0;
  let totalWeight = 0;
  
  Object.entries(layerScores).forEach(([layer, score]) => {
    const weight = config.layers[layer as keyof typeof config.layers]?.weight || 0;
    finalScore += score * weight;
    totalWeight += weight;
    layerContributions[layer] = (score * weight) / totalWeight;
  });
  
  // Normalize final score
  finalScore = totalWeight > 0 ? finalScore / totalWeight : 0;
  
  // Calculate confidence based on data availability
  const confidence = calculateConfidence(layerScores, config);
  
  return {
    layers: Object.entries(config.layers)
      .filter(([_, layer]) => layer.isActive)
      .map(([id, layer]) => ({
        id,
        name: getLayerName(id),
        description: getLayerDescription(id),
        weight: layer.weight,
        isActive: layer.isActive,
        config: layer
      })),
    finalScore,
    layerContributions,
    confidence
  };
}

// Individual layer calculations
function calculateInteractionScore(productId: string, config: EnhancedRankingConfig): number {
  // This would integrate with existing ranking system
  // For now, return a placeholder score
  return Math.random() * 100;
}

function calculateTrendingScore(productId: string, config: EnhancedRankingConfig): number {
  // This would integrate with trending API
  return Math.random() * 100;
}

function calculateProductPersonalizationScore(
  productId: string, 
  sessionId: string, 
  config: EnhancedRankingConfig
): number {
  const personalizedRanking = personalizedRankings.get(sessionId);
  if (!personalizedRanking) return 0;
  
  const isRecommended = personalizedRanking.recommendations.includes(productId);
  return isRecommended ? personalizedRanking.personalizationScore : 0;
}

function calculateBrandAffinityScore(
  productId: string, 
  sessionId: string, 
  config: EnhancedRankingConfig
): number {
  const sessionInteractions = userSessions.get(sessionId) || [];
  const brandInteractions = sessionInteractions.filter(i => i.brand);
  
  if (brandInteractions.length === 0) return 0;
  
  // Find the product's brand
  const productBrand = getProductBrand(productId);
  if (!productBrand) return 0;
  
  // Calculate brand affinity based on session interactions
  const brandCount = brandInteractions.filter(i => i.brand === productBrand).length;
  return Math.min(brandCount * 20, 100); // Cap at 100
}

function calculateCategoryPreferenceScore(
  productId: string, 
  sessionId: string, 
  config: EnhancedRankingConfig
): number {
  const sessionInteractions = userSessions.get(sessionId) || [];
  const categoryInteractions = sessionInteractions.filter(i => i.category);
  
  if (categoryInteractions.length === 0) return 0;
  
  // Find the product's category
  const productCategory = getProductCategory(productId);
  if (!productCategory) return 0;
  
  // Calculate category preference based on session interactions
  const categoryCount = categoryInteractions.filter(i => i.category === productCategory).length;
  return Math.min(categoryCount * 25, 100); // Cap at 100
}

function calculateTimeDecayScore(productId: string, config: EnhancedRankingConfig): number {
  const now = new Date();
  const lastInteraction = getLastInteractionTime(productId);
  
  if (!lastInteraction) return 0;
  
  const hoursSince = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.pow(config.decayFactor, hoursSince / 24); // Daily decay
  
  return Math.max(0, 100 * decayFactor);
}

function calculateConfidence(layerScores: Record<string, number>, config: EnhancedRankingConfig): number {
  const activeLayers = Object.keys(layerScores).length;
  const totalLayers = Object.values(config.layers).filter(layer => layer.isActive).length;
  
  if (totalLayers === 0) return 0;
  
  // Higher confidence with more active layers and more data
  const layerConfidence = activeLayers / totalLayers;
  const dataConfidence = Math.min(Object.values(layerScores).filter(score => score > 0).length / activeLayers, 1);
  
  return (layerConfidence + dataConfidence) / 2;
}

// Personalization functions
async function updatePersonalizedRanking(sessionId: string): Promise<void> {
  const sessionInteractions = userSessions.get(sessionId) || [];
  if (sessionInteractions.length === 0) return;
  
  // Determine user segment
  const userSegment = determineUserSegment(sessionInteractions);
  
  // Generate recommendations based on segment
  const recommendations = generateRecommendations(sessionInteractions, userSegment);
  
  // Calculate personalization score
  const personalizationScore = calculatePersonalizationScore(sessionInteractions, userSegment);
  
  personalizedRankings.set(sessionId, {
    sessionId,
    userSegment,
    personalizationScore,
    recommendations,
    lastUpdated: new Date()
  });
}

function determineUserSegment(interactions: UserInteraction[]): UserSegment | undefined {
  const config = ENHANCED_RANKING_CONFIG;
  
  for (const segment of config.userSegments) {
    if (matchesSegmentCriteria(interactions, segment)) {
      return segment;
    }
  }
  
  return undefined;
}

function matchesSegmentCriteria(interactions: UserInteraction[], segment: UserSegment): boolean {
  const { criteria } = segment;
  
  // Check brand preferences
  if (criteria.brandPreferences) {
    const userBrands = [...new Set(interactions.map(i => i.brand).filter(Boolean))];
    const hasPreferredBrand = userBrands.some(brand => 
      criteria.brandPreferences!.includes(brand)
    );
    if (!hasPreferredBrand) return false;
  }
  
  // Check interaction patterns
  if (criteria.interactionPatterns) {
    const userPatterns = [...new Set(interactions.map(i => i.type))];
    const hasPreferredPattern = userPatterns.some(pattern => 
      criteria.interactionPatterns!.includes(pattern)
    );
    if (!hasPreferredPattern) return false;
  }
  
  return true;
}

function generateRecommendations(
  interactions: UserInteraction[], 
  segment?: UserSegment
): string[] {
  // Simple recommendation logic - in production, use ML models
  const productIds = [...new Set(interactions.map(i => i.productId).filter(Boolean))];
  
  // Add segment-based recommendations
  if (segment) {
    const segmentProducts = getSegmentProducts(segment);
    productIds.push(...segmentProducts);
  }
  
  return [...new Set(productIds)].slice(0, 10); // Top 10 recommendations
}

function calculatePersonalizationScore(
  interactions: UserInteraction[], 
  segment?: UserSegment
): number {
  let score = 50; // Base score
  
  // Increase score based on interaction volume
  score += Math.min(interactions.length * 5, 30);
  
  // Increase score based on segment match
  if (segment) {
    score += segment.weight * 20;
  }
  
  return Math.min(score, 100);
}

// Analytics functions
function updateSegmentAnalytics(interaction: UserInteraction): void {
  const segment = determineUserSegment([interaction]);
  if (!segment) return;
  
  if (!segmentAnalytics.has(segment.id)) {
    segmentAnalytics.set(segment.id, {
      interactions: 0,
      products: new Set(),
      brands: new Set(),
      lastUpdated: new Date()
    });
  }
  
  const analytics = segmentAnalytics.get(segment.id)!;
  analytics.interactions++;
  if (interaction.productId) analytics.products.add(interaction.productId);
  if (interaction.brand) analytics.brands.add(interaction.brand);
  analytics.lastUpdated = new Date();
}

// Utility functions
function getLayerName(layerId: string): string {
  const names: Record<string, string> = {
    interaction: 'User Interactions',
    trending: 'Trending Products',
    personalization: 'Personalization',
    brandAffinity: 'Brand Affinity',
    categoryPreference: 'Category Preference',
    timeDecay: 'Time Decay'
  };
  return names[layerId] || layerId;
}

function getLayerDescription(layerId: string): string {
  const descriptions: Record<string, string> = {
    interaction: 'Based on user clicks, views, and searches',
    trending: 'Based on overall product popularity',
    personalization: 'Based on user segment and preferences',
    brandAffinity: 'Based on user brand preferences',
    categoryPreference: 'Based on user category preferences',
    timeDecay: 'Based on recency of interactions'
  };
  return descriptions[layerId] || '';
}

function getProductBrand(productId: string): string | null {
  // This would integrate with catalog data
  // For now, extract from productId format
  const parts = productId.split('-');
  return parts.length > 0 ? parts[0] : null;
}

function getProductCategory(productId: string): string | null {
  // This would integrate with catalog data
  // For now, return null
  return null;
}

function getLastInteractionTime(productId: string): Date | null {
  // This would integrate with existing interaction data
  // For now, return null
  return null;
}

function getSegmentProducts(segment: UserSegment): string[] {
  // This would integrate with catalog data
  // For now, return empty array
  return [];
}

// Export functions for use in components
export function getPersonalizedRanking(sessionId: string): PersonalizedRanking | undefined {
  return personalizedRankings.get(sessionId);
}

export function getSegmentAnalytics(): Map<string, any> {
  return segmentAnalytics;
}

export function clearSessionData(sessionId: string): void {
  userSessions.delete(sessionId);
  personalizedRankings.delete(sessionId);
}
