-- =====================================================
-- Create Missing Storage Buckets
-- =====================================================
-- This script creates the required storage buckets
-- If SQL fails, create them manually in Supabase Dashboard
-- =====================================================

-- Check which buckets exist
SELECT 
    'Existing buckets:' as info,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Create product-images bucket if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'product-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'product-images',
            'product-images',
            true,  -- Public bucket
            10485760,  -- 10MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp']
        );
        RAISE NOTICE '✅ Created product-images bucket';
    ELSE
        RAISE NOTICE '✅ product-images bucket already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Could not create product-images bucket via SQL';
        RAISE NOTICE '   Error: %', SQLERRM;
        RAISE NOTICE '   → Please create manually in Supabase Dashboard → Storage → New bucket';
        RAISE NOTICE '   → Name: product-images, Public: Yes, Size limit: 10MB';
END $$;

-- Create deposit_proofs bucket if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'deposit_proofs'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'deposit_proofs',
            'deposit_proofs',
            true,  -- Public bucket (or false if you want private)
            5242880,  -- 5MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp']
        );
        RAISE NOTICE '✅ Created deposit_proofs bucket';
    ELSE
        RAISE NOTICE '✅ deposit_proofs bucket already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Could not create deposit_proofs bucket via SQL';
        RAISE NOTICE '   Error: %', SQLERRM;
        RAISE NOTICE '   → Please create manually in Supabase Dashboard → Storage → New bucket';
        RAISE NOTICE '   → Name: deposit_proofs, Public: Yes, Size limit: 5MB';
END $$;

-- Verify buckets were created
SELECT 
    '=== FINAL STATUS ===' as status,
    COUNT(*) FILTER (WHERE name = 'product-images') as has_product_images,
    COUNT(*) FILTER (WHERE name = 'deposit_proofs') as has_deposit_proofs,
    COUNT(*) as total_buckets
FROM storage.buckets;

-- List all buckets
SELECT 
    name,
    CASE WHEN public THEN 'PUBLIC' ELSE 'PRIVATE' END as visibility,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

