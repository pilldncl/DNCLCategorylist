import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Get user info first to check if it's the main admin
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the main admin user
    if (user.username === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the main admin user' },
        { status: 400 }
      );
    }

    // Delete user from Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
