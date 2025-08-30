import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE: Remove a manual fire badge by product ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Deactivate the manual fire badge
    const { data: deletedBadge, error } = await supabaseAdmin
      .from('manual_fire_badges')
      .update({ is_active: false })
      .eq('product_id', productId)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Manual fire badge not found' },
          { status: 404 }
        );
      }
      console.error('Error removing manual fire badge:', error);
      return NextResponse.json({ error: 'Failed to remove manual fire badge' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Manual fire badge removed for product ${productId}`,
      badge: deletedBadge
    });

  } catch (error) {
    console.error('Error in manual fire badges DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to remove manual fire badge' },
      { status: 500 }
    );
  }
}

