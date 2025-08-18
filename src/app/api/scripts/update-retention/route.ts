import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { retentionDays } = await request.json();
    
    if (!retentionDays || retentionDays < 1 || retentionDays > 365) {
      return NextResponse.json({
        success: false,
        message: 'Retention days must be between 1 and 365'
      }, { status: 400 });
    }

    // Create a configuration file to store retention settings
    const configDir = path.join(process.cwd(), 'data');
    const configFile = path.join(configDir, 'retention-config.json');
    
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Save retention configuration
    const config = {
      retentionDays: parseInt(retentionDays),
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Retention policy updated successfully',
      retentionDays: parseInt(retentionDays)
    });
  } catch (error) {
    console.error('Update retention error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update retention policy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
