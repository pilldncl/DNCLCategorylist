import { NextRequest, NextResponse } from 'next/server';

// In-memory logs storage (replace with database in production)
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
    // Return logs sorted by timestamp (newest first)
    const sortedLogs = [...activityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      logs: sortedLogs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear all logs
    activityLogs = [];
    
    console.log('All activity logs cleared');

    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}

// Helper function to add new logs (can be called from other parts of the system)
export function addLog(log: {
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'user' | 'system' | 'security' | 'ranking' | 'trending' | 'analytics';
  message: string;
  username?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}) {
  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...log
  };
  
  activityLogs.push(newLog);
  
  // Keep only last 1000 logs to prevent memory issues
  if (activityLogs.length > 1000) {
    activityLogs = activityLogs.slice(-1000);
  }
  
  console.log('Activity log added:', newLog);
}
