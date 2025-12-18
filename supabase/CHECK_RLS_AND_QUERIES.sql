-- =====================================================
-- Check RLS Policies and Query Access
-- =====================================================
-- Since all tables/buckets exist, the 404 might be from RLS blocking access
-- =====================================================

-- 1. Check RLS status on critical tables
SELECT 
    'RLS STATUS' as check_type,
    schemaname || '.' || tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '🔒 ENABLED - Check policies below'
        ELSE '✅ DISABLED - No RLS blocking'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'products',
    'product_translations', 
    'product_images',
    'orders',
    'deposit_transfer_proofs',
    'order_tracking_tokens',
    'order_emails'
)
ORDER BY tablename;

-- 2. Check RLS policies on deposit_transfer_proofs (most likely culprit)
SELECT 
    'RLS POLICIES' as check_type,
    schemaname || '.' || tablename as table_name,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'deposit_transfer_proofs'
ORDER BY policyname;

-- 3. Check if service role can access (should bypass RLS)
-- This simulates what your API routes do
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test querying deposit_transfer_proofs (common source of 404s)
    BEGIN
        SELECT COUNT(*) INTO test_count FROM deposit_transfer_proofs;
        RAISE NOTICE '✅ deposit_transfer_proofs is queryable (count: %)', test_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR querying deposit_transfer_proofs: %', SQLERRM;
    END;
    
    -- Test querying orders
    BEGIN
        SELECT COUNT(*) INTO test_count FROM orders;
        RAISE NOTICE '✅ orders is queryable (count: %)', test_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR querying orders: %', SQLERRM;
    END;
    
    -- Test querying products
    BEGIN
        SELECT COUNT(*) INTO test_count FROM products;
        RAISE NOTICE '✅ products is queryable (count: %)', test_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR querying products: %', SQLERRM;
    END;
END $$;

-- 4. Check if there are any missing columns that queries might be looking for
SELECT 
    'COLUMN CHECK' as check_type,
    'deposit_transfer_proofs' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'deposit_transfer_proofs'
AND table_schema = 'public'
AND column_name IN ('id', 'order_id', 'image_urls', 'status', 'storage_paths')
ORDER BY column_name;

-- 5. Check orders table for bank transfer columns
SELECT 
    'ORDERS COLUMNS' as check_type,
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
    'payment_method'
)
ORDER BY column_name;

-- 6. Check payment_method enum values
SELECT 
    'ENUM CHECK' as check_type,
    'payment_method' as enum_name,
    enumlabel as value
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
ORDER BY enumsortorder;

-- 7. Test a query that might be failing (simulating what the app does)
-- This is the type of query that might return 404 if RLS blocks it
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Simulate querying deposit_transfer_proofs with order_id
    BEGIN
        SELECT * INTO test_result 
        FROM deposit_transfer_proofs 
        LIMIT 1;
        RAISE NOTICE '✅ Can SELECT from deposit_transfer_proofs';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Cannot SELECT from deposit_transfer_proofs: %', SQLERRM;
        RAISE NOTICE '   This suggests RLS is blocking access';
    END;
END $$;

