-- Fix: Add RLS policy for product_images table
-- This allows public read access to product images for published products

-- Drop existing policy if it exists (to allow re-running this script)
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

-- Create policy: Anyone can view product images for published products
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_id AND is_published = true
        )
    );

