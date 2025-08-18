import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Run the backup script
    const { stdout, stderr } = await execAsync('npm run backup-images');
    
    if (stderr) {
      console.error('Backup script stderr:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      output: stdout
    });
  } catch (error) {
    console.error('Backup script error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create backup',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
