import { NextRequest, NextResponse } from 'next/server';
import { fetchCatalogData } from '@/utils/catalog';
import { supabaseAdmin } from '@/lib/supabase';

// Cache for trending data to reduce database queries
let trendingCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

// Fire badge duration configuration (in milliseconds)
const FIRE_BADGE_DURATIONS = {
  1: 2 * 60 * 60 * 1000, // 2 hours for position 1
  2: 1 * 60 * 60 * 1000, // 1 hour for position 2
  3: 30 * 60 * 1000,     // 30 minutes for position 3
  'new': 1 * 60 * 60 * 1000 // 1 hour for new items
};

// Calculate trending score based on interactions
function calculateTrendingScore(views: number, clicks: number, searches: number, lastInteraction: Date): number {
  const now = new Date();
  const hoursSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
  
  // Base score from total interactions using documented weights
  // Product View: 3.0, Result Click: 5.0, Search: 1.5
  let score = views * 3.0 + clicks * 5.0 + searches * 1.5;
  
  // Apply time decay (recent interactions are worth more)
  const decayFactor = Math.max(0.1, 1 - (hoursSinceLastInteraction / 168)); // 1 week decay
  score *= decayFactor;
  
  return Math.round(score);
}

// Update product metrics in database
async function updateProductMetrics(interaction: any) {
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
  let trendingKey = interaction.productId;
  
  if (interaction.productId && interaction.brand) {
    const brandPrefix = `${interaction.brand}-`.toLowerCase();
    if (interaction.productId.toLowerCase().startsWith(brandPrefix)) {
      trendingKey = interaction.productId.substring(brandPrefix.length);
      console.log(`Extracted product name from ID: ${interaction.productId} -> ${trendingKey}`);
    }
  }

  console.log('Updating product metrics in database:', {
    originalProductId: interaction.productId,
    trendingKey,
    type: interaction.type,
    brand: interaction.brand
  });

  try {
    // Check if product exists in trending_products table
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('trending_products')
      .select('*')
      .eq('product_id', trendingKey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching existing product:', fetchError);
      return;
    }

    const now = new Date().toISOString();
    let newViews = 0;
    let newClicks = 0;
    let newSearches = 0;

    // Update counts based on interaction type
    switch (interaction.type) {
      case 'product_view':
        newViews = 1;
        break;
      case 'result_click':
        newClicks = 1;
        break;
      case 'search':
        newSearches = 1;
        break;
    }

    if (existingProduct) {
      // Update existing product
      const updatedViews = existingProduct.total_views + newViews;
      const updatedClicks = existingProduct.total_clicks + newClicks;
      const updatedSearches = existingProduct.total_searches + newSearches;
      const newScore = calculateTrendingScore(updatedViews, updatedClicks, updatedSearches, new Date());

      const { error: updateError } = await supabaseAdmin
        .from('trending_products')
        .update({
          total_views: updatedViews,
          total_clicks: updatedClicks,
          total_searches: updatedSearches,
          trending_score: newScore,
          last_interaction: now,
          updated_at: now
        })
        .eq('product_id', trendingKey);

      if (updateError) {
        console.error('Error updating product metrics:', updateError);
      } else {
        console.log(`Updated metrics for ${trendingKey}: views=${updatedViews}, clicks=${updatedClicks}, searches=${updatedSearches}, score=${newScore}`);
      }
    } else {
      // Insert new product
      const initialScore = calculateTrendingScore(newViews, newClicks, newSearches, new Date());

      const { error: insertError } = await supabaseAdmin
        .from('trending_products')
        .insert({
          product_id: trendingKey,
          brand: interaction.brand || 'Unknown',
          name: trendingKey,
          total_views: newViews,
          total_clicks: newClicks,
          total_searches: newSearches,
          trending_score: initialScore,
          last_interaction: now,
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        console.error('Error inserting new product metrics:', insertError);
      } else {
        console.log(`Created new product metrics for ${trendingKey}: views=${newViews}, clicks=${newClicks}, searches=${newSearches}, score=${initialScore}`);
      }
    }
  } catch (error) {
    console.error('Error updating product metrics in database:', error);
  }
}

// Manage fire badges for top trending products
async function updateFireBadges(trendingProducts: any[]): Promise<any[]> {
  const now = new Date();
  
  try {
    // Clean up expired fire badges
    const { error: cleanupError } = await supabaseAdmin
      .from('fire_badges')
      .update({ is_active: false, updated_at: now.toISOString() })
      .lt('end_time', now.toISOString());

    if (cleanupError) {
      console.error('Error cleaning up expired fire badges:', cleanupError);
    }

    // Get top 3 trending products
    const top3 = trendingProducts.slice(0, 3);
    
    // Update fire badges for top 3
    for (let i = 0; i < top3.length; i++) {
      const product = top3[i];
      const position = (i + 1).toString();
      const endTime = new Date(now.getTime() + FIRE_BADGE_DURATIONS[position as keyof typeof FIRE_BADGE_DURATIONS]);

      // Check if fire badge already exists
      const { data: existingBadge, error: fetchError } = await supabaseAdmin
        .from('fire_badges')
        .select('*')
        .eq('product_id', product.product_id)
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing fire badge:', fetchError);
        continue;
      }

      if (existingBadge) {
        // Update existing badge if position changed
        if (existingBadge.position !== position) {
          const { error: updateError } = await supabaseAdmin
            .from('fire_badges')
            .update({
              position,
              start_time: now.toISOString(),
              end_time: endTime.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', existingBadge.id);

          if (updateError) {
            console.error('Error updating fire badge:', updateError);
          } else {
            console.log(`Updated fire badge for ${product.product_id}: position ${existingBadge.position} -> ${position}`);
          }
        }
      } else {
        // Create new fire badge
        const { error: insertError } = await supabaseAdmin
          .from('fire_badges')
          .insert({
            product_id: product.product_id,
            position,
            start_time: now.toISOString(),
            end_time: endTime.toISOString(),
            is_active: true,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          });

        if (insertError) {
          console.error('Error creating new fire badge:', insertError);
        } else {
          console.log(`Created new fire badge for ${product.product_id} at position ${position}`);
        }
      }
    }

    // Get active fire badges
    const { data: activeBadges, error: badgesError } = await supabaseAdmin
      .from('fire_badges')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (badgesError) {
      console.error('Error fetching active fire badges:', badgesError);
      return [];
    }

    return activeBadges || [];
  } catch (error) {
    console.error('Error updating fire badges:', error);
    return [];
  }
}

// Build enriched trending data with catalog information
async function buildEnrichedTrendingData(limit: number, brand?: string): Promise<any> {
  console.log('🔄 Building enriched trending data from database...');
  
  try {
    // Get trending products from database
    let query = supabaseAdmin
      .from('trending_products')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(limit);

    if (brand) {
      query = query.eq('brand', brand);
    }

    const { data: trendingProducts, error: trendingError } = await query;

    if (trendingError) {
      console.error('Error fetching trending products:', trendingError);
      return {
        trending: [],
        totalProducts: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Get catalog data to enrich trending products
    const catalogData = await fetchCatalogData();

    // Update fire badges for top 3
    const activeFireBadges = await updateFireBadges(trendingProducts || []);

    // Enrich with catalog data and add fire badge information
    const enrichedTrending = (trendingProducts || []).map(metrics => {
      // Try multiple matching strategies
      let catalogItem = null;
      
      // Strategy 1: Direct match by product name (SKU)
      catalogItem = catalogData.items.find(item => 
        item.name.toLowerCase() === metrics.product_id.toLowerCase()
      );
      
      if (!catalogItem) {
        // Strategy 2: Match by brand + product name combination
        catalogItem = catalogData.items.find(item => 
          `${item.brand}-${item.name}`.toLowerCase().replace(/\s+/g, '-') === metrics.product_id
        );
      }
      
      if (!catalogItem) {
        // Strategy 3: Match by product ID
        catalogItem = catalogData.items.find(item => item.id === metrics.product_id);
      }
      
      if (!catalogItem) {
        // Strategy 4: Fuzzy match by product name
        catalogItem = catalogData.items.find(item => 
          item.name.toLowerCase().includes(metrics.product_id.toLowerCase()) ||
          metrics.product_id.toLowerCase().includes(item.name.toLowerCase())
        );
      }
      
      // Check if this product has an active fire badge
      const fireBadge = activeFireBadges.find(badge => badge.product_id === metrics.product_id);
      
      return {
        productId: metrics.product_id,
        brand: metrics.brand,
        name: catalogItem?.name || metrics.name,
        description: catalogItem?.description,
        grade: catalogItem?.grade,
        minQty: catalogItem?.minQty,
        totalViews: metrics.total_views,
        totalClicks: metrics.total_clicks,
        totalSearches: metrics.total_searches,
        trendingScore: metrics.trending_score,
        lastInteraction: metrics.last_interaction,
        hasFireBadge: !!fireBadge,
        fireBadgePosition: fireBadge?.position || null,
        fireBadgeTimeRemaining: fireBadge ? Math.max(0, new Date(fireBadge.end_time).getTime() - new Date().getTime()) : null
      };
    });

    return {
      trending: enrichedTrending,
      totalProducts: enrichedTrending.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error building enriched trending data:', error);
    return {
      trending: [],
      totalProducts: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Get trending products with caching
async function getTrendingProducts(limit: number = 5) {
  const now = Date.now();
  
  // Return cached data if still valid
  if (trendingCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return trendingCache;
  }
  
  try {
    // Fetch trending products from database
    const { data: trendingData, error } = await supabaseAdmin
      .from('trending_products')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }

    // Transform and cache the data
    const transformedData = (trendingData || []).map(item => ({
      productId: item.product_id,
      brand: item.brand,
      name: item.name,
      description: item.description,
      grade: item.grade,
      minQty: item.min_qty,
      totalViews: item.total_views,
      totalClicks: item.total_clicks,
      totalSearches: item.total_searches,
      lastInteraction: item.last_interaction,
      trendingScore: item.trending_score,
      hasFireBadge: item.has_fire_badge,
      fireBadgePosition: item.fire_badge_position,
      fireBadgeTimeRemaining: item.fire_badge_time_remaining
    }));

    // Cache the results
    trendingCache = transformedData;
    cacheTimestamp = now;
    
    return transformedData;
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const brand = searchParams.get('brand');
    const force = searchParams.get('force') === 'true';
    
    // Check if trending is enabled
    const { data: config, error: configError } = await supabaseAdmin
      .from('trending_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (configError) {
      console.error('Error fetching trending config:', configError);
    }

    const isEnabled = config?.is_enabled ?? true;
    
    if (!isEnabled) {
      return NextResponse.json({
        trending: [],
        totalProducts: 0,
        lastUpdated: config?.last_update || new Date().toISOString(),
        disabled: true
      });
    }
    
    // Use cached trending data for better performance
    console.log('🔄 Getting trending data (with caching)');
    const trendingProducts = await getTrendingProducts(limit);
    
    // Filter by brand if specified
    const filteredProducts = brand 
      ? trendingProducts.filter((p: any) => p.brand.toLowerCase() === brand.toLowerCase())
      : trendingProducts;
    
    const trendingData = {
      trending: filteredProducts,
      totalProducts: filteredProducts.length,
      lastUpdated: new Date().toISOString()
    };
    
    // Update last update time
    if (config) {
      await supabaseAdmin
        .from('trending_config')
        .update({ 
          last_update: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');
    }
    
    return NextResponse.json({
      ...trendingData,
      cached: false,
      config: {
        updateInterval: config?.update_interval || 5,
        isEnabled
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

// Endpoint to manually sync interactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interactions, action } = body;
    
    // Handle different actions
    if (action === 'sync') {
      if (Array.isArray(interactions)) {
        for (const interaction of interactions) {
          await updateProductMetrics(interaction);
        }
      }
      return NextResponse.json({ success: true, synced: interactions?.length || 0 });
    }
    
    if (action === 'updateConfig') {
      const { updateInterval, isEnabled } = body;
      const updates: any = { updated_at: new Date().toISOString() };
      
      if (typeof updateInterval === 'number') {
        updates.update_interval = updateInterval;
      }
      if (typeof isEnabled === 'boolean') {
        updates.is_enabled = isEnabled;
      }
      
      const { error } = await supabaseAdmin
        .from('trending_config')
        .update(updates)
        .eq('id', 'default');
      
      if (error) {
        console.error('Error updating trending config:', error);
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, config: updates });
    }
    
    if (action === 'forceUpdate') {
      // Force update trending scores for all products
      const { data: products, error: fetchError } = await supabaseAdmin
        .from('trending_products')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching products for force update:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
      }
      
      let updatedCount = 0;
      for (const product of products || []) {
        const newScore = calculateTrendingScore(
          product.total_views,
          product.total_clicks,
          product.total_searches,
          new Date(product.last_interaction)
        );
        
        const { error: updateError } = await supabaseAdmin
          .from('trending_products')
          .update({
            trending_score: newScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);
        
        if (!updateError) {
          updatedCount++;
        }
      }
      
      return NextResponse.json({ success: true, updated: updatedCount });
    }
    
    if (action === 'getConfig') {
      const { data: config, error } = await supabaseAdmin
        .from('trending_config')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
      }
      
      const { count } = await supabaseAdmin
        .from('trending_products')
        .select('*', { count: 'exact', head: true });
      
      return NextResponse.json({ 
        success: true, 
        config,
        metricsCount: count || 0,
        weights: {
          productView: 3.0,
          resultClick: 5.0,
          search: 1.5
        }
      });
    }
    
    if (action === 'clearData') {
      const { error } = await supabaseAdmin
        .from('trending_products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) {
        console.error('Error clearing trending data:', error);
        return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, cleared: true });
    }
    
    // Default: sync interactions
    if (Array.isArray(interactions)) {
      for (const interaction of interactions) {
        await updateProductMetrics(interaction);
      }
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
