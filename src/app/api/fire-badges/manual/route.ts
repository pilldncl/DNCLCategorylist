import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch all manual fire badges
export async function GET() {
  try {
    const { data: badges, error } = await supabaseAdmin
      .from('manual_fire_badges')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching manual fire badges:', error);
      return NextResponse.json({ error: 'Failed to fetch manual fire badges' }, { status: 500 });
    }

    // Transform database fields to camelCase for frontend
    const transformedBadges = (badges || []).map(badge => ({
      id: badge.id,
      productId: badge.product_id,
      position: badge.position,
      duration: badge.duration,
      startTime: badge.start_time,
      endTime: badge.end_time,
      isActive: badge.is_active,
      createdAt: badge.created_at,
      updatedAt: badge.updated_at
    }));

    return NextResponse.json({
      success: true,
      badges: transformedBadges
    });

  } catch (error) {
    console.error('Error in manual fire badges GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual fire badges' },
      { status: 500 }
    );
  }
}

// POST: Create a new manual fire badge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, position, duration } = body;

    if (!productId || !position || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, position, duration' },
        { status: 400 }
      );
    }

    // Calculate start and end times
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + duration * 60 * 1000).toISOString();

    // Check if position is already occupied
    const { data: existingBadge, error: checkError } = await supabaseAdmin
      .from('manual_fire_badges')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing badge:', checkError);
      return NextResponse.json({ error: 'Failed to check existing badge' }, { status: 500 });
    }

    // If position is occupied, deactivate the existing badge
    if (existingBadge) {
      const { error: deactivateError } = await supabaseAdmin
        .from('manual_fire_badges')
        .update({ is_active: false })
        .eq('position', position);

      if (deactivateError) {
        console.error('Error deactivating existing badge:', deactivateError);
        return NextResponse.json({ error: 'Failed to deactivate existing badge' }, { status: 500 });
      }
    }

    // Create new manual fire badge
    const { data: newBadge, error: insertError } = await supabaseAdmin
      .from('manual_fire_badges')
      .insert({
        product_id: productId,
        position: position,
        duration: duration,
        start_time: startTime,
        end_time: endTime,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating manual fire badge:', insertError);
      return NextResponse.json({ error: 'Failed to create manual fire badge' }, { status: 500 });
    }

    // Transform the response to camelCase
    const transformedBadge = {
      id: newBadge.id,
      productId: newBadge.product_id,
      position: newBadge.position,
      duration: newBadge.duration,
      startTime: newBadge.start_time,
      endTime: newBadge.end_time,
      isActive: newBadge.is_active,
      createdAt: newBadge.created_at,
      updatedAt: newBadge.updated_at
    };

    return NextResponse.json({
      success: true,
      badge: transformedBadge,
      message: `Manual fire badge created for position ${position}`
    });

  } catch (error) {
    console.error('Error in manual fire badges POST:', error);
    return NextResponse.json(
      { error: 'Failed to create manual fire badge' },
      { status: 500 }
    );
  }
}
