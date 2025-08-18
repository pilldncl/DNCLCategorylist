# Dynamic Image Management System

This document describes the new dynamic image management system that allows you to update product images without restarting the backend.

## Overview

The dynamic image system provides a robust alternative to Cloudinary by offering:

- **No Backend Restarts**: Update images dynamically through a web interface
- **Local Storage**: Store image configurations locally in JSON format
- **Caching**: Intelligent caching to improve performance
- **Fallback System**: Graceful fallback to static images if dynamic system fails
- **Admin Interface**: User-friendly web interface for managing images

## Architecture

### Components

1. **API Routes** (`/api/images`)
   - `GET`: Retrieve current image configuration
   - `POST`: Add, update, or delete image configurations

2. **Dynamic Image Mapping** (`src/utils/dynamicImageMapping.ts`)
   - Fetches images from dynamic storage with caching
   - Falls back to static images if needed
   - Handles SKU parsing and device matching

3. **Admin Interface** (`/admin/images`)
   - Web-based interface for managing images
   - Add, edit, delete device image configurations
   - Preview images and manage multiple URLs per device

4. **Custom Hooks** (`src/hooks/useDynamicImages.ts`)
   - React hooks for using dynamic images in components
   - Error handling and loading states
   - Cache management

### Data Structure

```typescript
interface DeviceImage {
  device: string;      // e.g., "PIXEL", "FOLD", "FLIP"
  model: string;       // e.g., "8", "7-PRO", "5"
  brand: string;       // e.g., "GOOGLE", "SAMSUNG", "APPLE"
  imageUrls: string[]; // Array of image URLs
  lastUpdated: string; // ISO timestamp
}

interface ImageConfig {
  devices: DeviceImage[];
  lastUpdated: string;
}
```

## Usage

### 1. Access Admin Interface

Navigate to `/admin/images` to manage your product images.

### 2. Add New Device Images

1. Click "Add New Device Images"
2. Fill in the form:
   - **Device**: Product line (e.g., PIXEL, FOLD, FLIP)
   - **Model**: Specific model (e.g., 8, 7-PRO, 5)
   - **Brand**: Manufacturer (e.g., GOOGLE, SAMSUNG, APPLE)
   - **Image URLs**: One or more image URLs (can add multiple)
3. Click "Add Device Images"

### 3. Edit Existing Images

1. Find the device in the list
2. Click "Edit"
3. Modify the form fields
4. Click "Update Device Images"

### 4. Delete Images

1. Find the device in the list
2. Click "Delete"
3. Confirm the deletion

### 5. Use in Components

```typescript
import { useDynamicImages } from '@/hooks/useDynamicImages';

function MyComponent() {
  const { getProductImage, getAllProductImages, isLoading, error } = useDynamicImages();

  useEffect(() => {
    const loadImage = async () => {
      const imageUrl = await getProductImage('PIXEL-8-128', 'GOOGLE');
      // Use imageUrl
    };
    loadImage();
  }, []);

  // Or get all images for a product
  const loadAllImages = async () => {
    const allImages = await getAllProductImages('PIXEL-8-128', 'GOOGLE');
    // Use allImages array
  };
}
```

## File Storage

### Configuration File
- **Location**: `data/dynamic-images.json`
- **Format**: JSON with device configurations
- **Auto-created**: System creates this file automatically

### Image Storage
- **Location**: `public/product-images/` (for future local file uploads)
- **Current**: Uses external URLs (can be changed to local files)

## Caching

The system implements intelligent caching:

- **Cache Duration**: 5 minutes
- **Cache Location**: Memory (cleared on page refresh)
- **Manual Clear**: Use `clearCache()` function
- **Auto-refresh**: Cache refreshes automatically when expired

## Fallback System

The system provides multiple fallback levels:

1. **Dynamic Images**: Check dynamic configuration first
2. **Static Images**: Fall back to `deviceImages.ts` if dynamic not found
3. **Generic Images**: Use brand-based generic images
4. **Default Image**: Final fallback to a default mobile phone image

## API Endpoints

### GET /api/images
Retrieve current image configuration.

**Response:**
```json
{
  "devices": [
    {
      "device": "PIXEL",
      "model": "8",
      "brand": "GOOGLE",
      "imageUrls": ["https://example.com/image1.jpg"],
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/images
Add, update, or delete image configurations.

**Request Body:**
```json
{
  "device": "PIXEL",
  "model": "8",
  "brand": "GOOGLE",
  "imageUrls": ["https://example.com/image1.jpg"],
  "action": "add" // or "update" or "delete"
}
```

## Migration from Static System

The new system is backward compatible. To migrate:

1. **Keep existing static images**: The system will use them as fallbacks
2. **Gradually add dynamic images**: Use the admin interface to add new images
3. **Test thoroughly**: Ensure all products have appropriate images
4. **Remove static images**: Once confident, you can remove static entries

## Benefits Over Cloudinary

1. **No External Dependencies**: No reliance on third-party services
2. **No API Limits**: No rate limiting or usage quotas
3. **Instant Updates**: Changes take effect immediately
4. **Cost Effective**: No monthly fees or usage charges
5. **Full Control**: Complete control over image storage and delivery
6. **Offline Capable**: Works without internet connection (for local images)

## Future Enhancements

1. **Local File Upload**: Add ability to upload images directly to the server
2. **Image Optimization**: Automatic image resizing and optimization
3. **Bulk Operations**: Import/export image configurations
4. **Version Control**: Track changes to image configurations
5. **CDN Integration**: Optional CDN for better performance
6. **Image Validation**: Validate image URLs and formats

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if URLs are accessible and valid
2. **Cache issues**: Clear cache using `clearDynamicImageCache()`
3. **Permission errors**: Ensure write permissions for `data/` directory
4. **API errors**: Check server logs for detailed error messages

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG_IMAGES=true
```

## Security Considerations

1. **Input Validation**: All URLs are validated before storage
2. **File Permissions**: Ensure proper file permissions for configuration files
3. **Access Control**: Consider adding authentication to admin interface
4. **URL Sanitization**: URLs are sanitized to prevent injection attacks

## Performance Optimization

1. **Caching**: 5-minute cache reduces API calls
2. **Lazy Loading**: Images load only when needed
3. **Fallback System**: Ensures fast response times
4. **Memory Management**: Cache is cleared automatically

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Test with the admin interface
4. Verify file permissions and paths
