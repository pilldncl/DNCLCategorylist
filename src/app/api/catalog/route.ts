import { NextRequest, NextResponse } from 'next/server';
import { CatalogItem } from '@/types/catalog';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Reduced from 50 to 20 for better performance
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const grade = searchParams.get('grade') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build optimized query with server-side filtering
    let query = supabaseAdmin
      .from('catalog_items')
      .select('id, name, brand, description, price, sku, grade, min_qty, category, image_url, created_at', { count: 'exact' });

    // Apply filters server-side
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (brand) {
      query = query.eq('brand', brand);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (grade) {
      query = query.ilike('grade', `%${grade}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: catalogItems, error, count } = await query;

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

    // Generate cache key for ETag
    const cacheKey = `catalog-${page}-${limit}-${search}-${brand}-${category}-${grade}-${sortBy}-${sortOrder}-${count}`;
    const etag = Buffer.from(cacheKey).toString('base64').slice(0, 8);

    // Set aggressive cache headers for better performance
    const headers = new Headers();
    
    // Multi-level caching strategy
    if (page === 1 && !search && !brand && !category && !grade) {
      // First page with no filters - cache longer
      headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200'); // 10 minutes cache, 20 minutes stale
    } else {
      // Filtered results - shorter cache
      headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes cache, 10 minutes stale
    }
    
    headers.set('ETag', etag);

    return NextResponse.json({ 
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: page < Math.ceil((count || 0) / limit),
        hasPrevPage: page > 1
      },
      filters: {
        search,
        brand,
        category,
        grade,
        sortBy,
        sortOrder
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
    const { name, brand, description, price, sku, grade, minQty, category, image } = body;

    // Validate required fields
    if (!name || !brand) {
      return NextResponse.json(
        { error: 'Name and brand are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('catalog_items')
      .insert({
        name,
        brand,
        description,
        price: parseFloat(price) || 0,
        sku: sku || name,
        grade: grade || 'Standard',
        min_qty: parseInt(minQty) || 1,
        category: category || 'phones',
        image_url: image || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating catalog item:', error);
      return NextResponse.json(
        { error: 'Failed to create catalog item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      item: {
        id: data.id,
        name: data.name,
        brand: data.brand,
        description: data.description,
        price: data.price,
        sku: data.sku,
        grade: data.grade,
        minQty: data.min_qty,
        category: data.category,
        image: data.image_url
      }
    });
  } catch (error) {
    console.error('Error in catalog POST:', error);
    return NextResponse.json(
      { error: 'Failed to create catalog item' },
      { status: 500 }
    );
  }
}
