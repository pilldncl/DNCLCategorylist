'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDynamicImages } from '@/hooks/useDynamicImages';

export default function TestDynamicImagesPage() {
  const { getProductImage, getAllProductImages, clearCache, isLoading, error } = useDynamicImages();
  const [testResults, setTestResults] = useState<Array<{
    product: string;
    brand: string;
    imageUrl: string | null;
    allImages: string[];
    responseTime: string;
    success: boolean;
    error: string | null;
  }>>([]);
  const [selectedProduct, setSelectedProduct] = useState('PIXEL-8-128');
  const [selectedBrand, setSelectedBrand] = useState('GOOGLE');

  const testProducts = [
    { name: 'PIXEL-8-128', brand: 'GOOGLE' },
    { name: 'PIXEL-7-PRO-256', brand: 'GOOGLE' },
    { name: 'FOLD-5-512', brand: 'SAMSUNG' },
    { name: 'FLIP-5-256', brand: 'SAMSUNG' },
    { name: 'S24-128', brand: 'SAMSUNG' },
    { name: 'IPHONE-15-PRO-256', brand: 'APPLE' },
  ];

  const runTest = async () => {
    setTestResults([]);
    const results = [];

    for (const product of testProducts) {
      try {
        const startTime = performance.now();
        const imageUrl = await getProductImage(product.name, product.brand);
        const allImages = await getAllProductImages(product.name, product.brand);
        const endTime = performance.now();

        results.push({
          product: product.name,
          brand: product.brand,
          imageUrl,
          allImages,
          responseTime: `${(endTime - startTime).toFixed(2)}ms`,
          success: true,
          error: null
        });
      } catch (err) {
        results.push({
          product: product.name,
          brand: product.brand,
          imageUrl: null,
          allImages: [],
          responseTime: 'N/A',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
  };

  const testSingleProduct = async () => {
    try {
      const startTime = performance.now();
      const imageUrl = await getProductImage(selectedProduct, selectedBrand);
      const allImages = await getAllProductImages(selectedProduct, selectedBrand);
      const endTime = performance.now();

      setTestResults([{
        product: selectedProduct,
        brand: selectedBrand,
        imageUrl,
        allImages,
        responseTime: `${(endTime - startTime).toFixed(2)}ms`,
        success: true,
        error: null
      }]);
    } catch (err) {
      setTestResults([{
        product: selectedProduct,
        brand: selectedBrand,
        imageUrl: null,
        allImages: [],
        responseTime: 'N/A',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }]);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Image System Test</h1>
          <p className="mt-2 text-gray-600">
            Test the dynamic image management system functionality
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                placeholder="e.g., PIXEL-8-128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                placeholder="e.g., GOOGLE"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={testSingleProduct}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Test Single Product
              </button>
              <button
                onClick={runTest}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test All Products
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Clear Cache
            </button>
            
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-600 text-sm">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Test Results ({testResults.length})
            </h2>
          </div>
          
          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No test results yet. Run a test to see results.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {result.product}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Brand: {result.brand} | Response Time: {result.responseTime}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {result.success ? (
                    <div>
                      {/* Primary Image */}
                      {result.imageUrl && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Image:</h4>
                          <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                                                         <Image
                               src={result.imageUrl}
                               alt={`${result.product} primary image`}
                               fill
                               className="object-cover"
                               unoptimized={true}
                             />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {result.imageUrl}
                          </p>
                        </div>
                      )}

                      {/* All Images */}
                      {result.allImages && result.allImages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            All Images ({result.allImages.length}):
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {result.allImages.map((url: string, urlIndex: number) => (
                              <div key={urlIndex} className="relative group">
                                <div className="relative w-full h-24 border border-gray-200 rounded-lg overflow-hidden">
                                                                     <Image
                                     src={url}
                                     alt={`${result.product} image ${urlIndex + 1}`}
                                     fill
                                     className="object-cover"
                                     unoptimized={true}
                                   />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium"
                                  >
                                    View
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Features</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Dynamic image management</li>
                <li>• Intelligent caching (5 minutes)</li>
                <li>• Fallback to static images</li>
                <li>• Multiple images per product</li>
                <li>• Admin interface at /admin/images</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Benefits</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• No backend restarts required</li>
                <li>• No external dependencies</li>
                <li>• No API limits or costs</li>
                <li>• Full control over images</li>
                <li>• Instant updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
