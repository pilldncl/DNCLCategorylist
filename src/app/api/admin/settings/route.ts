import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch system settings from Supabase
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      console.error('Error fetching system settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings.settings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings data is required' },
        { status: 400 }
      );
    }

    // Update system settings in Supabase
    const { data: updatedSettings, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        id: 'default',
        settings: settings
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating system settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
