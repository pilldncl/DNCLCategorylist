# Image Troubleshooting Guide

## Common Issues and Solutions

### 1. "Hostname not configured" Error

**Error Message:**
```
Invalid src prop on 'next/image', hostname "example.com" is not configured under images in your 'next.config.js'
```

**Solution:**
The image domain needs to be added to `next.config.ts`. I've already added a wildcard pattern to allow all HTTPS images:

```typescript
{
  protocol: 'https',
  hostname: '**',
  port: '',
  pathname: '/**',
}
```

**If you still get errors:**
1. Restart the development server: `npm run dev`
2. Clear browser cache
3. Check that the image URL is accessible

### 2. Images Not Loading

**Possible Causes:**
- Invalid image URL
- CORS issues
- Network connectivity problems
- Image server down

**Solutions:**
1. **Test the URL directly** in your browser
2. **Use the ExternalImage component** which has built-in fallback
3. **Check network tab** in browser dev tools for errors
4. **Try a different image URL**

### 3. Using the ExternalImage Component

For better reliability, use the `ExternalImage` component:

```tsx
import ExternalImage from '@/components/ExternalImage';

<ExternalImage
  src="https://example.com/image.jpg"
  alt="Description"
  width={100}
  height={100}
  className="your-classes"
/>
```

**Features:**
- Automatic fallback to default image
- Error handling
- Unoptimized mode for external images

### 4. Adding New Image Domains

If you need to add specific domains to `next.config.ts`:

```typescript
{
  protocol: 'https',
  hostname: 'your-domain.com',
  port: '',
  pathname: '/**',
}
```

### 5. Testing Image URLs

Before adding images to the admin interface:

1. **Test in browser**: Open the URL directly
2. **Check format**: Ensure it's a valid image (jpg, png, webp, etc.)
3. **Verify accessibility**: Make sure the image is publicly accessible
4. **Test in admin interface**: Use the preview feature

### 6. Common Image Sources That Work

These domains are already configured:
- `images.unsplash.com`
- `i.ebayimg.com`
- `upload.wikimedia.org`
- `cdn.mos.cms.futurecdn.net`
- `buy.gazelle.com`
- `gazelle.com`
- Any HTTPS image (wildcard pattern)

### 7. Debugging Steps

1. **Check browser console** for errors
2. **Verify image URL** is correct
3. **Test in incognito mode** to avoid cache issues
4. **Check network tab** for failed requests
5. **Restart development server** after config changes

### 8. Fallback System

The system has multiple fallback levels:
1. **Dynamic images** (from admin interface)
2. **Static images** (from deviceImages.ts)
3. **Generic images** (brand-based)
4. **Default image** (mobile phone placeholder)

### 9. Performance Tips

- Use `unoptimized={true}` for external images
- Consider image formats (WebP is preferred)
- Use appropriate image sizes
- Implement lazy loading for large lists

### 10. Security Considerations

- Only use HTTPS URLs
- Validate image URLs before saving
- Be cautious with user-provided URLs
- Consider implementing URL validation

## Quick Fix Commands

```bash
# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next

# Check if image URL is accessible
curl -I https://your-image-url.com/image.jpg
```

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify the image URL is accessible
3. Try using a different image URL
4. Use the ExternalImage component for better reliability
5. Check the network tab in browser dev tools
