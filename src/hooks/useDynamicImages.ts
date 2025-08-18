import { useState, useEffect, useCallback } from 'react';
import { getDynamicProductImage, getAllDynamicProductImages, clearDynamicImageCache } from '@/utils/dynamicImageMapping';

interface DeviceImage {
  device: string;
  model: string;
  brand: string;
  imageUrls: string[];
  lastUpdated: string;
}

interface ImageConfig {
  devices: DeviceImage[];
  lastUpdated: string;
}

interface UseDynamicImagesReturn {
  getProductImage: (productName: string, brand: string) => Promise<string>;
  getAllProductImages: (productName: string, brand: string) => Promise<string[]>;
  clearCache: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useDynamicImages(): UseDynamicImagesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductImage = useCallback(async (productName: string, brand: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const imageUrl = await getDynamicProductImage(productName, brand);
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get product image';
      setError(errorMessage);
      console.error('Error getting product image:', err);
      // Return fallback image
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllProductImages = useCallback(async (productName: string, brand: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const imageUrls = await getAllDynamicProductImages(productName, brand);
      return imageUrls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all product images';
      setError(errorMessage);
      console.error('Error getting all product images:', err);
      // Return fallback image as array
      return ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    clearDynamicImageCache();
    setError(null);
  }, []);

  return {
    getProductImage,
    getAllProductImages,
    clearCache,
    isLoading,
    error
  };
}

// Hook for managing image configuration
interface UseImageConfigReturn {
  config: ImageConfig;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addDevice: (deviceData: DeviceImage) => Promise<boolean>;
  updateDevice: (deviceData: DeviceImage) => Promise<boolean>;
  deleteDevice: (deviceData: DeviceImage) => Promise<boolean>;
}

export function useImageConfig(): UseImageConfigReturn {
  const [config, setConfig] = useState<ImageConfig>({ devices: [], lastUpdated: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to load image configuration');
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
      console.error('Error loading image config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDevice = useCallback(async (deviceData: DeviceImage): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deviceData,
          action: 'add'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add device');
      }

      await loadConfig();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add device';
      setError(errorMessage);
      console.error('Error adding device:', err);
      return false;
    }
  }, [loadConfig]);

  const updateDevice = useCallback(async (deviceData: DeviceImage): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deviceData,
          action: 'update'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update device');
      }

      await loadConfig();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update device';
      setError(errorMessage);
      console.error('Error updating device:', err);
      return false;
    }
  }, [loadConfig]);

  const deleteDevice = useCallback(async (deviceData: DeviceImage): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deviceData,
          action: 'delete'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete device');
      }

      await loadConfig();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete device';
      setError(errorMessage);
      console.error('Error deleting device:', err);
      return false;
    }
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    refresh: loadConfig,
    addDevice,
    updateDevice,
    deleteDevice
  };
}
