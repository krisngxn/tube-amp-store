-- =====================================================
-- Find the Failing Query - Diagnostic Script
-- =====================================================
-- Since all tables/buckets exist, the 404 is likely from:
-- 1. RLS policies blocking access
-- 2. A query using .single() when no row exists
-- 3. Missing enum values
-- 4. Missing columns
-- =====================================================

-- 1. Check RLS status on critical tables
SELECT 
    'RLS CHECK' as check_type,
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '🔒 ENABLED - May block queries'
        ELSE '✅ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'products',
    'product_translations',
    'product_images',
    'orders',
    'order_items',
    'deposit_transfer_proofs',
    'order_tracking_tokens'
)
ORDER BY tablename;

-- 2. Check if payment_method enum includes 'bank_transfer'
SELECT 
    'ENUM CHECK' as check_type,
    'payment_method' as enum_name,
    enumlabel as value
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'payment_method'
)
ORDER BY enumsortorder;

-- 3. Check if orders table has required columns for bank transfer
SELECT 
    'COLUMN CHECK' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND table_schema = 'public'
AND column_name IN (
    'bank_transfer_memo',
    'deposit_due_at',
    'vietqr_generated_at',
    'payment_method',
    'payment_status',
    'order_type'
)
ORDER BY column_name;

-- 4. Check if deposit_transfer_proofs table has all required columns
SELECT 
    'PROOF COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'deposit_transfer_proofs'
AND table_schema = 'public'
AND column_name IN (
    'id',
    'order_id',
    'image_urls',
    'storage_paths',
    'status',
    'submitted_at',
    'created_at'
)
ORDER BY column_name;

-- 5. Test if service role can query critical tables
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test products
    BEGIN
        SELECT COUNT(*) INTO test_count FROM products LIMIT 1;
        RAISE NOTICE '✅ products: queryable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ products: ERROR - %', SQLERRM;
    END;
    
    -- Test orders
    BEGIN
        SELECT COUNT(*) INTO test_count FROM orders LIMIT 1;
        RAISE NOTICE '✅ orders: queryable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ orders: ERROR - %', SQLERRM;
    END;
    
    -- Test deposit_transfer_proofs
    BEGIN
        SELECT COUNT(*) INTO test_count FROM deposit_transfer_proofs LIMIT 1;
        RAISE NOTICE '✅ deposit_transfer_proofs: queryable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ deposit_transfer_proofs: ERROR - %', SQLERRM;
    END;
END $$;

-- 6. Check for any missing indexes that might cause query issues
SELECT 
    'INDEX CHECK' as check_type,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('orders', 'deposit_transfer_proofs', 'order_tracking_tokens')
ORDER BY tablename, indexname;

