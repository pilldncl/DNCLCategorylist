import { CatalogItem } from '@/types/catalog';
import { ProductRanking, UserInteraction, RankingConfig, RankingMetrics } from '@/types/ranking';

// Default ranking configuration
export const DEFAULT_RANKING_CONFIG: RankingConfig = {
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
  decayFactor: 0.95, // 5% decay per day
  minInteractions: 3,
  baseScoreStrategy: 'hybrid', // 'default' | 'interaction_only' | 'hybrid'
  defaultBaseScore: 50, // Base score for products with no interactions
  timeDecayEnabled: true,
  categoryPriority: {
    'phones': 1.2,
    'tablets': 1.1,
    'laptops': 1.0,
    'accessories': 0.9
  }
};

// In-memory storage for interactions (in production, use database)
const interactions: UserInteraction[] = [];
const productMetrics: Map<string, RankingMetrics> = new Map();

// Track user interaction
export async function trackInteraction(interaction: Omit<UserInteraction, 'timestamp'>): Promise<void> {
  const fullInteraction: UserInteraction = {
    ...interaction,
    timestamp: new Date()
  };
  
  // Store locally
  interactions.push(fullInteraction);
  updateProductMetrics(fullInteraction);
  
  // Send to API endpoint
  try {
    await fetch('/api/ranking/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interaction),
    });
  } catch (error) {
    console.error('Failed to send interaction to API:', error);
  }
}

// Update product metrics based on interaction
function updateProductMetrics(interaction: UserInteraction): void {
  if (!interaction.productId) return;
  
  const existing = productMetrics.get(interaction.productId) || {
    pageViews: 0,
    categoryViews: 0,
    productViews: 0,
    resultClicks: 0,
    searches: 0,
    lastViewed: new Date(),
    conversionRate: 0
  };

  switch (interaction.type) {
    case 'page_view':
      existing.pageViews++;
      break;
    case 'category_view':
      existing.categoryViews++;
      break;
    case 'product_view':
      existing.productViews++;
      break;
    case 'result_click':
      existing.resultClicks++;
      break;
    case 'search':
      existing.searches++;
      break;
  }

  existing.lastViewed = interaction.timestamp;
  existing.conversionRate = existing.resultClicks / Math.max(existing.productViews, 1);
  
  productMetrics.set(interaction.productId, existing);
}

// Calculate ranking score for a product
export function calculateRankingScore(
  productId: string, 
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
  brand?: string,
  category?: string
): number {
  const metrics = productMetrics.get(productId);
  const now = new Date();
  
  // Calculate interaction-based score
  let interactionScore = 0;
  if (metrics) {
    const daysSinceLastView = (now.getTime() - metrics.lastViewed.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = config.timeDecayEnabled 
      ? Math.pow(config.decayFactor, daysSinceLastView)
      : 1.0;

    interactionScore = 
      metrics.pageViews * config.weights.pageViews +
      metrics.categoryViews * config.weights.categoryViews +
      metrics.productViews * config.weights.productViews +
      metrics.resultClicks * config.weights.resultClicks +
      metrics.searches * config.weights.searches +
      recencyScore * config.weights.recency;
  }

  // Apply base score strategy
  let finalScore = 0;
  
  switch (config.baseScoreStrategy) {
    case 'default':
      // All products get base score + interactions
      finalScore = config.defaultBaseScore + interactionScore;
      break;
      
    case 'interaction_only':
      // Only interaction score matters
      finalScore = interactionScore;
      break;
      
    case 'hybrid':
      // Base score for products with no interactions, pure interaction score for others
      if (interactionScore === 0) {
        finalScore = config.defaultBaseScore;
      } else {
        finalScore = interactionScore;
      }
      break;
  }

  // Apply brand weight if available
  if (brand && config.brandWeights) {
    const brandWeight = config.brandWeights[brand.toLowerCase()] || config.brandWeights.default || 1.0;
    finalScore *= brandWeight;
  }

  // Apply category priority if available
  if (category && config.categoryPriority) {
    const categoryWeight = config.categoryPriority[category.toLowerCase()] || 1.0;
    finalScore *= categoryWeight;
  }

  return finalScore;
}

// Apply ranking to catalog items
export function applyRanking(
  items: CatalogItem[], 
  config: RankingConfig = DEFAULT_RANKING_CONFIG
): ProductRanking[] {
  const rankings: ProductRanking[] = [];

  for (const item of items) {
    const score = calculateRankingScore(item.id, config, item.brand, item.category);
    const metrics = productMetrics.get(item.id) || {
      pageViews: 0,
      categoryViews: 0,
      productViews: 0,
      resultClicks: 0,
      searches: 0,
      lastViewed: new Date(),
      conversionRate: 0
    };

    rankings.push({
      productId: item.id,
      brand: item.brand,
      name: item.name,
      score,
      metrics,
      rank: 0 // Will be set after sorting
    });
  }

  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });

  return rankings;
}

// Get top ranked products
export function getTopRankedProducts(
  items: CatalogItem[], 
  limit: number = 10,
  config: RankingConfig = DEFAULT_RANKING_CONFIG
): ProductRanking[] {
  const rankings = applyRanking(items, config);
  return rankings.slice(0, limit);
}

// Search with ranking
export function searchWithRanking(
  items: CatalogItem[],
  searchTerm: string,
  config: RankingConfig = DEFAULT_RANKING_CONFIG
): ProductRanking[] {
  const searchLower = searchTerm.toLowerCase();
  const matchingItems = items.filter(item => {
    const searchableText = [
      item.brand,
      item.name,
      item.description,
      item.category
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(searchLower);
  });

  return applyRanking(matchingItems, config);
}

// Get trending products (high recent activity)
export function getTrendingProducts(
  items: CatalogItem[],
  days: number = 7,
  limit: number = 10
): ProductRanking[] {
  const recentInteractions = interactions.filter(
    interaction => {
      const daysSince = (new Date().getTime() - interaction.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= days;
    }
  );

  // Create temporary metrics for recent period
  const recentMetrics = new Map<string, RankingMetrics>();
  
  recentInteractions.forEach(interaction => {
    if (!interaction.productId) return;
    
    const existing = recentMetrics.get(interaction.productId) || {
      pageViews: 0,
      categoryViews: 0,
      productViews: 0,
      resultClicks: 0,
      searches: 0,
      lastViewed: new Date(),
      conversionRate: 0
    };

    switch (interaction.type) {
      case 'page_view': existing.pageViews++; break;
      case 'category_view': existing.categoryViews++; break;
      case 'product_view': existing.productViews++; break;
      case 'result_click': existing.resultClicks++; break;
      case 'search': existing.searches++; break;
    }

    existing.lastViewed = interaction.timestamp;
    existing.conversionRate = existing.resultClicks / Math.max(existing.productViews, 1);
    recentMetrics.set(interaction.productId, existing);
  });

  // Apply ranking with recent metrics
  const rankings = items
    .filter(item => recentMetrics.has(item.id))
    .map(item => {
      const metrics = recentMetrics.get(item.id)!;
      const score = calculateRankingScore(item.id, { ...DEFAULT_RANKING_CONFIG, minInteractions: 1 });
      
      return {
        productId: item.id,
        brand: item.brand,
        name: item.name,
        score,
        metrics,
        rank: 0
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });

  return rankings;
}

// Export interactions for analytics
export function getInteractions(): UserInteraction[] {
  return [...interactions];
}

// Clear old interactions (for memory management)
export function clearOldInteractions(daysToKeep: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const oldInteractions = interactions.filter(
    interaction => interaction.timestamp < cutoffDate
  );
  
  oldInteractions.forEach(interaction => {
    const index = interactions.indexOf(interaction);
    if (index > -1) {
      interactions.splice(index, 1);
    }
  });
}
