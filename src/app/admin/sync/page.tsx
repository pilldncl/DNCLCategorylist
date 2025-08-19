'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  username: string;
  role: string;
}

interface SyncLog {
  id: string;
  level: string;
  category: string;
  message: string;
  username: string;
  timestamp: string;
}

export default function SyncManagementPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      loadSyncStatus();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync');
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data.recentSyncs || []);
        if (data.recentSyncs && data.recentSyncs.length > 0) {
          setLastSync(data.recentSyncs[0].timestamp);
        }
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync-from-sheets'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Sync completed successfully! ${data.stats.syncedCount} items synced.`);
        loadSyncStatus(); // Refresh sync logs
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (error) {
      setError('Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sync Management</h1>
              <p className="mt-2 text-gray-600">
                Manage synchronization between Google Sheets and Supabase
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logged in as: <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('adminUser');
                  router.push('/admin/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Sync</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                'Sync from Google Sheets'
              )}
            </button>
            
            {lastSync && (
              <span className="text-sm text-gray-500">
                Last sync: {formatTimestamp(lastSync)}
              </span>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>• This will fetch the latest data from your Google Sheets and update Supabase</p>
            <p>• Existing items will be updated, new items will be added</p>
            <p>• The sync process is logged for tracking</p>
          </div>
        </div>

        {/* Sync Logs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sync Logs</h2>
          
          {syncLogs.length === 0 ? (
            <p className="text-gray-500">No sync logs found.</p>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.username} • {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        log.level === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : log.level === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium">Google Apps Script Setup:</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Open your Google Sheet</li>
                <li>Go to Extensions → Apps Script</li>
                <li>Copy the script from <code className="bg-blue-100 px-1 rounded">scripts/google-sheets-sync.js</code></li>
                <li>Paste it into the Apps Script editor</li>
                <li>Save and run the <code className="bg-blue-100 px-1 rounded">setupAutoSync()</code> function</li>
                <li>This will create a custom menu in your Google Sheet</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium">Automatic Sync Options:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Hourly:</strong> Runs automatically every hour</li>
                <li><strong>On Edit:</strong> Triggers when you edit the Google Sheet</li>
                <li><strong>Manual:</strong> Use the button above or Google Sheet menu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
