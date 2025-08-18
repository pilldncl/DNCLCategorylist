import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // List available backups by reading the backup directory directly
    const backupDir = path.join(process.cwd(), 'data', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        success: true,
        message: 'No backup directory found',
        output: 'No backups available'
      });
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort((a, b) => {
        const statsA = fs.statSync(path.join(backupDir, a));
        const statsB = fs.statSync(path.join(backupDir, b));
        return statsB.mtime.getTime() - statsA.mtime.getTime(); // Newest first
      });
    
    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No backup files found',
        output: 'No backups available'
      });
    }
    
    const backupList = files.map((file, index) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return `${index + 1}. ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`;
    }).join('\n');
    
    return NextResponse.json({
      success: true,
      message: 'Backup list retrieved',
      output: `Available backups:\n${backupList}`
    });
  } catch (error) {
    console.error('Restore list error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to list backups',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { backupFile } = await request.json();
    
    if (!backupFile) {
      return NextResponse.json({
        success: false,
        message: 'Backup file name is required'
      }, { status: 400 });
    }
    
    // Run the restore script with the specified backup file
    const { stdout, stderr } = await execAsync(`npm run restore-images ${backupFile}`);
    
    if (stderr) {
      console.error('Restore script stderr:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration restored successfully',
      output: stdout
    });
  } catch (error) {
    console.error('Restore script error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to restore configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
