import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({
        success: false,
        message: 'Backup file name is required'
      }, { status: 400 });
    }

    const backupDir = path.join(process.cwd(), 'data', 'backups');
    const backupPath = path.join(backupDir, filename);
    
    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({
        success: false,
        message: 'Backup file not found'
      }, { status: 404 });
    }

    // Validate filename format for security
    if (!filename.startsWith('backup-') || !filename.endsWith('.json')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid backup filename format'
      }, { status: 400 });
    }

    // Delete the backup file
    fs.unlinkSync(backupPath);
    
    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
      deletedFile: filename
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete backup',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
