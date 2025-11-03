import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch active featured products from Supabase, ordered by display_order
    const { data, error } = await supabaseAdmin
      .from('featured_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured products from Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load featured products' },
        { status: 500 }
      );
    }

    // Transform database format to component format
    const featured = data.map(item => ({
      id: item.id,
      productId: item.product_id,
      type: item.type,
      isActive: item.is_active,
      displayOrder: item.display_order
    }));

    return NextResponse.json({
      success: true,
      featured
    });
  } catch (error) {
    console.error('Error in featured GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load featured products' },
      { status: 500 }
    );
  }
}
