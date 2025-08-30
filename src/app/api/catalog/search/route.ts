import { NextRequest, NextResponse } from 'next/server';
import { fetchCatalogData } from '@/utils/catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const brand = searchParams.get('brand');

    if (!query.trim()) {
      return NextResponse.json({ items: [] });
    }

    // Fetch catalog data
    const catalogData = await fetchCatalogData();
    
    // Filter products based on search query
    let filteredItems = catalogData.items.filter(item => {
      const searchTerm = query.toLowerCase();
      const itemName = item.name.toLowerCase();
      const itemBrand = item.brand.toLowerCase();
      const itemId = item.id.toLowerCase();
      const itemDescription = (item.description || '').toLowerCase();

      return (
        itemName.includes(searchTerm) ||
        itemBrand.includes(searchTerm) ||
        itemId.includes(searchTerm) ||
        itemDescription.includes(searchTerm)
      );
    });

    // Filter by brand if specified
    if (brand) {
      filteredItems = filteredItems.filter(item => 
        item.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // Limit results
    const limitedItems = filteredItems.slice(0, limit);

    return NextResponse.json({
      items: limitedItems,
      total: filteredItems.length,
      query: query,
      limit: limit
    });

  } catch (error) {
    console.error('Error in catalog search:', error);
    return NextResponse.json(
      { error: 'Failed to search catalog' },
      { status: 500 }
    );
  }
}

