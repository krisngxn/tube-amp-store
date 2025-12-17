# Supabase Storage Setup Guide

## Overview

This guide covers the setup and configuration of Supabase Storage for product images in the Restore The Basic e-commerce platform.

## Storage Bucket Configuration

### 1. Create the Bucket

In your Supabase Dashboard:

1. Navigate to **Storage** → **Buckets**
2. Click **New bucket**
3. Configure:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enabled (for public read access)
   - **File size limit**: 10MB (recommended)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### 2. Storage Policies

The bucket should have the following policies:

#### Public Read Policy
```sql
-- Allow anyone to read images
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

#### Admin Write Policy
```sql
-- Only admins can upload/delete (enforced via API routes using service role)
-- No direct client-side uploads allowed
```

**Note**: Upload/delete operations are handled server-side via API routes that use the service role key, ensuring security.

## Storage Path Convention

Images are stored using the following path structure:

```
product-images/
  products/
    {product_id}/
      {image_id}.jpg
```

Example:
```
product-images/products/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000.jpg
```

### Path Rules

- `product_id`: UUID of the product
- `image_id`: UUID generated for each image
- Extension: Normalized to `.jpg`, `.png`, or `.webp`
- No spaces or special characters

## Database Schema

The `product_images` table stores metadata:

```sql
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    url TEXT, -- Public URL (computed, kept for backward compatibility)
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0, -- 0 = cover image
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Fields

- `storage_path`: Path relative to bucket (e.g., `products/{product_id}/{image_id}.jpg`)
- `sort_order`: 0 = cover image, higher numbers = gallery order
- `alt_text`: Accessibility text for the image

## API Endpoints

### Upload Image
```
POST /api/admin/products/{id}/images
Content-Type: multipart/form-data

Body:
- file: File (required)
- altText: string (optional)
```

### Get Images
```
GET /api/admin/products/{id}/images
```

### Update Image
```
PATCH /api/admin/products/{id}/images/{imageId}

Body:
{
  "altText": "string",
  "sortOrder": number,
  "setAsCover": boolean
}
```

### Delete Image
```
DELETE /api/admin/products/{id}/images/{imageId}
```

## Public URL Helper

Use the centralized helper function:

```typescript
import { getPublicImageUrl } from '@/lib/utils/images';

const imageUrl = getPublicImageUrl(storagePath);
```

This function:
- Constructs the public URL from storage path
- Handles missing/null paths with placeholder fallback
- Works consistently across the application

## Security Considerations

1. **No Anonymous Uploads**: All uploads go through server-side API routes
2. **Service Role Key**: Used only server-side, never exposed to client
3. **Admin Authentication**: All image operations require admin authentication
4. **File Validation**: Server validates file type and size before upload
5. **Storage Policies**: Bucket policies restrict write access

## Troubleshooting

### Images Not Displaying

1. **Check bucket exists**: Verify `product-images` bucket is created
2. **Check public access**: Ensure bucket is set to public
3. **Check storage path**: Verify `storage_path` in database matches actual file location
4. **Check CORS**: Ensure Supabase Storage CORS allows your domain

### Upload Failures

1. **File size**: Check file is under 10MB limit
2. **File type**: Ensure file is JPEG, PNG, or WebP
3. **Permissions**: Verify service role key is set correctly
4. **Storage quota**: Check Supabase project storage quota

### Database Sync Issues

If `storage_path` and actual files get out of sync:

1. Run cleanup script to remove orphaned files
2. Verify `ON DELETE CASCADE` is working for product deletions
3. Check RLS policies allow admin operations

## Migration from URL-based Images

If migrating existing products with URL-based images:

1. Run migration script to upload URLs to Storage
2. Update `product_images` records with `storage_path`
3. Keep `url` field temporarily for backward compatibility
4. Gradually migrate all images

See `supabase/MIGRATE_PRODUCT_IMAGES.sql` for migration SQL.

## Best Practices

1. **Always use `getPublicImageUrl()`**: Don't construct URLs manually
2. **Set alt text**: Improve accessibility
3. **Optimize images**: Compress before upload (client-side or server-side)
4. **Cover image**: Always set `sort_order = 0` for cover image
5. **Cleanup**: Delete images from storage when removing from database

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!

