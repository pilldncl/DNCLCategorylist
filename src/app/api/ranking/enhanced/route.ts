import { NextRequest, NextResponse } from 'next/server';
import { UserInteraction } from '@/types/ranking';
import { fetchCatalogData } from '@/utils/catalog';

// In-memory storage for enhanced analytics (in production, use database)
interface EnhancedAnalytics {
  multiLayerRankings: Map<string, any>;
  userSegments: Map<string, any>;
  personalizationData: Map<string, any>;
  conversionTracking: Map<string, any>;
  lastUpdated: Date;
}

let enhancedAnalytics: EnhancedAnalytics = {
  multiLayerRankings: new Map(),
  userSegments: new Map(),
  personalizationData: new Map(),
  conversionTracking: new Map(),
  lastUpdated: new Date()
};

// Sample user segments for demonstration
const SAMPLE_USER_SEGMENTS = [
  {
    id: 'tech_enthusiasts',
    name: 'Tech Enthusiasts',
    description: 'Users who prefer high-end tech products',
    criteria: {
      brandPreferences: ['Apple', 'Google', 'Samsung'],
      categoryPreferences: ['phones', 'tablets', 'laptops'],
      interactionPatterns: ['product_view', 'result_click']
    },
    weight: 1.2,
    userCount: 0
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
    weight: 0.8,
    userCount: 0
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
    weight: 1.1,
    userCount: 0
  }
];

// Calculate multi-layer ranking for a product
function calculateMultiLayerRanking(productId: string, interactions: UserInteraction[]) {
  const now = new Date();
  
  // Layer 1: Interaction Score (40% weight)
  const interactionScore = calculateInteractionScore(productId, interactions);
  
  // Layer 2: Trending Score (25% weight)
  const trendingScore = calculateTrendingScore(productId, interactions);
  
  // Layer 3: Personalization Score (20% weight)
  const personalizationScore = calculatePersonalizationScore(productId, interactions);
  
  // Layer 4: Brand Affinity Score (10% weight)
  const brandAffinityScore = calculateBrandAffinityScore(productId, interactions);
  
  // Layer 5: Category Preference Score (5% weight)
  const categoryPreferenceScore = calculateCategoryPreferenceScore(productId, interactions);
  
  // Calculate weighted final score
  const finalScore = 
    interactionScore * 0.4 +
    trendingScore * 0.25 +
    personalizationScore * 0.2 +
    brandAffinityScore * 0.1 +
    categoryPreferenceScore * 0.05;
  
  return {
    layers: {
      interaction: { score: interactionScore, weight: 0.4, contribution: interactionScore * 0.4 },
      trending: { score: trendingScore, weight: 0.25, contribution: trendingScore * 0.25 },
      personalization: { score: personalizationScore, weight: 0.2, contribution: personalizationScore * 0.2 },
      brandAffinity: { score: brandAffinityScore, weight: 0.1, contribution: brandAffinityScore * 0.1 },
      categoryPreference: { score: categoryPreferenceScore, weight: 0.05, contribution: categoryPreferenceScore * 0.05 }
    },
    finalScore,
    confidence: calculateConfidence([interactionScore, trendingScore, personalizationScore, brandAffinityScore, categoryPreferenceScore]),
    lastCalculated: now
  };
}

// Individual layer calculations
function calculateInteractionScore(productId: string, interactions: UserInteraction[]): number {
  const productInteractions = interactions.filter(i => i.productId === productId);
  
  let score = 0;
  productInteractions.forEach(interaction => {
    switch (interaction.type) {
      case 'page_view': score += 1; break;
      case 'product_view': score += 3; break;
      case 'result_click': score += 5; break;
      case 'search': score += 2; break;
      case 'category_view': score += 2; break;
    }
  });
  
  return Math.min(score, 100);
}

function calculateTrendingScore(productId: string, interactions: UserInteraction[]): number {
  const now = new Date();
  const recentInteractions = interactions.filter(i => {
    const hoursSince = (now.getTime() - i.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSince <= 24; // Last 24 hours
  });
  
  const productInteractions = recentInteractions.filter(i => i.productId === productId);
  return Math.min(productInteractions.length * 10, 100);
}

function calculatePersonalizationScore(productId: string, interactions: UserInteraction[]): number {
  // Simple personalization based on user's interaction patterns
  const userBrands = [...new Set(interactions.map(i => i.brand).filter(Boolean))];
  const userCategories = [...new Set(interactions.map(i => i.category).filter(Boolean))];
  
  // Find product's brand and category (this would come from catalog data)
  const productBrand = getProductBrand(productId);
  const productCategory = getProductCategory(productId);
  
  let score = 0;
  
  if (productBrand && userBrands.includes(productBrand)) {
    score += 50;
  }
  
  if (productCategory && userCategories.includes(productCategory)) {
    score += 30;
  }
  
  // Bonus for products the user has interacted with
  const hasInteracted = interactions.some(i => i.productId === productId);
  if (hasInteracted) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

function calculateBrandAffinityScore(productId: string, interactions: UserInteraction[]): number {
  const productBrand = getProductBrand(productId);
  if (!productBrand) return 0;
  
  const brandInteractions = interactions.filter(i => i.brand === productBrand);
  return Math.min(brandInteractions.length * 20, 100);
}

function calculateCategoryPreferenceScore(productId: string, interactions: UserInteraction[]): number {
  const productCategory = getProductCategory(productId);
  if (!productCategory) return 0;
  
  const categoryInteractions = interactions.filter(i => i.category === productCategory);
  return Math.min(categoryInteractions.length * 25, 100);
}

function calculateConfidence(scores: number[]): number {
  const nonZeroScores = scores.filter(score => score > 0);
  return nonZeroScores.length / scores.length;
}

// Utility functions
function getProductBrand(productId: string): string | null {
  const parts = productId.split('-');
  return parts.length > 0 ? parts[0] : null;
}

function getProductCategory(productId: string): string | null {
  // This would integrate with catalog data
  // For now, return null
  return null;
}

// Determine user segment based on interactions
function determineUserSegment(interactions: UserInteraction[]) {
  const userBrands = [...new Set(interactions.map(i => i.brand).filter(Boolean))];
  const userPatterns = [...new Set(interactions.map(i => i.type))];
  
  for (const segment of SAMPLE_USER_SEGMENTS) {
    if (matchesSegmentCriteria(userBrands, userPatterns, segment)) {
      return segment;
    }
  }
  
  return null;
}

function matchesSegmentCriteria(userBrands: string[], userPatterns: string[], segment: any): boolean {
  const { criteria } = segment;
  
  // Check brand preferences
  if (criteria.brandPreferences) {
    const hasPreferredBrand = userBrands.some(brand => 
      criteria.brandPreferences.includes(brand)
    );
    if (!hasPreferredBrand) return false;
  }
  
  // Check interaction patterns
  if (criteria.interactionPatterns) {
    const hasPreferredPattern = userPatterns.some(pattern => 
      criteria.interactionPatterns.includes(pattern)
    );
    if (!hasPreferredPattern) return false;
  }
  
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    const sessionId = searchParams.get('sessionId');
    
    switch (action) {
      case 'multiLayerRanking':
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        
        // Get interactions for this product (in production, fetch from database)
        const interactions: UserInteraction[] = []; // This would be fetched from database
        const sessionId = 'default-session'; // In production, get from request
        const ranking = calculateMultiLayerRanking(productId!, sessionId);
        
        return NextResponse.json({
          success: true,
          productId,
          ranking,
          lastUpdated: enhancedAnalytics.lastUpdated
        });
        
      case 'userSegment':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        // Get user interactions (in production, fetch from database)
        const userInteractions: UserInteraction[] = []; // This would be fetched from database
        const userSegment = determineUserSegment(userInteractions);
        
        return NextResponse.json({
          success: true,
          sessionId,
          userSegment,
          lastUpdated: enhancedAnalytics.lastUpdated
        });
        
      case 'analytics':
        // Return comprehensive analytics
        const catalogData = await fetchCatalogData();
        
        const analytics = {
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
            averageSessionDuration: 180,
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
        
        return NextResponse.json({
          success: true,
          analytics,
          lastUpdated: enhancedAnalytics.lastUpdated
        });
        
      case 'segments':
        // Return user segment information
        return NextResponse.json({
          success: true,
          segments: SAMPLE_USER_SEGMENTS,
          lastUpdated: enhancedAnalytics.lastUpdated
        });
        
      default:
        return NextResponse.json({
          success: true,
          message: 'Enhanced ranking API endpoint',
          availableActions: ['multiLayerRanking', 'userSegment', 'analytics', 'segments'],
          lastUpdated: enhancedAnalytics.lastUpdated
        });
    }
  } catch (error) {
    console.error('Error in enhanced ranking API:', error);
    return NextResponse.json(
      { error: 'Failed to process enhanced ranking request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'updateMultiLayerRanking':
        const { productId, ranking } = data;
        enhancedAnalytics.multiLayerRankings.set(productId, ranking);
        enhancedAnalytics.lastUpdated = new Date();
        
        return NextResponse.json({
          success: true,
          message: 'Multi-layer ranking updated',
          productId
        });
        
      case 'updateUserSegment':
        const { sessionId, segment } = data;
        enhancedAnalytics.userSegments.set(sessionId, segment);
        enhancedAnalytics.lastUpdated = new Date();
        
        return NextResponse.json({
          success: true,
          message: 'User segment updated',
          sessionId
        });
        
      case 'trackConversion':
        const { conversionData } = data;
        enhancedAnalytics.conversionTracking.set(
          `${conversionData.productId}_${Date.now()}`,
          conversionData
        );
        enhancedAnalytics.lastUpdated = new Date();
        
        return NextResponse.json({
          success: true,
          message: 'Conversion tracked'
        });
        
      case 'clearData':
        enhancedAnalytics = {
          multiLayerRankings: new Map(),
          userSegments: new Map(),
          personalizationData: new Map(),
          conversionTracking: new Map(),
          lastUpdated: new Date()
        };
        
        return NextResponse.json({
          success: true,
          message: 'Enhanced analytics data cleared'
        });
        
      default:
        return NextResponse.json({
          success: true,
          message: 'Enhanced ranking data updated',
          action
        });
    }
  } catch (error) {
    console.error('Error in enhanced ranking POST:', error);
    return NextResponse.json(
      { error: 'Failed to process enhanced ranking data' },
      { status: 500 }
    );
  }
}
