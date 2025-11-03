import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch active banners from Supabase, ordered by display_order
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching banners from Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load banners' },
        { status: 500 }
      );
    }

    // Transform database format to component format
    const banners = (data || []).map(banner => ({
      id: banner.id,
      title: banner.title,
      description: banner.description || undefined,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url || undefined,
      linkText: banner.link_text || undefined,
      isActive: banner.is_active,
      displayOrder: banner.display_order
    }));

    return NextResponse.json({
      success: true,
      banners
    });
  } catch (error) {
    console.error('Error in banners GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load banners' },
      { status: 500 }
    );
  }
}
