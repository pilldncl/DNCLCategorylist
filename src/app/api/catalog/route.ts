import { NextRequest, NextResponse } from 'next/server';
import { CatalogItem } from '@/types/catalog';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Fetch catalog data from Supabase with pagination
    const { data: catalogItems, error, count } = await supabaseAdmin
      .from('catalog_items')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching catalog from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch catalog data' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const items = (catalogItems || []).map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      description: item.description,
      price: item.price,
      sku: item.sku || item.name,
      grade: item.grade,
      minQty: item.min_qty,
      category: item.category,
      image: item.image_url
    }));

    // Set aggressive cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes cache, 10 minutes stale
    headers.set('ETag', `catalog-${count}-${page}-${limit}`);

    return NextResponse.json({ 
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, { headers });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.brand || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Name, brand, and description are required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `${body.brand}-${body.sku || body.name}`.toLowerCase().replace(/\s+/g, '-');
    
    // Create new catalog item for Supabase
    const newItem = {
      id,
      name: body.name,
      brand: body.brand,
      description: body.description,
      price: parseFloat(body.price) || 0,
      sku: body.sku || body.name,
      grade: body.grade || 'Standard',
      min_qty: parseInt(body.minQty) || 1,
      category: body.category || '',
      image_url: body.image || null
    };

    // Insert into Supabase
    const { data: insertedItem, error } = await supabaseAdmin
      .from('catalog_items')
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error('Error creating catalog item:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create item' },
        { status: 500 }
      );
    }

    // Transform back to expected format
    const catalogItem: CatalogItem = {
      id: insertedItem.id,
      name: insertedItem.name,
      brand: insertedItem.brand,
      description: insertedItem.description,
      price: insertedItem.price,
      sku: insertedItem.sku || insertedItem.name,
      grade: insertedItem.grade,
      minQty: insertedItem.min_qty,
      category: insertedItem.category,
      image: insertedItem.image_url
    };

    return NextResponse.json({
      success: true,
      item: catalogItem
    });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
