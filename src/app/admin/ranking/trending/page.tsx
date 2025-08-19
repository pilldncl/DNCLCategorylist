'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrendingConfig {
  updateInterval: number;
  lastUpdate: string;
  isEnabled: boolean;
}

interface TrendingMetrics {
  productId: string;
  brand: string;
  name: string;
  totalViews: number;
  totalClicks: number;
  totalSearches: number;
  trendingScore: number;
}

export default function TrendingAdminPage() {
  const [config, setConfig] = useState<TrendingConfig | null>(null);
  const [metrics, setMetrics] = useState<TrendingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getConfig' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig({
          updateInterval: data.config.updateInterval,
          lastUpdate: data.config.lastUpdate,
          isEnabled: data.config.isEnabled
        });
        setMetrics(data.sampleMetrics || []);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      setMessage({ type: 'error', text: 'Failed to load trending configuration' });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<TrendingConfig>) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          ...updates
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setMessage({ type: 'success', text: 'Configuration updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update configuration' });
      }
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    } finally {
      setUpdating(false);
    }
  };

  const forceUpdate = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forceUpdate' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Updated ${data.updated} trending items` });
        setTimeout(() => setMessage(null), 3000);
        loadConfig(); // Reload to get updated data
      } else {
        setMessage({ type: 'error', text: 'Failed to force update trending' });
      }
    } catch (error) {
      console.error('Error forcing update:', error);
      setMessage({ type: 'error', text: 'Failed to force update trending' });
    } finally {
      setUpdating(false);
    }
  };

  const clearData = async () => {
    if (!confirm('Are you sure you want to clear all trending data? This cannot be undone.')) {
      return;
    }
    
    try {
      setUpdating(true);
      const response = await fetch('/api/ranking/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearData' })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Trending data cleared successfully' });
        setTimeout(() => setMessage(null), 3000);
        loadConfig(); // Reload to get updated data
      } else {
        setMessage({ type: 'error', text: 'Failed to clear trending data' });
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: 'Failed to clear trending data' });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trending configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Admin</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending Management</h1>
                <p className="text-gray-600">Configure and manage the trending products system</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/ranking')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            >
              ← Back to Ranking
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
            
            <div className="space-y-4">
              {/* Enable/Disable Trending */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config?.isEnabled || false}
                    onChange={(e) => updateConfig({ isEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Enable Trending System</span>
                </label>
              </div>

              {/* Update Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config?.updateInterval || 5}
                  onChange={(e) => updateConfig({ updateInterval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  How often trending data should be refreshed (1-60 minutes)
                </p>
              </div>

              {/* Last Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-600">
                  {config?.lastUpdate ? new Date(config.lastUpdate).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={forceUpdate}
                disabled={updating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Force Update Trending'}
              </button>
              
              <button
                onClick={clearData}
                disabled={updating}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Clearing...' : 'Clear All Trending Data'}
              </button>
              
              <button
                onClick={loadConfig}
                disabled={updating}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Preview */}
        {metrics.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Trending Data</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Searches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.map((metric) => (
                    <tr key={metric.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.totalViews}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.totalClicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.totalSearches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {metric.trendingScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
