import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  created_by?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password - for now we'll support both plain text (legacy) and hashed passwords
    const isValidPassword = user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password_hash)
      : user.password_hash === password;

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(`${user.id}:${user.username}:${user.role}`).toString('base64');

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at
    };

    return NextResponse.json({
      success: true,
      user: userInfo,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get users from Supabase (for other endpoints)
export async function getUsers() {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return users || [];
}
