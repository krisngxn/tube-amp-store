-- Add is_primary boolean field to product_images table
-- This allows explicit marking of primary image instead of relying solely on sort_order = 0

-- Add the column
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Create index for faster primary image queries
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary 
ON public.product_images(product_id, is_primary) 
WHERE is_primary = true;

-- Migrate existing data: set is_primary = true for images with sort_order = 0
UPDATE public.product_images
SET is_primary = true
WHERE sort_order = 0;

-- Add constraint to ensure at most one primary image per product
-- Using a partial unique index (PostgreSQL feature)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_single_primary
ON public.product_images(product_id)
WHERE is_primary = true;

-- Add comment for documentation
COMMENT ON COLUMN public.product_images.is_primary IS 'Marks the primary/cover image for the product. At most one image per product can be primary.';

