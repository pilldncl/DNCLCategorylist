import { NextRequest, NextResponse } from 'next/server';
import { UserInteraction } from '@/types/ranking';
import { fetchCatalogData } from '@/utils/catalog';

// Enhanced Brand Analytics Data Structure
interface BrandAnalytics {
  brand: string;
  totalInteractions: number;
  brandScore: number;
  productCount: number;
  interactionBreakdown: {
    pageViews: number;
    categoryViews: number;
    productViews: number;
    resultClicks: number;
    searches: number;
  };
  conversionRate: number;
  averagePrice: number;
  topProducts: Array<{
    productId: string;
    name: string;
    views: number;
    clicks: number;
    score: number;
  }>;
  recentInteractions: Array<{
    type: string;
    productId?: string;
    searchTerm?: string;
    timestamp: string;
  }>;
  performanceMetrics: {
    engagementRate: number;
    searchToClickRate: number;
    viewToClickRate: number;
  };
  lastUpdated: string;
}

import { supabaseAdmin } from '@/lib/supabase';

// Brand interaction weights for scoring (matching RANKING_SYSTEM_GUIDE.md)
const BRAND_INTERACTION_WEIGHTS = {
  page_view: 1,
  category_view: 2,
  product_view: 3,
  result_click: 5,
  search: 1.5
};

// Function to get interactions from database
async function getInteractionsFromDatabase(): Promise<UserInteraction[]> {
  try {
    const { data: dbInteractions, error } = await supabaseAdmin
      .from('user_interactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching interactions from database:', error);
      return [];
    }

    // Convert database format to UserInteraction format
    return dbInteractions?.map(dbInteraction => ({
              type: dbInteraction.type,
      productId: dbInteraction.product_id,
      brand: dbInteraction.brand,
      category: dbInteraction.category,
      searchTerm: dbInteraction.search_term,
      sessionId: dbInteraction.session_id,
      userId: dbInteraction.user_id,
      timestamp: new Date(dbInteraction.timestamp)
    })) || [];
  } catch (error) {
    console.error('❌ Exception fetching interactions from database:', error);
    return [];
  }
}

// Calculate brand interaction score with weighted scoring
function calculateBrandScore(brandInteractions: UserInteraction[]): number {
  return brandInteractions.reduce((score, interaction) => {
    const weight = BRAND_INTERACTION_WEIGHTS[interaction.type as keyof typeof BRAND_INTERACTION_WEIGHTS] || 1;
    return score + weight;
  }, 0);
}

// Enhanced brand detection from search terms
function detectBrandFromSearch(searchTerm: string, catalogItems: Array<{ brand?: string }>): string | null {
  const searchLower = searchTerm.toLowerCase();
  
  // Check if search term contains brand name
  for (const item of catalogItems) {
    if (item.brand && searchLower.includes(item.brand.toLowerCase())) {
      return item.brand;
    }
  }
  
  // Enhanced brand variations mapping
  const brandVariations: { [key: string]: string } = {
    // Apple products
    'iphone': 'APPLE',
    'ipad': 'APPLE',
    'macbook': 'APPLE',
    'imac': 'APPLE',
    'mac': 'APPLE',
    'apple': 'APPLE',
    
    // Google products
    'pixel': 'GOOGLE',
    'google': 'GOOGLE',
    
    // Samsung products
    'samsung': 'SAMSUNG',
    'galaxy': 'SAMSUNG',
    
    // Dell products
    'dell': 'DELL',
    'latitude': 'DELL',
    'inspiron': 'DELL',
    'xps': 'DELL',
    
    // HP products
    'hp': 'HP',
    'hewlett': 'HP',
    'pavilion': 'HP',
    'elitebook': 'HP',
    
    // Lenovo products
    'lenovo': 'LENOVO',
    'thinkpad': 'LENOVO',
    'ideapad': 'LENOVO',
    
    // ASUS products
    'asus': 'ASUS',
    'rog': 'ASUS',
    
    // Acer products
    'acer': 'ACER',
    'aspire': 'ACER',
    
    // MSI products
    'msi': 'MSI',
    
    // Razer products
    'razer': 'RAZER',
    'blade': 'RAZER'
  };
  
  for (const [term, brand] of Object.entries(brandVariations)) {
    if (searchLower.includes(term)) {
      return brand;
    }
  }
  
  return null;
}

// Enhanced brand interaction filtering with better matching
function getBrandInteractions(brand: string, interactions: UserInteraction[], catalogItems: Array<{ brand?: string }>): UserInteraction[] {
  return interactions.filter(interaction => {
    // Direct brand match
    if (interaction.brand?.toLowerCase() === brand.toLowerCase()) {
      return true;
    }
    
    // Product ID contains brand
    if (interaction.productId?.toLowerCase().includes(brand.toLowerCase())) {
      return true;
    }
    
    // Search term contains brand
    if (interaction.searchTerm) {
      const detectedBrand = detectBrandFromSearch(interaction.searchTerm, catalogItems);
      if (detectedBrand?.toLowerCase() === brand.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  });
}

// Calculate comprehensive brand metrics
async function calculateBrandMetrics(brand: string, catalogItems: any[]): Promise<BrandAnalytics> {
  const interactions = await getInteractionsFromDatabase();
  const brandInteractions = getBrandInteractions(brand, interactions, catalogItems);
  const brandProducts = catalogItems.filter(item => 
    item.brand.toLowerCase() === brand.toLowerCase()
  );

  // Calculate basic metrics
  const pageViews = brandInteractions.filter(i => i.type === 'page_view').length;
  const categoryViews = brandInteractions.filter(i => i.type === 'category_view').length;
  const productViews = brandInteractions.filter(i => i.type === 'product_view').length;
  const resultClicks = brandInteractions.filter(i => i.type === 'result_click').length;
  const searches = brandInteractions.filter(i => i.type === 'search').length;
  
  const totalInteractions = brandInteractions.length;
  const brandScore = calculateBrandScore(brandInteractions);
  
  // Calculate conversion rates
  const conversionRate = productViews > 0 ? resultClicks / productViews : 0;
  const searchToClickRate = searches > 0 ? resultClicks / searches : 0;
  const viewToClickRate = productViews > 0 ? resultClicks / productViews : 0;
  const engagementRate = totalInteractions > 0 ? (resultClicks + productViews) / totalInteractions : 0;
  
  // Calculate average price
  const averagePrice = brandProducts.length > 0 
    ? brandProducts.reduce((sum, item) => sum + item.price, 0) / brandProducts.length 
    : 0;

  // Get top products for this brand
  const productMetrics = new Map<string, any>();
  brandInteractions.forEach(interaction => {
    if (!interaction.productId) return;
    
    const existing = productMetrics.get(interaction.productId) || {
      productId: interaction.productId,
      name: interaction.productId, // Will be enhanced with catalog data
      views: 0,
      clicks: 0,
      score: 0
    };

    if (interaction.type === 'product_view') existing.views++;
    if (interaction.type === 'result_click') existing.clicks++;
    
    existing.score = existing.views * BRAND_INTERACTION_WEIGHTS.product_view + 
                    existing.clicks * BRAND_INTERACTION_WEIGHTS.result_click;
    productMetrics.set(interaction.productId, existing);
  });

  // Enhance product names with catalog data
  const topProducts = Array.from(productMetrics.values())
    .map(product => {
      const catalogProduct = catalogItems.find(item => item.id === product.productId);
      return {
        ...product,
        name: catalogProduct?.name || product.productId
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Get recent interactions
  const recentInteractions = brandInteractions
    .slice(-10)
    .map(interaction => ({
      type: interaction.type,
      productId: interaction.productId,
      searchTerm: interaction.searchTerm,
      timestamp: typeof interaction.timestamp === 'string' 
        ? interaction.timestamp 
        : interaction.timestamp instanceof Date 
          ? interaction.timestamp.toISOString()
          : new Date(interaction.timestamp).toISOString()
    }))
    .reverse();

  return {
    brand,
    totalInteractions,
    brandScore,
    productCount: brandProducts.length,
    interactionBreakdown: {
      pageViews,
      categoryViews,
      productViews,
      resultClicks,
      searches
    },
    conversionRate,
    averagePrice,
    topProducts,
    recentInteractions,
    performanceMetrics: {
      engagementRate,
      searchToClickRate,
      viewToClickRate
    },
    lastUpdated: new Date().toISOString()
  };
}

// GET endpoint for brand analytics
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Brand Analytics GET request started');
    
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const detailed = searchParams.get('detailed') === 'true';
    
    console.log(`📊 Brand Analytics GET request - brand: ${brand}, detailed: ${detailed}`);
    
    // Fetch latest catalog data with error handling
    let catalogData;
    try {
      catalogData = await fetchCatalogData();
      console.log('📊 Catalog data fetched successfully');
    } catch (catalogError) {
      console.error('📊 Error fetching catalog data:', catalogError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch catalog data',
          details: catalogError instanceof Error ? catalogError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    const catalogItems = catalogData?.items || [];
    console.log(`📊 Catalog items count: ${catalogItems.length}`);
    
    if (!catalogItems || catalogItems.length === 0) {
      console.error('📊 No catalog items found');
      return NextResponse.json(
        { 
          success: false,
          error: 'No catalog data available' 
        },
        { status: 500 }
      );
    }
    
    // Get all unique brands from catalog
    const allBrands = [...new Set(catalogItems.map(item => item.brand))].sort();
    console.log(`📊 Available brands: ${allBrands.join(', ')}`);
    
    if (brand) {
      // Return specific brand analytics
      const brandAnalytics = await calculateBrandMetrics(brand, catalogItems);
      const brandProducts = catalogItems.filter(item => 
        item.brand.toLowerCase() === brand.toLowerCase()
      );
      
      console.log(`📊 Brand "${brand}" analytics:`, {
        totalInteractions: brandAnalytics.totalInteractions,
        brandScore: brandAnalytics.brandScore,
        productCount: brandAnalytics.productCount
      });
      
      return NextResponse.json({
        success: true,
        brand: brandAnalytics,
        products: detailed ? brandProducts : brandProducts.length,
        totalProducts: brandProducts.length,
        lastUpdated: brandAnalytics.lastUpdated
      });
    } else {
      // Return all brands analytics
      const brandsAnalyticsPromises = allBrands.map(async (brandName) => {
        const analytics = await calculateBrandMetrics(brandName, catalogItems);
        return {
          brand: brandName,
          analytics,
          productCount: analytics.productCount
        };
      });
      
      const brandsAnalytics = await Promise.all(brandsAnalyticsPromises);

      // Sort by brand score (highest first)
      brandsAnalytics.sort((a, b) => b.analytics.brandScore - a.analytics.brandScore);

      console.log(`📊 All brands analytics - Total brands: ${allBrands.length}`);
      
      // Get total interactions from database
      const interactions = await getInteractionsFromDatabase();
      
      return NextResponse.json({
        success: true,
        brands: brandsAnalytics,
        totalBrands: allBrands.length,
        totalProducts: catalogItems.length,
        lastUpdated: new Date().toISOString(),
        summary: {
          totalInteractions: interactions.length,
          brandsWithInteractions: brandsAnalytics.filter(b => b.analytics.totalInteractions > 0).length,
          topPerformingBrand: brandsAnalytics[0]?.brand || 'None'
        }
      });
    }
  } catch (error) {
    console.error('📊 Error getting brand analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get brand analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to sync interactions from tracking system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interactions: newInteractions } = body;
    
    if (Array.isArray(newInteractions)) {
      console.log(`📊 Brand analytics received ${newInteractions.length} interactions (no longer needed - using database)`);
      
      // Log interaction breakdown
      const breakdown = newInteractions.reduce((acc, interaction) => {
        acc[interaction.type] = (acc[interaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`📊 Interaction breakdown:`, breakdown);
      
      return NextResponse.json({ 
        success: true, 
        synced: newInteractions.length,
        breakdown,
        message: 'Brand analytics now uses database directly - no sync needed'
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid interactions data' 
    }, { status: 400 });
  } catch (error) {
    console.error('📊 Error updating brand analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update brand analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
