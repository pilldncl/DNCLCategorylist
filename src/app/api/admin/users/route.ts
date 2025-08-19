import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Get users from Supabase
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, created_at, created_by')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Format response to match frontend expectations
    const safeUsers = (users || []).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at,
      createdBy: user.created_by
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in Supabase
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password_hash: hashedPassword,
        role: role || 'user',
        created_by: null // In a real app, get from JWT token
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Return user info without password
    const userInfo = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.created_at,
      createdBy: newUser.created_by
    };

    return NextResponse.json({
      success: true,
      user: userInfo,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
