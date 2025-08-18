'use client';

import { useState, useEffect } from 'react';
import ExternalImage from '@/components/ExternalImage';
import { clearDynamicImageCache } from '@/utils/dynamicImageMapping';

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

interface CatalogItem {
  id: string;
  brand: string;
  name: string;
  grade: string;
  minQty: number;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface ProductWithImages {
  catalogItem: CatalogItem;
  deviceImage?: DeviceImage;
  hasImages: boolean;
  imageCount: number;
}

export default function ImageManagementPage() {
  const [config, setConfig] = useState<ImageConfig>({ devices: [], lastUpdated: '' });
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [productsWithImages, setProductsWithImages] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<DeviceImage | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showOnlyWithImages, setShowOnlyWithImages] = useState(false);
  const [showOnlyWithoutImages, setShowOnlyWithoutImages] = useState(false);
  
  // Form state for adding/editing
  const [formData, setFormData] = useState({
    device: '',
    model: '',
    brand: '',
    imageUrls: ['']
  });

  // Image preview and validation state
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: {url: string, isValid: boolean, isLoading: boolean}}>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load catalog data
  const loadCatalogData = async () => {
    try {
      const response = await fetch('/api/catalog');
      if (!response.ok) {
        throw new Error('Failed to load catalog data');
      }
      const data = await response.json();
      setCatalogItems(data.items);
    } catch (err) {
      console.error('Error loading catalog:', err);
    }
  };

  // Load image configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to load image configuration');
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  // Sync catalog items with image configurations
  const syncProductsWithImages = () => {
    const products: ProductWithImages[] = catalogItems.map(item => {
      // Parse SKU to extract device and model
      const skuParts = item.name.split('-');
      let device = '';
      let model = '';
      
      if (skuParts.length >= 2) {
        device = skuParts[0];
        model = skuParts[1];
      } else {
        device = item.name;
        model = '';
      }
      
      // Find matching device image configuration
      const deviceImage = config.devices.find(d => 
        d.device.toUpperCase() === device.toUpperCase() && 
        d.model.toUpperCase() === model.toUpperCase() && 
        d.brand.toUpperCase() === item.brand.toUpperCase()
      );
      
      return {
        catalogItem: item,
        deviceImage,
        hasImages: !!deviceImage && deviceImage.imageUrls.length > 0,
        imageCount: deviceImage ? deviceImage.imageUrls.length : 0
      };
    });
    
    setProductsWithImages(products);
  };

  // Load both catalog and image data
  const loadAllData = async () => {
    await Promise.all([loadCatalogData(), loadConfig()]);
  };

  // Load retention configuration
  const loadRetentionConfig = async () => {
    try {
      const response = await fetch('/api/scripts/get-retention');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRetentionDays(data.retentionDays);
        }
      }
    } catch (error) {
      console.error('Failed to load retention config:', error);
    }
  };

  // Load auto-backup configuration
  const loadAutoBackupConfig = async () => {
    try {
      const response = await fetch('/api/scripts/get-auto-backup');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAutoBackupHours(data.autoBackupHours);
        }
      }
    } catch (error) {
      console.error('Failed to load auto-backup config:', error);
    }
  };

  useEffect(() => {
    loadAllData();
    loadRetentionConfig();
    loadAutoBackupConfig();
  }, []);

  // Sync products when either catalog or config changes
  useEffect(() => {
    if (catalogItems.length > 0) {
      syncProductsWithImages();
    }
  }, [catalogItems, config]);

  // Filter products based on search and filters
  const filteredProducts = productsWithImages.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.catalogItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.catalogItem.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.catalogItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = selectedBrand === '' || product.catalogItem.brand === selectedBrand;
    
    const matchesImageFilter = 
      (!showOnlyWithImages && !showOnlyWithoutImages) ||
      (showOnlyWithImages && product.hasImages) ||
      (showOnlyWithoutImages && !product.hasImages);
    
    return matchesSearch && matchesBrand && matchesImageFilter;
  });

  // Get unique brands for filter
  const uniqueBrands = [...new Set(catalogItems.map(item => item.brand))].sort();

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrand, showOnlyWithImages, showOnlyWithoutImages]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Settings and script execution functions
  const [scriptLoading, setScriptLoading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [availableBackups, setAvailableBackups] = useState<Array<{filename: string;size: number;modified: string;age: number;}>>([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [backupManagerView, setBackupManagerView] = useState<'list' | 'details'>('list');
  const [retentionDays, setRetentionDays] = useState(30);
  const [isEditingRetention, setIsEditingRetention] = useState(false);
  const [autoBackupHours, setAutoBackupHours] = useState(48); // Default 48 hours
  const [isEditingAutoBackup, setIsEditingAutoBackup] = useState(false);

  const executeScript = async (scriptType: string, backupFile?: string) => {
    try {
      setScriptLoading(scriptType);
      
      let response;
      if (scriptType === 'backup') {
        response = await fetch('/api/scripts/backup', { method: 'POST' });
      } else if (scriptType === 'restore' && backupFile) {
        response = await fetch('/api/scripts/restore', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backupFile })
        });
      } else {
        throw new Error('Invalid script type');
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`${scriptType.charAt(0).toUpperCase() + scriptType.slice(1)} completed successfully!`);
        // Reload data after script execution
        await loadAllData();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Failed to execute ${scriptType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScriptLoading(null);
    }
  };

  const openBackupManager = async () => {
    try {
      setScriptLoading('list-backups');
      const response = await fetch('/api/scripts/restore');
      const result = await response.json();
      
      if (result.success) {
        // Parse the output to extract backup information
        const lines = result.output.split('\n');
        const backupFiles = lines
          .filter((line: string) => line.includes('backup-') && line.includes('.json'))
          .map((line: string) => {
            const match = line.match(/\d+\.\s+(backup-.*\.json)\s+\((\d+)\s+bytes,\s+(.+)\)/);
            if (match) {
              const filename = match[1];
              const size = parseInt(match[2]);
              const modified = match[3];
              const modifiedDate = new Date(modified);
              const age = Math.floor((Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return {
                filename,
                size,
                modified,
                age
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{
            filename: string;
            size: number;
            modified: string;
            age: number;
          }>;
        
        setAvailableBackups(backupFiles);
        setShowBackupManager(true);
        setBackupManagerView('list');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Failed to load backups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScriptLoading(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) {
      alert('Please select a backup file to restore from');
      return;
    }
    
    await executeScript('restore', selectedBackup);
    setShowBackupManager(false);
    setSelectedBackup('');
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }
    
    try {
      setScriptLoading('delete-backup');
      const response = await fetch('/api/scripts/delete-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Backup deleted successfully!');
        // Refresh the backup list
        await openBackupManager();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScriptLoading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAgeColor = (age: number) => {
    if (age > retentionDays) return 'text-red-600'; // Over retention period (auto-delete)
    
    const percentageRemaining = ((retentionDays - age) / retentionDays) * 100;
    
    if (percentageRemaining > 70) return 'text-green-600'; // First 30% of retention time
    if (percentageRemaining > 40) return 'text-yellow-600'; // Next 30% of retention time
    return 'text-red-600'; // Last 40% of retention time
  };

  const getAgeStatus = (age: number) => {
    if (age > retentionDays) return 'Auto-delete';
    
    const percentageRemaining = ((retentionDays - age) / retentionDays) * 100;
    
    if (percentageRemaining > 70) return 'Fresh';
    if (percentageRemaining > 40) return 'Recent';
    return 'Aging';
  };

  // Auto-backup frequency options
  const autoBackupOptions = [
    { value: 12, label: '12 hours' },
    { value: 24, label: '1 day' },
    { value: 36, label: '1.5 days' },
    { value: 48, label: '2 days' },
    { value: 60, label: '2.5 days' },
    { value: 72, label: '3 days' },
    { value: 168, label: '1 week' },
    { value: 336, label: '2 weeks' },
    { value: 504, label: '3 weeks' }
  ];

  const formatAutoBackupLabel = (hours: number) => {
    const option = autoBackupOptions.find(opt => opt.value === hours);
    return option ? option.label : `${hours} hours`;
  };

  // Validate image URL and update preview
  const validateImageUrl = async (url: string, index: number) => {
    if (!url.trim()) {
      setImagePreviews(prev => ({
        ...prev,
        [`${editingProductId}-${index}`]: { url: '', isValid: false, isLoading: false }
      }));
      return;
    }

    setImagePreviews(prev => ({
      ...prev,
      [`${editingProductId}-${index}`]: { url, isValid: false, isLoading: true }
    }));

    try {
      const img = new window.Image();
      img.onload = () => {
        setImagePreviews(prev => ({
          ...prev,
          [`${editingProductId}-${index}`]: { url, isValid: true, isLoading: false }
        }));
      };
      img.onerror = () => {
        setImagePreviews(prev => ({
          ...prev,
          [`${editingProductId}-${index}`]: { url, isValid: false, isLoading: false }
        }));
      };
      img.src = url;
    } catch {
      setImagePreviews(prev => ({
        ...prev,
        [`${editingProductId}-${index}`]: { url, isValid: false, isLoading: false }
      }));
    }
  };

  // Debounced URL validation
  const debouncedValidateUrl = (url: string, index: number) => {
    const timeoutId = setTimeout(() => validateImageUrl(url, index), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleUpdateRetention = async () => {
    try {
      setScriptLoading('update-retention');
      const response = await fetch('/api/scripts/update-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Retention policy updated successfully!');
        setIsEditingRetention(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Failed to update retention policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScriptLoading(null);
    }
  };

  const handleUpdateAutoBackup = async () => {
    try {
      setScriptLoading('update-auto-backup');
      const response = await fetch('/api/scripts/update-auto-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBackupHours })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Auto-backup frequency updated successfully!');
        setIsEditingAutoBackup(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Failed to update auto-backup frequency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScriptLoading(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const action = editingDevice ? 'update' : 'add';
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          action,
          imageUrls: formData.imageUrls.filter(url => url.trim() !== '')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save image configuration');
      }

      const result = await response.json();
      alert(result.message);
      
      // Clear dynamic image cache to ensure fresh data
      clearDynamicImageCache();
      
      // Reset form and reload config
      setFormData({ device: '', model: '', brand: '', imageUrls: [''] });
      setEditingDevice(null);
      setIsAdding(false);
      setEditingProductId(null);
      setImagePreviews({});
      await loadConfig();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  // Handle adding images for a catalog item
  const handleAddImagesForProduct = (product: ProductWithImages) => {
    const skuParts = product.catalogItem.name.split('-');
    let device = '';
    let model = '';
    
    if (skuParts.length >= 2) {
      device = skuParts[0];
      model = skuParts[1];
    } else {
      device = product.catalogItem.name;
      model = '';
    }
    
    setFormData({
      device: device,
      model: model,
      brand: product.catalogItem.brand,
      imageUrls: ['']
    });
    setIsAdding(true);
    setEditingDevice(null);
    setEditingProductId(product.catalogItem.id);
    setImagePreviews({});
  };

  // Handle editing images for a catalog item
  const handleEditImagesForProduct = (product: ProductWithImages) => {
    if (product.deviceImage) {
      setEditingDevice(product.deviceImage);
      setFormData({
        device: product.deviceImage.device,
        model: product.deviceImage.model,
        brand: product.deviceImage.brand,
        imageUrls: product.deviceImage.imageUrls.length > 0 ? product.deviceImage.imageUrls : ['']
      });
      setIsAdding(false);
      setEditingProductId(product.catalogItem.id);
      setImagePreviews({});
    }
  };

  // Handle delete
  const handleDelete = async (device: DeviceImage) => {
    if (!confirm(`Are you sure you want to delete ${device.device} ${device.model}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: device.device,
          model: device.model,
          brand: device.brand,
          action: 'delete'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image configuration');
      }

      const result = await response.json();
      alert(result.message);
      
      // Clear dynamic image cache to ensure fresh data
      clearDynamicImageCache();
      
      await loadConfig();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete configuration');
    }
  };

  // Handle edit
  const handleEdit = (device: DeviceImage) => {
    setEditingDevice(device);
    setFormData({
      device: device.device,
      model: device.model,
      brand: device.brand,
      imageUrls: device.imageUrls.length > 0 ? device.imageUrls : ['']
    });
    setIsAdding(false);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingDevice(null);
    setFormData({ device: '', model: '', brand: '', imageUrls: [''] });
    setIsAdding(true);
  };

  // Add image URL field
  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, '']
    }));
  };

  // Remove image URL field
  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
    
    // Clear preview for this index
    if (editingProductId) {
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[`${editingProductId}-${index}`];
        return newPreviews;
      });
    }
  };

  // Update image URL
  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }));
    
    // Trigger validation if we have an editing product
    if (editingProductId) {
      debouncedValidateUrl(value, index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading image configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadConfig} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900">Dynamic Image Management</h1>
           <p className="mt-2 text-gray-600">
             Manage product images dynamically based on your catalog data
           </p>
           <div className="flex items-center justify-between mt-2">
             <div className="flex items-center space-x-4 text-sm text-gray-500">
               <span>Catalog Items: {catalogItems.length}</span>
               <span>•</span>
               <span>With Images: {productsWithImages.filter(p => p.hasImages).length}</span>
               <span>•</span>
               <span>Without Images: {productsWithImages.filter(p => !p.hasImages).length}</span>
               <span>•</span>
               <span>Last updated: {new Date(config.lastUpdated).toLocaleString()}</span>
             </div>
             
             {/* Settings Button */}
             <button
               onClick={() => setShowSettings(true)}
               className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               Settings
             </button>
           </div>
         </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, brand, or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Image Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyWithImages}
                    onChange={(e) => {
                      setShowOnlyWithImages(e.target.checked);
                      if (e.target.checked) setShowOnlyWithoutImages(false);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">With Images Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyWithoutImages}
                    onChange={(e) => {
                      setShowOnlyWithoutImages(e.target.checked);
                      if (e.target.checked) setShowOnlyWithImages(false);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Without Images Only</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('');
                  setShowOnlyWithImages(false);
                  setShowOnlyWithoutImages(false);
                }}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                onClick={loadAllData}
                disabled={loading}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50"
                title="Refresh catalog and image data"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Top Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                </span>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mt-4">
              {/* Previous button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Next button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

                 {/* Inline Add/Edit Form - will be rendered below each product row */}

                {/* Product List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Catalog Products ({filteredProducts.length} of {productsWithImages.length})
            </h2>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {productsWithImages.length === 0 
                  ? 'No catalog items found. Please check your catalog data.' 
                  : 'No products match your current filters.'}
              </p>
              {productsWithImages.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('');
                    setShowOnlyWithImages(false);
                    setShowOnlyWithoutImages(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
                         <div className="divide-y divide-gray-200">
               {currentProducts.map((product) => (
                 <div key={product.catalogItem.id}>
                   <div className="p-6">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="flex items-center space-x-4 mb-4">
                           <h3 className="text-lg font-medium text-gray-900">
                             {product.catalogItem.name}
                           </h3>
                           <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                             {product.catalogItem.brand}
                           </span>
                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                             product.hasImages 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-red-100 text-red-800'
                           }`}>
                             {product.hasImages 
                               ? `${product.imageCount} image${product.imageCount !== 1 ? 's' : ''}` 
                               : 'No Images'}
                           </span>
                           <span className="text-sm text-gray-500">
                             ${product.catalogItem.price}
                           </span>
                         </div>
                         
                         {product.catalogItem.description && (
                           <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                             {product.catalogItem.description}
                           </p>
                         )}
                         
                         {/* Show existing images if any */}
                         {product.hasImages && product.deviceImage && (
                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                             {product.deviceImage.imageUrls.map((url, urlIndex) => (
                               <div key={urlIndex} className="relative group">
                                 <ExternalImage
                                   src={url}
                                   alt={`${product.catalogItem.name} - Image ${urlIndex + 1}`}
                                   width={100}
                                   height={100}
                                   className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                 />
                                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                   <a
                                     href={url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium"
                                   >
                                     View Full Size
                                   </a>
                                 </div>
                               </div>
                             ))}
                           </div>
                         )}
                         
                         {/* Show placeholder for products without images */}
                         {!product.hasImages && (
                           <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                             <p className="text-sm text-gray-500 text-center">
                               No images configured for this product
                             </p>
                           </div>
                         )}
                       </div>
                       
                       <div className="flex space-x-2 ml-4">
                         {product.hasImages ? (
                           <>
                             <button
                               onClick={() => handleEditImagesForProduct(product)}
                               className="px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 text-sm"
                             >
                               Edit Images
                             </button>
                             <button
                               onClick={() => handleDelete(product.deviceImage!)}
                               className="px-3 py-1 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 text-sm"
                             >
                               Delete Images
                             </button>
                           </>
                         ) : (
                           <button
                             onClick={() => handleAddImagesForProduct(product)}
                             className="px-3 py-1 text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50 text-sm"
                           >
                             Add Images
                           </button>
                         )}
                       </div>
                     </div>
                   </div>

                   {/* Inline Edit/Add Form - appears below the product row */}
                   {editingProductId === product.catalogItem.id && (isAdding || editingDevice) && (
                     <div className="bg-blue-50 border-t border-blue-200 p-6">
                       <div className="max-w-4xl mx-auto">
                         <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           {editingDevice ? 'Edit Product Images' : 'Add Product Images'}
                         </h3>
                         
                         <form onSubmit={handleSubmit} className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Device
                               </label>
                               <input
                                 type="text"
                                 value={formData.device}
                                 onChange={(e) => setFormData(prev => ({ ...prev, device: e.target.value }))}
                                 placeholder="e.g., PIXEL, FOLD, FLIP"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 required
                               />
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Model
                               </label>
                               <input
                                 type="text"
                                 value={formData.model}
                                 onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                 placeholder="e.g., 8, 7-PRO, 5"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 required
                               />
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Brand
                               </label>
                               <select
                                 value={formData.brand}
                                 onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 required
                               >
                                 <option value="">Select Brand</option>
                                 {uniqueBrands.map(brand => (
                                   <option key={brand} value={brand}>{brand}</option>
                                 ))}
                               </select>
                             </div>
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Image URLs with Preview
                             </label>
                             <div className="space-y-4">
                               {formData.imageUrls.map((url, index) => {
                                 const previewKey = `${editingProductId}-${index}`;
                                 const preview = imagePreviews[previewKey];
                                 
                                 return (
                                   <div key={index} className="space-y-2">
                                     <div className="flex space-x-2">
                                       <input
                                         type="url"
                                         value={url}
                                         onChange={(e) => updateImageUrl(index, e.target.value)}
                                         placeholder="https://example.com/image.jpg"
                                         className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                           preview?.isValid ? 'border-green-300' : 
                                           preview?.isValid === false ? 'border-red-300' : 
                                           'border-gray-300'
                                         }`}
                                         required
                                       />
                                       {formData.imageUrls.length > 1 && (
                                         <button
                                           type="button"
                                           onClick={() => removeImageUrl(index)}
                                           className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                                         >
                                           Remove
                                         </button>
                                       )}
                                     </div>
                                     
                                     {/* URL Validation Feedback */}
                                     {url.trim() && (
                                       <div className="flex items-center space-x-2">
                                         {preview?.isLoading ? (
                                           <div className="flex items-center text-blue-600">
                                             <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                             <span className="text-sm">Validating URL...</span>
                                           </div>
                                         ) : preview?.isValid ? (
                                           <div className="flex items-center text-green-600">
                                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                             </svg>
                                             <span className="text-sm">Valid image URL</span>
                                           </div>
                                         ) : preview?.isValid === false ? (
                                           <div className="flex items-center text-red-600">
                                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                             </svg>
                                             <span className="text-sm">Cannot process this URL</span>
                                           </div>
                                         ) : null}
                                       </div>
                                     )}
                                     
                                     {/* Image Preview */}
                                     {preview?.isValid && (
                                       <div className="mt-2">
                                         <div className="relative inline-block">
                                           <ExternalImage
                                             src={url}
                                             alt={`Preview ${index + 1}`}
                                             width={120}
                                             height={120}
                                             className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                           />
                                           <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                             ✓
                                           </div>
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 );
                               })}
                               
                               <button
                                 type="button"
                                 onClick={addImageUrl}
                                 className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                               >
                                 + Add Another Image URL
                               </button>
                             </div>
                           </div>

                           <div className="flex space-x-4 pt-4 border-t border-blue-200">
                             <button
                               type="submit"
                               className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                             >
                               {editingDevice ? 'Update' : 'Add'} Product Images
                             </button>
                             <button
                               type="button"
                               onClick={() => {
                                 setEditingDevice(null);
                                 setIsAdding(false);
                                 setEditingProductId(null);
                                 setImagePreviews({});
                                 setFormData({ device: '', model: '', brand: '', imageUrls: [''] });
                               }}
                               className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                             >
                               Cancel
                             </button>
                           </div>
                         </form>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}

           {/* Pagination Controls */}
           {totalPages > 1 && (
             <div className="bg-white border-t border-gray-200 px-6 py-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-700">
                     Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                   </span>
                 </div>
                 
                 <div className="flex items-center space-x-2">
                   {/* Items per page selector */}
                   <div className="flex items-center space-x-2">
                     <label className="text-sm text-gray-700">Show:</label>
                     <select
                       value={itemsPerPage}
                       onChange={(e) => {
                         setItemsPerPage(Number(e.target.value));
                         setCurrentPage(1);
                       }}
                       className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value={5}>5</option>
                       <option value={10}>10</option>
                       <option value={20}>20</option>
                       <option value={50}>50</option>
                     </select>
                     <span className="text-sm text-gray-700">per page</span>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center justify-center space-x-2 mt-4">
                 {/* Previous button */}
                 <button
                   onClick={goToPreviousPage}
                   disabled={currentPage === 1}
                   className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Previous
                 </button>
                 
                 {/* Page numbers */}
                 <div className="flex items-center space-x-1">
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     let pageNum;
                     if (totalPages <= 5) {
                       pageNum = i + 1;
                     } else if (currentPage <= 3) {
                       pageNum = i + 1;
                     } else if (currentPage >= totalPages - 2) {
                       pageNum = totalPages - 4 + i;
                     } else {
                       pageNum = currentPage - 2 + i;
                     }
                     
                     return (
                       <button
                         key={pageNum}
                         onClick={() => goToPage(pageNum)}
                         className={`px-3 py-1 text-sm border rounded-md ${
                           currentPage === pageNum
                             ? 'bg-blue-600 text-white border-blue-600'
                             : 'border-gray-300 hover:bg-gray-50'
                         }`}
                       >
                         {pageNum}
                       </button>
                     );
                   })}
                 </div>
                 
                 {/* Next button */}
                 <button
                   onClick={goToNextPage}
                   disabled={currentPage === totalPages}
                   className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>

                 {/* Settings Modal */}
         {showSettings && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
               {/* Header */}
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-semibold text-gray-900">
                   System Settings
                 </h3>
                 <button
                   onClick={() => setShowSettings(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto">
                 <div className="space-y-6">
                   {/* Backup & Recovery Section */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                       <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                       </svg>
                       Backup & Recovery
                     </h4>
                     <p className="text-sm text-gray-600 mb-4">
                       Manage system backups and data recovery options
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {/* Create Backup */}
                       <button
                         onClick={() => {
                           setShowSettings(false);
                           executeScript('backup');
                         }}
                         disabled={scriptLoading !== null}
                         className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                         {scriptLoading === 'backup' ? (
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                         ) : (
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                           </svg>
                         )}
                         Create Backup
                       </button>

                       {/* Backup Manager */}
                       <button
                         onClick={() => {
                           setShowSettings(false);
                           openBackupManager();
                         }}
                         disabled={scriptLoading !== null}
                         className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                         {scriptLoading === 'list-backups' ? (
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                         ) : (
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                         )}
                         Backup Manager
                       </button>
                     </div>
                   </div>

                   {/* System Information Section */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                       <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       System Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="font-medium text-gray-700">Catalog Items:</span>
                         <span className="ml-2 text-gray-600">{catalogItems.length}</span>
                       </div>
                       <div>
                         <span className="font-medium text-gray-700">With Images:</span>
                         <span className="ml-2 text-gray-600">{productsWithImages.filter(p => p.hasImages).length}</span>
                       </div>
                       <div>
                         <span className="font-medium text-gray-700">Without Images:</span>
                         <span className="ml-2 text-gray-600">{productsWithImages.filter(p => !p.hasImages).length}</span>
                       </div>
                       <div>
                         <span className="font-medium text-gray-700">Last Updated:</span>
                         <span className="ml-2 text-gray-600">{new Date(config.lastUpdated).toLocaleString()}</span>
                       </div>
                     </div>
                   </div>

                   {/* Cache Management Section */}
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                     <h4 className="text-lg font-medium text-yellow-900 mb-3 flex items-center">
                       <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                       Cache Management
                     </h4>
                     <div className="text-sm text-yellow-800 space-y-2">
                       <p>• <span className="font-medium">Image Cache:</span> 5-minute cache for dynamic images</p>
                       <p>• <span className="font-medium">Status:</span> Cache helps improve performance</p>
                       <p className="mt-3 text-xs">Clear cache if images are not updating immediately after changes.</p>
                     </div>
                     <div className="mt-3">
                       <button
                         onClick={() => {
                           clearDynamicImageCache();
                           alert('Image cache cleared successfully!');
                         }}
                         className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                       >
                         Clear Image Cache
                       </button>
                     </div>
                   </div>

                                                           {/* Auto-Backup Section */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-green-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Auto-Backup Frequency
                        </h4>
                        {!isEditingAutoBackup && (
                          <button
                            onClick={() => setIsEditingAutoBackup(true)}
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {isEditingAutoBackup ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-green-900">
                              Backup Frequency:
                            </label>
                            <select
                              value={autoBackupHours}
                              onChange={(e) => setAutoBackupHours(parseInt(e.target.value))}
                              className="px-3 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              {autoBackupOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateAutoBackup}
                              disabled={scriptLoading === 'update-auto-backup'}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {scriptLoading === 'update-auto-backup' ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingAutoBackup(false);
                                setAutoBackupHours(48); // Reset to default
                              }}
                              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-green-800 space-y-2">
                          <p>• <span className="font-medium">Current Frequency:</span> {formatAutoBackupLabel(autoBackupHours)}</p>
                          <p>• <span className="font-medium">Next Backup:</span> Automatically scheduled</p>
                          <p className="mt-3 text-xs">System will automatically create backups at the specified interval.</p>
                        </div>
                      )}
                    </div>

                    {/* Retention Policy Section */}
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="text-lg font-medium text-blue-900 flex items-center">
                           <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Backup Retention Policy
                         </h4>
                         {!isEditingRetention && (
                           <button
                             onClick={() => setIsEditingRetention(true)}
                             className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                           >
                             Edit
                           </button>
                         )}
                       </div>
                       
                       {isEditingRetention ? (
                         <div className="space-y-3">
                           <div className="flex items-center space-x-3">
                             <label className="text-sm font-medium text-blue-900">
                               Retention Period:
                             </label>
                             <input
                               type="number"
                               min="1"
                               max="365"
                               value={retentionDays}
                               onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
                               className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                             />
                             <span className="text-sm text-blue-800">days</span>
                           </div>
                           <div className="flex space-x-2">
                             <button
                               onClick={handleUpdateRetention}
                               disabled={scriptLoading === 'update-retention'}
                               className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               {scriptLoading === 'update-retention' ? (
                                 <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                               ) : (
                                 'Save'
                               )}
                             </button>
                             <button
                               onClick={() => {
                                 setIsEditingRetention(false);
                                 setRetentionDays(30); // Reset to default
                               }}
                               className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                             >
                               Cancel
                             </button>
                           </div>
                         </div>
                       ) : (
                                                  <div className="text-sm text-blue-800 space-y-2">
                            <p>• <span className="text-green-600 font-medium">Fresh:</span> First 30% of retention time (0-{Math.ceil(retentionDays * 0.3)} days)</p>
                            <p>• <span className="text-green-600 font-medium">Recent:</span> Next 30% of retention time ({Math.ceil(retentionDays * 0.3) + 1}-{Math.ceil(retentionDays * 0.6)} days)</p>
                            <p>• <span className="text-red-600 font-medium">Aging:</span> Last 40% of retention time ({Math.ceil(retentionDays * 0.6) + 1}-{retentionDays} days)</p>
                            <p>• <span className="text-red-600 font-medium">Old:</span> Over {retentionDays} days (auto-deleted)</p>
                            <p className="mt-3 text-xs">Maximum of 10 backups are kept. Older backups are automatically cleaned up.</p>
                          </div>
                       )}
                     </div>
                 </div>
               </div>

               {/* Footer */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                 <button
                   onClick={() => setShowSettings(false)}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Backup Manager Modal */}
         {showBackupManager && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                               {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setShowBackupManager(false);
                        setShowSettings(true);
                      }}
                      className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Settings
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Backup Manager
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowBackupManager(false);
                      setSelectedBackup('');
                      setBackupManagerView('list');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

               {/* Content */}
               <div className="flex-1 overflow-hidden">
                 {availableBackups.length === 0 ? (
                   <div className="text-center py-12">
                     <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     <p className="text-gray-500 text-lg">No backup files found</p>
                     <p className="text-gray-400 text-sm mt-2">Create your first backup to get started</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {/* Backup List */}
                     <div className="bg-gray-50 rounded-lg p-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-3">Available Backups ({availableBackups.length})</h4>
                       <div className="space-y-2 max-h-96 overflow-y-auto">
                         {availableBackups.map((backup: {filename: string;size: number;modified: string;age: number;}) => (
                           <div
                             key={backup.filename}
                             className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                               selectedBackup === backup.filename
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-200 bg-white hover:border-gray-300'
                             }`}
                             onClick={() => setSelectedBackup(backup.filename)}
                           >
                             <div className="flex-1">
                               <div className="flex items-center space-x-3">
                                 <div className="flex-shrink-0">
                                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                   </svg>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-gray-900 truncate">
                                     {backup.filename}
                                   </p>
                                   <div className="flex items-center space-x-4 text-xs text-gray-500">
                                     <span>{formatFileSize(backup.size)}</span>
                                     <span>•</span>
                                     <span>{backup.modified}</span>
                                     <span>•</span>
                                                                           <span className={getAgeColor(backup.age)}>
                                        {backup.age === 0 ? 'Today' : backup.age === 1 ? 'Yesterday' : `${backup.age} days ago`} ({getAgeStatus(backup.age)})
                                      </span>
                                   </div>
                                 </div>
                               </div>
                             </div>
                             
                             {/* Action Buttons */}
                             <div className="flex items-center space-x-2">
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleRestore();
                                 }}
                                 disabled={!selectedBackup || scriptLoading === 'restore'}
                                 className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                 title="Restore this backup"
                               >
                                 {scriptLoading === 'restore' ? (
                                   <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                 ) : (
                                   'Restore'
                                 )}
                               </button>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteBackup(backup.filename);
                                 }}
                                 disabled={scriptLoading === 'delete-backup'}
                                 className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                 title="Delete this backup"
                               >
                                 {scriptLoading === 'delete-backup' ? (
                                   <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                 ) : (
                                   'Delete'
                                 )}
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                                           {/* Retention Policy Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Retention Policy</h4>
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>• <span className="text-green-600">Green:</span> First 30% (0-{Math.ceil(retentionDays * 0.3)} days)</p>
                          <p>• <span className="text-yellow-600">Yellow:</span> Next 30% ({Math.ceil(retentionDays * 0.3) + 1}-{Math.ceil(retentionDays * 0.6)} days)</p>
                          <p>• <span className="text-red-600">Red:</span> Last 40% ({Math.ceil(retentionDays * 0.6) + 1}-{retentionDays} days)</p>
                          <p>• <span className="text-red-600">Auto-delete:</span> Over {retentionDays} days</p>
                        </div>
                      </div>
                   </div>
                 )}
               </div>

               {/* Footer */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                 <button
                   onClick={() => {
                     setShowBackupManager(false);
                     setSelectedBackup('');
                     setBackupManagerView('list');
                   }}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>  
   );
 }

