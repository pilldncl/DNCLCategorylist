import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all banners
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching banners:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load banners' },
        { status: 500 }
      );
    }

    // Transform to component format
    const banners = data.map(banner => ({
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

// POST - Create new banner
export async function POST(request: Request) {
  try {
    const bannerData = await request.json();
    
    // Transform to database format
    const dbData = {
      id: bannerData.id,
      title: bannerData.title,
      description: bannerData.description || null,
      image_url: bannerData.imageUrl,
      link_url: bannerData.linkUrl || null,
      link_text: bannerData.linkText || null,
      is_active: bannerData.isActive ?? true,
      display_order: bannerData.displayOrder || 1
    };

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create banner' },
        { status: 500 }
      );
    }

    // Transform back to component format
    const banner = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      imageUrl: data.image_url,
      linkUrl: data.link_url || undefined,
      linkText: data.link_text || undefined,
      isActive: data.is_active,
      displayOrder: data.display_order
    };

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error in banners POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PUT - Update existing banner
export async function PUT(request: Request) {
  try {
    const bannerData = await request.json();
    
    // Transform to database format
    const dbData = {
      title: bannerData.title,
      description: bannerData.description || null,
      image_url: bannerData.imageUrl,
      link_url: bannerData.linkUrl || null,
      link_text: bannerData.linkText || null,
      is_active: bannerData.isActive ?? true,
      display_order: bannerData.displayOrder || 1
    };

    const { data, error } = await supabaseAdmin
      .from('banners')
      .update(dbData)
      .eq('id', bannerData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update banner' },
        { status: 500 }
      );
    }

    // Transform back to component format
    const banner = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      imageUrl: data.image_url,
      linkUrl: data.link_url || undefined,
      linkText: data.link_text || undefined,
      isActive: data.is_active,
      displayOrder: data.display_order
    };

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error in banners PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE - Remove banner
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting banner:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in banners DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
