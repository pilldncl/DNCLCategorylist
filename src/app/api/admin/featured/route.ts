import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all featured products
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('featured_products')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured products:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load featured products' },
        { status: 500 }
      );
    }

    // Transform to component format
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

// POST - Create new featured product
export async function POST(request: Request) {
  try {
    const featuredData = await request.json();
    
    // Check if product is already featured
    const { data: existing } = await supabaseAdmin
      .from('featured_products')
      .select('*')
      .eq('product_id', featuredData.productId)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This product is already in the featured list' },
        { status: 400 }
      );
    }
    
    // Transform to database format
    const dbData = {
      id: featuredData.id,
      product_id: featuredData.productId,
      type: featuredData.type,
      is_active: featuredData.isActive ?? true,
      display_order: featuredData.displayOrder || 1
    };

    const { data, error } = await supabaseAdmin
      .from('featured_products')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating featured product:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create featured product' },
        { status: 500 }
      );
    }

    // Transform back to component format
    const featured = {
      id: data.id,
      productId: data.product_id,
      type: data.type,
      isActive: data.is_active,
      displayOrder: data.display_order
    };

    return NextResponse.json({ success: true, featured });
  } catch (error) {
    console.error('Error in featured POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create featured product' },
      { status: 500 }
    );
  }
}

// PUT - Update existing featured product
export async function PUT(request: Request) {
  try {
    const featuredData = await request.json();
    
    // Check if product ID is being changed and if it already exists
    const { data: current } = await supabaseAdmin
      .from('featured_products')
      .select('*')
      .eq('id', featuredData.id)
      .single();

    if (!current) {
      return NextResponse.json(
        { success: false, error: 'Featured product not found' },
        { status: 404 }
      );
    }

    if (current.product_id !== featuredData.productId) {
      const { data: existing } = await supabaseAdmin
        .from('featured_products')
        .select('*')
        .eq('product_id', featuredData.productId)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'This product is already in the featured list' },
          { status: 400 }
        );
      }
    }
    
    // Transform to database format
    const dbData = {
      product_id: featuredData.productId,
      type: featuredData.type,
      is_active: featuredData.isActive ?? true,
      display_order: featuredData.displayOrder || 1
    };

    const { data, error } = await supabaseAdmin
      .from('featured_products')
      .update(dbData)
      .eq('id', featuredData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating featured product:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update featured product' },
        { status: 500 }
      );
    }

    // Transform back to component format
    const featured = {
      id: data.id,
      productId: data.product_id,
      type: data.type,
      isActive: data.is_active,
      displayOrder: data.display_order
    };

    return NextResponse.json({ success: true, featured });
  } catch (error) {
    console.error('Error in featured PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update featured product' },
      { status: 500 }
    );
  }
}

// DELETE - Remove featured product
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    const { error } = await supabaseAdmin
      .from('featured_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting featured product:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete featured product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in featured DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete featured product' },
      { status: 500 }
    );
  }
}
