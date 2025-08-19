import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    // Update the item in Supabase
    const { data: updatedItem, error } = await supabaseAdmin
      .from('catalog_items')
      .update({
        name: body.name,
        brand: body.brand,
        description: body.description,
        price: parseFloat(body.price) || 0,
        sku: body.sku || body.name,
        grade: body.grade || 'Standard',
        min_qty: parseInt(body.minQty) || 1,
        category: body.category || '',
        image_url: body.image || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating catalog item:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update item' },
        { status: 500 }
      );
    }

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Transform back to expected format
    const catalogItem = {
      id: updatedItem.id,
      name: updatedItem.name,
      brand: updatedItem.brand,
      description: updatedItem.description,
      price: updatedItem.price,
      sku: updatedItem.sku || updatedItem.name,
      grade: updatedItem.grade,
      minQty: updatedItem.min_qty,
      category: updatedItem.category,
      image: updatedItem.image_url
    };

    return NextResponse.json({
      success: true,
      item: catalogItem
    });
  } catch (error) {
    console.error('Error updating catalog item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the item from Supabase
    const { error } = await supabaseAdmin
      .from('catalog_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting catalog item:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
