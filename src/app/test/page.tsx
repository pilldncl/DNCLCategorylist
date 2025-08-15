'use client';

import { useState } from 'react';
import { CatalogItem } from '@/types/catalog';

export default function TestPage() {
  const [parsedData, setParsedData] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const testCSVParsing = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/catalog');
      const data = await response.json();
      setParsedData(data.items);
    } catch (error) {
      console.error('Error testing CSV parsing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CSV Parsing Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={testCSVParsing}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test CSV Parsing'}
          </button>
        </div>

        {parsedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Parsed Data ({parsedData.length} items)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.brand}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.minQty}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${item.price.toFixed(2)}</td>
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
