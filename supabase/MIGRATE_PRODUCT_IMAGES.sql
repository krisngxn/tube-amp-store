-- Migration: Update product_images table for Supabase Storage
-- This migration updates the product_images table to use storage_path instead of url
-- and sort_order instead of position, aligning with Supabase Storage integration

-- Step 1: Add new columns
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Step 2: Migrate existing data (if any)
-- For existing records with url, we'll keep them but mark storage_path as NULL
-- New uploads will use storage_path

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id_sort ON public.product_images(product_id, sort_order);

-- Step 4: Update RLS policies (if needed)
-- Note: RLS policies will be updated in the main schema file

-- Step 5: Set default sort_order for existing records
UPDATE public.product_images
SET sort_order = position
WHERE sort_order IS NULL OR sort_order = 0;

-- Note: The url column is kept for backward compatibility during migration
-- Once all images are migrated to storage_path, url can be deprecated

