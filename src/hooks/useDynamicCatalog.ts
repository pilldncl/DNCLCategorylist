import { useState, useEffect, useCallback } from 'react';
import { CatalogItem } from '@/types/catalog';

interface UseDynamicCatalogReturn {
  items: CatalogItem[];
  brands: string[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getBrandProducts: (brand: string) => CatalogItem[];
  getCategoryProducts: (category: string) => CatalogItem[];
  lastUpdated: Date | null;
}

export function useDynamicCatalog(): UseDynamicCatalogReturn {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch catalog data from Google Sheets
  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/catalog');
      if (!response.ok) {
        throw new Error('Failed to fetch catalog data');
      }
      
      const data = await response.json();
      setItems(data.items);
      setLastUpdated(new Date());
      
      // Extract unique brands and categories
      const uniqueBrands = [...new Set(data.items.map((item: CatalogItem) => item.brand))].sort();
      const uniqueCategories = [...new Set(data.items.map((item: CatalogItem) => item.category).filter(Boolean))].sort();
      
      setBrands(uniqueBrands);
      setCategories(uniqueCategories);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch catalog data';
      setError(errorMessage);
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get products by brand
  const getBrandProducts = useCallback((brand: string): CatalogItem[] => {
    return items.filter(item => item.brand.toLowerCase() === brand.toLowerCase());
  }, [items]);

  // Get products by category
  const getCategoryProducts = useCallback((category: string): CatalogItem[] => {
    return items.filter(item => item.category?.toLowerCase() === category.toLowerCase());
  }, [items]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchCatalogData();
  }, [fetchCatalogData]);

  // Auto-refresh every 5 minutes to keep data fresh
  useEffect(() => {
    fetchCatalogData();
    
    const interval = setInterval(() => {
      fetchCatalogData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [fetchCatalogData]);

  return {
    items,
    brands,
    categories,
    loading,
    error,
    refresh,
    getBrandProducts,
    getCategoryProducts,
    lastUpdated
  };
}

// Hook for real-time catalog monitoring
interface UseCatalogMonitoringReturn {
  newProducts: CatalogItem[];
  updatedProducts: CatalogItem[];
  removedProducts: CatalogItem[];
  changes: {
    added: number;
    updated: number;
    removed: number;
  };
}

export function useCatalogMonitoring(previousItems: CatalogItem[], currentItems: CatalogItem[]): UseCatalogMonitoringReturn {
  const [changes, setChanges] = useState({
    added: 0,
    updated: 0,
    removed: 0
  });

  useEffect(() => {
    if (previousItems.length === 0) {
      setChanges({ added: 0, updated: 0, removed: 0 });
      return;
    }

    const previousIds = new Set(previousItems.map(item => item.id));
    const currentIds = new Set(currentItems.map(item => item.id));

    // Find new products
    const newProducts = currentItems.filter(item => !previousIds.has(item.id));
    
    // Find removed products
    const removedProducts = previousItems.filter(item => !currentIds.has(item.id));
    
    // Find updated products (same ID but different data)
    const updatedProducts = currentItems.filter(currentItem => {
      const previousItem = previousItems.find(item => item.id === currentItem.id);
      if (!previousItem) return false;
      
      return JSON.stringify(currentItem) !== JSON.stringify(previousItem);
    });

    setChanges({
      added: newProducts.length,
      updated: updatedProducts.length,
      removed: removedProducts.length
    });
  }, [previousItems, currentItems]);

  return {
    newProducts: currentItems.filter(item => !previousItems.some(prev => prev.id === item.id)),
    updatedProducts: currentItems.filter(currentItem => {
      const previousItem = previousItems.find(item => item.id === currentItem.id);
      if (!previousItem) return false;
      return JSON.stringify(currentItem) !== JSON.stringify(previousItem);
    }),
    removedProducts: previousItems.filter(item => !currentItems.some(curr => curr.id === item.id)),
    changes
  };
}
