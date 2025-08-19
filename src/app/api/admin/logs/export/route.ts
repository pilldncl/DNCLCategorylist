import { NextResponse } from 'next/server';

// Import the logs from the main logs route
import { addLog } from '../route';

// In-memory logs storage (same as main logs route)
const activityLogs: Array<{
  id: string;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}> = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'system',
    message: 'System initialized successfully',
    username: 'System',
    ipAddress: '127.0.0.1'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'info',
    category: 'user',
    message: 'User admin logged in successfully',
    username: 'admin',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'warning',
    category: 'ranking',
    message: 'Trending calculation took longer than expected',
    username: 'System',
    ipAddress: '127.0.0.1'
  }
];

export async function GET() {
  try {
    // Sort logs by timestamp (newest first)
    const sortedLogs = [...activityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogs: sortedLogs.length,
      logs: sortedLogs
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create response with proper headers for file download
    const response = new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

    return response;
  } catch (error) {
    console.error('Error exporting logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export logs' },
      { status: 500 }
    );
  }
}
