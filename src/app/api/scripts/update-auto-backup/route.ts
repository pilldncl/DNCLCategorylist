import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { autoBackupHours } = await request.json();

    // Validate auto-backup hours
    const validHours = [12, 24, 36, 48, 60, 72, 168, 336, 504];
    if (!autoBackupHours || !validHours.includes(autoBackupHours)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid auto-backup frequency. Must be one of: 12, 24, 36, 48, 60, 72, 168, 336, 504 hours'
      }, { status: 400 });
    }

    // Create a configuration file to store auto-backup settings
    const configDir = path.join(process.cwd(), 'data');
    const configFile = path.join(configDir, 'auto-backup-config.json');

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Save auto-backup configuration
    const config = {
      autoBackupHours: parseInt(autoBackupHours),
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Auto-backup frequency updated successfully',
      autoBackupHours: parseInt(autoBackupHours)
    });
  } catch (error) {
    console.error('Update auto-backup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update auto-backup frequency',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
