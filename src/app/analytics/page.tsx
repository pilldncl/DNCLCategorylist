import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard - DNCL Wholesale Catalog',
  description: 'Historical analytics and performance metrics for the wholesale catalog',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
