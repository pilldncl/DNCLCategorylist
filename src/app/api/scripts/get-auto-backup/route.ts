import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configFile = path.join(process.cwd(), 'data', 'auto-backup-config.json');

    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      return NextResponse.json({
        success: true,
        autoBackupHours: config.autoBackupHours || 48,
        lastUpdated: config.lastUpdated
      });
    } else {
      // Return default if no config file exists
      return NextResponse.json({
        success: true,
        autoBackupHours: 48,
        lastUpdated: null
      });
    }
  } catch (error) {
    console.error('Get auto-backup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get auto-backup configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
