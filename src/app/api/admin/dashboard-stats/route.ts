import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchCatalogData } from '@/utils/catalog';

export async function GET() {
  try {
    // Get total brands from catalog data
    const catalogData = await fetchCatalogData();
    const totalBrands = new Set(catalogData.items.map(item => item.brand)).size;
    const totalProducts = catalogData.items.length;

    // Get trending products count from database
    const { count: trendingCount, error: trendingError } = await supabaseAdmin
      .from('trending_products')
      .select('*', { count: 'exact', head: true });

    if (trendingError) {
      console.error('Error fetching trending products count:', trendingError);
    }

    // Get active users (sessions with interactions in the last 24 hours)
    const { data: activeUsers, error: usersError } = await supabaseAdmin
      .from('user_interactions')
      .select('session_id')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('session_id', 'is', null);

    if (usersError) {
      console.error('Error fetching active users:', usersError);
    }

    // Count unique sessions for active users
    const uniqueActiveUsers = activeUsers ? new Set(activeUsers.map(u => u.session_id)).size : 0;

    // Get total interactions count
    const { count: interactionsCount, error: interactionsError } = await supabaseAdmin
      .from('user_interactions')
      .select('*', { count: 'exact', head: true });

    if (interactionsError) {
      console.error('Error fetching total interactions:', interactionsError);
    }

    // Get fire badges count
    const { count: badgesCount, error: badgesError } = await supabaseAdmin
      .from('fire_badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (badgesError) {
      console.error('Error fetching fire badges:', badgesError);
    }

    // Get dynamic images count
    const { data: dynamicImages, count: imagesCount, error: imagesError } = await supabaseAdmin
      .from('dynamic_images')
      .select('*', { count: 'exact', head: true });

    if (imagesError) {
      console.error('Error fetching dynamic images:', imagesError);
    }

    const stats = {
      totalBrands,
      totalProducts,
      trendingProducts: trendingCount || 0,
      activeUsers: uniqueActiveUsers,
      totalInteractions: interactionsCount || 0,
      fireBadges: badgesCount || 0,
      dynamicImages: imagesCount || 0,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        stats: {
          totalBrands: 0,
          totalProducts: 0,
          trendingProducts: 0,
          activeUsers: 0,
          totalInteractions: 0,
          fireBadges: 0,
          dynamicImages: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
