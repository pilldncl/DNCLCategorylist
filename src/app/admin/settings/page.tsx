'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  username: string;
  role: 'admin' | 'user';
  token: string;
}

interface SystemSettings {
  ranking: {
    pageViewWeight: number;
    categoryViewWeight: number;
    productViewWeight: number;
    resultClickWeight: number;
    searchWeight: number;
    recencyWeight: number;
  };
  trending: {
    cacheDuration: number;
    maxTrendingItems: number;
    updateInterval: number;
  };
  analytics: {
    retentionDays: number;
    autoCleanup: boolean;
    detailedLogging: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requirePasswordChange: boolean;
  };
}

export default function SystemSettingsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    ranking: {
      pageViewWeight: 1.0,
      categoryViewWeight: 2.0,
      productViewWeight: 3.0,
      resultClickWeight: 5.0,
      searchWeight: 1.5,
      recencyWeight: 2.0,
    },
    trending: {
      cacheDuration: 300,
      maxTrendingItems: 10,
      updateInterval: 60,
    },
    analytics: {
      retentionDays: 30,
      autoCleanup: true,
      detailedLogging: false,
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      requirePasswordChange: false,
    },
  });
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
      if (userData.role !== 'admin') {
        router.push('/admin');
        return;
      }
      setUser(userData);
      loadSettings();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save settings');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to save settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        ranking: {
          pageViewWeight: 1.0,
          categoryViewWeight: 2.0,
          productViewWeight: 3.0,
          resultClickWeight: 5.0,
          searchWeight: 1.5,
          recencyWeight: 2.0,
        },
        trending: {
          cacheDuration: 300,
          maxTrendingItems: 10,
          updateInterval: 60,
        },
        analytics: {
          retentionDays: 30,
          autoCleanup: true,
          detailedLogging: false,
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          requirePasswordChange: false,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ranking Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ranking Algorithm</h2>
              <p className="text-sm text-gray-600">Configure interaction weights for ranking</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page View Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.pageViewWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, pageViewWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category View Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.categoryViewWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, categoryViewWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product View Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.productViewWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, productViewWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result Click Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.resultClickWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, resultClickWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.searchWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, searchWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recency Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ranking.recencyWeight}
                  onChange={(e) => setSettings({
                    ...settings,
                    ranking: { ...settings.ranking, recencyWeight: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Trending Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Trending System</h2>
              <p className="text-sm text-gray-600">Configure trending product settings</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cache Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.trending.cacheDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    trending: { ...settings.trending, cacheDuration: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Trending Items
                </label>
                <input
                  type="number"
                  value={settings.trending.maxTrendingItems}
                  onChange={(e) => setSettings({
                    ...settings,
                    trending: { ...settings.trending, maxTrendingItems: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Interval (seconds)
                </label>
                <input
                  type="number"
                  value={settings.trending.updateInterval}
                  onChange={(e) => setSettings({
                    ...settings,
                    trending: { ...settings.trending, updateInterval: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Analytics Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-600">Configure analytics and logging</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  value={settings.analytics.retentionDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    analytics: { ...settings.analytics, retentionDays: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.analytics.autoCleanup}
                  onChange={(e) => setSettings({
                    ...settings,
                    analytics: { ...settings.analytics, autoCleanup: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Auto cleanup old data
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.analytics.detailedLogging}
                  onChange={(e) => setSettings({
                    ...settings,
                    analytics: { ...settings.analytics, detailedLogging: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable detailed logging
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Configure security settings</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requirePasswordChange}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, requirePasswordChange: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Require password change on next login
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
