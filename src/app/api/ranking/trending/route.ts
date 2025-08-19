import { NextRequest, NextResponse } from 'next/server';
import { fetchCatalogData } from '@/utils/catalog';

// In-memory storage for aggregated product metrics (in production, use database)
interface ProductMetrics {
  productId: string;
  brand: string;
  name: string;
  totalViews: number;
  totalClicks: number;
  totalSearches: number;
  lastInteraction: Date;
  trendingScore: number;
}

// Fire badge system for top trending products
interface FireBadge {
  productId: string;
  position: number | 'new'; // 1, 2, 3, or 'new' for new items
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}

// Trending system configuration
interface TrendingConfig {
  updateInterval: number; // minutes
  lastUpdate: Date;
  isEnabled: boolean;
}

// Cached trending data
interface CachedTrendingData {
  trending: any[];
  totalProducts: number;
  lastUpdated: Date;
  cacheKey: string; // Based on interactions hash
  fireBadges: FireBadge[];
}

let productMetrics: Map<string, ProductMetrics> = new Map();
let fireBadges: FireBadge[] = [];
let trendingConfig: TrendingConfig = {
  updateInterval: 5, // 5 minutes default
  lastUpdate: new Date(),
  isEnabled: true
};

// Cache for enriched trending data
let cachedTrendingData: CachedTrendingData | null = null;
let lastInteractionsHash: string = '';

// Fire badge duration configuration (in milliseconds)
const FIRE_BADGE_DURATIONS = {
  1: 2 * 60 * 60 * 1000, // 2 hours for position 1
  2: 1 * 60 * 60 * 1000, // 1 hour for position 2
  3: 30 * 60 * 1000,     // 30 minutes for position 3
  'new': 1 * 60 * 60 * 1000 // 1 hour for new items
};

// Initialize with empty data - will be populated by real interactions
console.log('Trending system initialized - waiting for real interaction data...');

// Clear any existing problematic data on server start
productMetrics.clear();
fireBadges = [];
console.log('✅ Cleared all trending data and fire badges on server start');

// Add a timestamp to track when the server started
const serverStartTime = new Date();
console.log(`🚀 Server started at: ${serverStartTime.toISOString()}`);

// Development mode warning
if (process.env.NODE_ENV === 'development') {
  console.log('⚠️  DEVELOPMENT MODE: In-memory data may persist between page navigations');
  console.log('💡 Use the "Clear All Trending Data" button to reset data manually');
}

// Calculate trending score based on interactions
function calculateTrendingScore(metrics: ProductMetrics): number {
  const now = new Date();
  const hoursSinceLastInteraction = (now.getTime() - metrics.lastInteraction.getTime()) / (1000 * 60 * 60);
  
  // Base score from total interactions using documented weights from RANKING_SYSTEM_GUIDE.md
  // Product View: 3.0, Result Click: 5.0, Search: 1.5
  let score = metrics.totalViews * 3.0 + metrics.totalClicks * 5.0 + metrics.totalSearches * 1.5;
  
  // Apply time decay (recent interactions are worth more)
  const decayFactor = Math.max(0.1, 1 - (hoursSinceLastInteraction / 168)); // 1 week decay
  score *= decayFactor;
  
  return Math.round(score);
}

// Generate a hash of current interactions for cache invalidation
function generateInteractionsHash(): string {
  const interactions = Array.from(productMetrics.values())
    .map(metrics => `${metrics.productId}:${metrics.totalViews}:${metrics.totalClicks}:${metrics.totalSearches}`)
    .sort()
    .join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < interactions.length; i++) {
    const char = interactions.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Manage fire badges for top trending products and new items
function updateFireBadges(trendingProducts: ProductMetrics[]): FireBadge[] {
  const now = new Date();
  
  // Clean up expired fire badges
  fireBadges = fireBadges.filter(badge => {
    if (badge.endTime <= now) {
      console.log(`🔥 Fire badge expired for ${badge.productId} at position ${badge.position}`);
      return false;
    }
    return true;
  });
  
  // Get top 3 trending products
  const top3 = trendingProducts.slice(0, 3);
  
  // Update fire badges for top 3
  top3.forEach((product, index) => {
    const position = index + 1;
    const existingBadge = fireBadges.find(badge => badge.productId === product.productId);
    
    if (existingBadge) {
      // Update existing badge if position changed
      if (existingBadge.position !== position) {
        console.log(`🔥 Updating fire badge for ${product.productId}: position ${existingBadge.position} -> ${position}`);
        existingBadge.position = position;
        existingBadge.startTime = now;
        existingBadge.endTime = new Date(now.getTime() + FIRE_BADGE_DURATIONS[position as keyof typeof FIRE_BADGE_DURATIONS]);
      }
    } else {
      // Create new fire badge
      const newBadge: FireBadge = {
        productId: product.productId,
        position,
        startTime: now,
        endTime: new Date(now.getTime() + FIRE_BADGE_DURATIONS[position as keyof typeof FIRE_BADGE_DURATIONS]),
        isActive: true
      };
      
      fireBadges.push(newBadge);
      console.log(`🔥 New fire badge created for ${product.productId} at position ${position} (${FIRE_BADGE_DURATIONS[position as keyof typeof FIRE_BADGE_DURATIONS] / (60 * 1000)} minutes)`);
    }
  });
  
  // Handle new items (items with very recent interactions)
  const recentThreshold = 24 * 60 * 60 * 1000; // 24 hours
  const newItems = trendingProducts.filter(product => {
    const hoursSinceFirstInteraction = (now.getTime() - product.lastInteraction.getTime()) / (1000 * 60 * 60);
    return hoursSinceFirstInteraction <= 24 && !top3.some(topProduct => topProduct.productId === product.productId);
  });
  
  // Add fire badges for new items
  newItems.forEach(product => {
    const existingBadge = fireBadges.find(badge => badge.productId === product.productId);
    
    if (!existingBadge) {
      const newBadge: FireBadge = {
        productId: product.productId,
        position: 'new',
        startTime: now,
        endTime: new Date(now.getTime() + FIRE_BADGE_DURATIONS['new']),
        isActive: true
      };
      
      fireBadges.push(newBadge);
      console.log(`🔥 New item fire badge created for ${product.productId} (1 hour duration)`);
    }
  });
  
  // Remove badges for products no longer in top 3 or no longer new
  fireBadges = fireBadges.filter(badge => {
    const isStillInTop3 = top3.some(product => product.productId === badge.productId);
    const isStillNew = badge.position === 'new' && newItems.some(product => product.productId === badge.productId);
    
    if (!isStillInTop3 && !isStillNew) {
      console.log(`🔥 Removing fire badge for ${badge.productId} (no longer in top 3 or new)`);
    }
    return isStillInTop3 || isStillNew;
  });
  
  return fireBadges;
}

// Build enriched trending data with catalog information
async function buildEnrichedTrendingData(limit: number, brand?: string): Promise<CachedTrendingData> {
  console.log('🔄 Building enriched trending data...');
  
  // Get catalog data to enrich trending products with full product info
  const catalogData = await fetchCatalogData();
  
  // Convert metrics to array and filter by brand if specified
  let trendingProducts = Array.from(productMetrics.values())
    .filter(metrics => {
      // Filter out problematic entries
      if (metrics.brand === 'Unknown' || metrics.name === 'Unknown' || 
          metrics.brand === 'undefined' || metrics.name === 'undefined' ||
          !metrics.brand || !metrics.name) {
        return false;
      }
      // Apply brand filter if specified
      return !brand || metrics.brand.toLowerCase() === brand.toLowerCase();
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
  
  // Update fire badges for top 3
  const activeFireBadges = updateFireBadges(trendingProducts);
  
  // Enrich with catalog data and add fire badge information
  const enrichedTrending = trendingProducts.map(metrics => {
    // Try multiple matching strategies using the main product identifier
    let catalogItem = null;
    
    // Strategy 1: Direct match by product name (SKU)
    catalogItem = catalogData.items.find(item => 
      item.name.toLowerCase() === metrics.productId.toLowerCase()
    );
    
    if (!catalogItem) {
      // Strategy 2: Match by brand + product name combination
      catalogItem = catalogData.items.find(item => 
        `${item.brand}-${item.name}`.toLowerCase().replace(/\s+/g, '-') === metrics.productId
      );
    }
    
    if (!catalogItem) {
      // Strategy 3: Match by product ID (which includes brand prefix)
      catalogItem = catalogData.items.find(item => item.id === metrics.productId);
    }
    
    if (!catalogItem) {
      // Strategy 4: Fuzzy match by product name (for slight variations)
      catalogItem = catalogData.items.find(item => 
        item.name.toLowerCase().includes(metrics.productId.toLowerCase()) ||
        metrics.productId.toLowerCase().includes(item.name.toLowerCase())
      );
    }
    
    // Check if this product has an active fire badge
    const fireBadge = activeFireBadges.find(badge => badge.productId === metrics.productId);
    
    return {
      ...metrics,
      name: catalogItem?.name || metrics.name,
      description: catalogItem?.description,
      grade: catalogItem?.grade,
      minQty: catalogItem?.minQty,
      // Keep the trending score for ranking
      trendingScore: metrics.trendingScore,
      // Add fire badge information
      hasFireBadge: !!fireBadge,
      fireBadgePosition: fireBadge?.position || null,
      fireBadgeTimeRemaining: fireBadge ? Math.max(0, fireBadge.endTime.getTime() - new Date().getTime()) : null
    };
  });
  
  return {
    trending: enrichedTrending,
    totalProducts: enrichedTrending.length,
    lastUpdated: new Date(),
    cacheKey: generateInteractionsHash(),
    fireBadges: activeFireBadges
  };
}

// Update product metrics from interaction
function updateProductMetrics(interaction: any) {
  // Skip interactions without proper product information
  if (!interaction.productId && !interaction.brand && !interaction.searchTerm) {
    console.log('Skipping interaction without product info:', interaction);
    return;
  }

  // For page views, we don't have specific product info, so skip them for trending
  if (interaction.type === 'page_view') {
    console.log('Skipping page view for trending (no specific product)');
    return;
  }

  // Skip interactions with undefined or problematic values
  if (interaction.brand === undefined || interaction.brand === 'undefined' || 
      interaction.productId === 'undefined-unknown' || 
      interaction.productId?.includes('undefined')) {
    console.log('Skipping interaction with undefined/problematic values:', interaction);
    return;
  }

  // Extract the product name from the productId by removing brand prefix
  // This handles cases where the productId already contains the brand (e.g., "dell-dell-3340-13-i3-1215u-256gb-8gb-new")
  let trendingKey = interaction.productId;
  
  if (interaction.productId && interaction.brand) {
    const brandPrefix = `${interaction.brand}-`.toLowerCase();
    if (interaction.productId.toLowerCase().startsWith(brandPrefix)) {
      trendingKey = interaction.productId.substring(brandPrefix.length);
      console.log(`Extracted product name from ID: ${interaction.productId} -> ${trendingKey}`);
    }
  }
  
  console.log('Using extracted product name as trending key:', {
    originalProductId: interaction.productId,
    extractedTrendingKey: trendingKey,
    brand: interaction.brand
  });
  
  console.log('Updating product metrics:', {
    originalProductId: interaction.productId,
    trendingKey,
    type: interaction.type,
    brand: interaction.brand,
    searchTerm: interaction.searchTerm
  });

  if (!productMetrics.has(trendingKey)) {
    productMetrics.set(trendingKey, {
      productId: trendingKey, // Use extracted product name as productId
      brand: interaction.brand || 'Unknown',
      name: trendingKey, // Use extracted product name as name
      totalViews: 0,
      totalClicks: 0,
      totalSearches: 0,
      lastInteraction: new Date(),
      trendingScore: 0
    });
    console.log('Created new product metrics for:', trendingKey, 'with brand:', interaction.brand);
  }

  const metrics = productMetrics.get(trendingKey)!;

  // Update brand information if it was missing
  if (interaction.brand && metrics.brand === 'Unknown') {
    metrics.brand = interaction.brand;
    console.log(`Updated brand for ${trendingKey} from Unknown to ${interaction.brand}`);
  }

  // Update counts based on interaction type
  switch (interaction.type) {
    case 'product_view':
      metrics.totalViews++;
      console.log(`Incremented views for ${trendingKey}: ${metrics.totalViews}`);
      break;
    case 'result_click':
      metrics.totalClicks++;
      console.log(`Incremented clicks for ${trendingKey}: ${metrics.totalClicks}`);
      break;
    case 'search':
      metrics.totalSearches++;
      console.log(`Incremented searches for ${trendingKey}: ${metrics.totalSearches}`);
      break;
  }

  // Update last interaction time
  metrics.lastInteraction = new Date();

  // Recalculate trending score
  metrics.trendingScore = calculateTrendingScore(metrics);
  console.log(`Updated trending score for ${trendingKey}: ${metrics.trendingScore} (views: ${metrics.totalViews}×3.0=${metrics.totalViews * 3.0}, clicks: ${metrics.totalClicks}×5.0=${metrics.totalClicks * 5.0}, searches: ${metrics.totalSearches}×1.5=${metrics.totalSearches * 1.5})`);
}

// Sync interactions from the tracking endpoint
export function syncInteractions(interactions: any[]) {
  console.log(`Syncing ${interactions.length} interactions to trending system`);
  interactions.forEach(updateProductMetrics);
  console.log(`Current product metrics count: ${productMetrics.size}`);
  
  // Invalidate cache when new interactions are added
  const currentHash = generateInteractionsHash();
  if (currentHash !== lastInteractionsHash) {
    console.log('🔄 Invalidating cache due to new interactions');
    cachedTrendingData = null;
    lastInteractionsHash = currentHash;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const brand = searchParams.get('brand');
    const force = searchParams.get('force') === 'true';
    
    // Check if trending is enabled
    if (!trendingConfig.isEnabled) {
      return NextResponse.json({
        trending: [],
        totalProducts: 0,
        lastUpdated: trendingConfig.lastUpdate.toISOString(),
        disabled: true
      });
    }
    
    // Check if we have valid cached data
    const currentHash = generateInteractionsHash();
    const cacheIsValid = cachedTrendingData && 
                        cachedTrendingData.cacheKey === currentHash &&
                        !force;
    
    if (cacheIsValid && cachedTrendingData) {
      console.log('✅ Returning cached trending data');
      return NextResponse.json({
        trending: cachedTrendingData.trending,
        totalProducts: cachedTrendingData.totalProducts,
        lastUpdated: cachedTrendingData.lastUpdated.toISOString(),
        cached: true,
        config: {
          updateInterval: trendingConfig.updateInterval,
          isEnabled: trendingConfig.isEnabled
        }
      });
    }
    
    // Build new enriched trending data
    console.log('🔄 Building new trending data (cache miss or force refresh)');
    cachedTrendingData = await buildEnrichedTrendingData(limit, brand || undefined);
    lastInteractionsHash = currentHash;
    
    // Update last update time
    trendingConfig.lastUpdate = new Date();
    
    return NextResponse.json({
      trending: cachedTrendingData.trending,
      totalProducts: cachedTrendingData.totalProducts,
      lastUpdated: cachedTrendingData.lastUpdated.toISOString(),
      cached: false,
      config: {
        updateInterval: trendingConfig.updateInterval,
        isEnabled: trendingConfig.isEnabled
      }
    });
  } catch (error) {
    console.error('Error getting trending products:', error);
    return NextResponse.json(
      { error: 'Failed to get trending products' },
      { status: 500 }
    );
  }
}

// Endpoint to manually sync interactions (called from tracking endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interactions, action } = body;
    
    // Handle different actions
    if (action === 'sync') {
      if (Array.isArray(interactions)) {
        syncInteractions(interactions);
      }
      return NextResponse.json({ success: true, synced: interactions?.length || 0 });
    }
    
    if (action === 'updateConfig') {
      const { updateInterval, isEnabled } = body;
      if (typeof updateInterval === 'number') {
        trendingConfig.updateInterval = updateInterval;
      }
      if (typeof isEnabled === 'boolean') {
        trendingConfig.isEnabled = isEnabled;
      }
      trendingConfig.lastUpdate = new Date();
      return NextResponse.json({ success: true, config: trendingConfig });
    }
    
    if (action === 'forceUpdate') {
      // Force update trending scores
      productMetrics.forEach(metrics => {
        metrics.trendingScore = calculateTrendingScore(metrics);
      });
      trendingConfig.lastUpdate = new Date();
      return NextResponse.json({ success: true, updated: productMetrics.size });
    }
    
    if (action === 'getConfig') {
      return NextResponse.json({ 
        success: true, 
        config: trendingConfig,
        metricsCount: productMetrics.size,
        sampleMetrics: Array.from(productMetrics.values()).slice(0, 3),
        weights: {
          productView: 3.0,
          resultClick: 5.0,
          search: 1.5
        }
      });
    }
    
    if (action === 'clearData') {
      productMetrics.clear();
      trendingConfig.lastUpdate = new Date();
      return NextResponse.json({ success: true, cleared: true });
    }

    if (action === 'forceClear') {
      productMetrics.clear();
      cachedTrendingData = null;
      lastInteractionsHash = '';
      trendingConfig.lastUpdate = new Date();
      console.log('Force cleared all trending data and cache');
      return NextResponse.json({ success: true, forceCleared: true });
    }

    if (action === 'resetOnStart') {
      productMetrics.clear();
      trendingConfig.lastUpdate = new Date();
      console.log('Reset trending data on server start');
      return NextResponse.json({ 
        success: true, 
        resetOnStart: true,
        serverStartTime: serverStartTime.toISOString(),
        clearedAt: new Date().toISOString()
      });
    }

    if (action === 'testCalculation') {
      // Test calculation with your example: 7 views, 3 clicks
      const testMetrics: ProductMetrics = {
        productId: 'test-product',
        brand: 'Test',
        name: 'Test Product',
        totalViews: 7,
        totalClicks: 3,
        totalSearches: 0,
        lastInteraction: new Date(),
        trendingScore: 0
      };
      
      const testScore = calculateTrendingScore(testMetrics);
      const oldScore = 7 * 1 + 3 * 3 + 0 * 2; // Old calculation
      
      return NextResponse.json({
        success: true,
        test: {
          views: 7,
          clicks: 3,
          searches: 0,
          oldCalculation: oldScore,
          newCalculation: testScore,
          breakdown: {
            views: `${7} × 3.0 = ${7 * 3.0}`,
            clicks: `${3} × 5.0 = ${3 * 5.0}`,
            searches: `${0} × 1.5 = ${0 * 1.5}`,
            total: `${7 * 3.0 + 3 * 5.0 + 0 * 1.5}`
          }
        }
      });
    }

    if (action === 'debugMetrics') {
      return NextResponse.json({
        success: true,
        debug: {
          totalProducts: productMetrics.size,
          products: Array.from(productMetrics.entries()).map(([key, metrics]) => ({
            key,
            productId: metrics.productId,
            brand: metrics.brand,
            name: metrics.name,
            views: metrics.totalViews,
            clicks: metrics.totalClicks,
            searches: metrics.totalSearches,
            score: metrics.trendingScore,
            lastInteraction: metrics.lastInteraction.toISOString()
          })),
          cacheStatus: {
            hasCachedData: !!cachedTrendingData,
            lastInteractionsHash,
            currentHash: generateInteractionsHash(),
            cacheIsValid: cachedTrendingData?.cacheKey === generateInteractionsHash()
          }
        }
      });
    }
    
    // Default: sync interactions
    if (Array.isArray(interactions)) {
      syncInteractions(interactions);
    }
    
    return NextResponse.json({ success: true, synced: interactions?.length || 0 });
  } catch (error) {
    console.error('Error in trending POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
