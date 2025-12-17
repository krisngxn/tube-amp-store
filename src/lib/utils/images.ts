/**
 * Image Utilities
 * Centralized helpers for working with product images from Supabase Storage
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const STORAGE_BUCKET = 'product-images';

/**
 * Get public URL for a product image from storage path
 * @param storagePath - Storage path like "products/{product_id}/{image_id}.jpg"
 * @returns Public URL for the image
 */
export function getPublicImageUrl(storagePath: string | null | undefined): string {
    if (!storagePath) {
        return '/images/placeholder-product.jpg';
    }

    // If it's already a full URL (http/https), return as-is
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
        return storagePath;
    }

    if (!SUPABASE_URL) {
        console.warn('NEXT_PUBLIC_SUPABASE_URL is not set');
        return '/images/placeholder-product.jpg';
    }

    // If storagePath already contains the bucket, use it as-is
    if (storagePath.startsWith(`${STORAGE_BUCKET}/`)) {
        return `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
    }

    // Otherwise, construct the full path
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/**
 * Get thumbnail URL (same as public URL for now, can be extended for variants)
 */
export function getThumbnailUrl(storagePath: string | null | undefined): string {
    return getPublicImageUrl(storagePath);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        };
    }

    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: `File size exceeds ${MAX_SIZE / 1024 / 1024}MB limit.`,
        };
    }

    return { valid: true };
}

/**
 * Generate storage path for a product image
 */
export function generateStoragePath(productId: string, imageId: string, extension: string = 'jpg'): string {
    // Normalize extension (remove dot if present, convert to lowercase)
    const normalizedExt = extension.replace(/^\./, '').toLowerCase();
    return `products/${productId}/${imageId}.${normalizedExt}`;
}

