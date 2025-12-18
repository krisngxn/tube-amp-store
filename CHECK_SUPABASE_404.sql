-- =====================================================
-- Check for Common Supabase 404 Causes
-- =====================================================
-- Run this to identify what's causing the 404
-- =====================================================

-- 1. Check if all critical tables exist and are accessible
SELECT 
    'TABLE CHECK' as check_type,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - THIS WILL CAUSE 404'
    END as status
FROM (
    VALUES 
        ('products'),
        ('product_translations'),
        ('product_images'),
        ('orders'),
        ('order_items'),
        ('deposit_transfer_proofs'),
        ('order_tracking_tokens'),
        ('order_emails'),
        ('user_profiles')
) AS t(table_name)
ORDER BY status, table_name;

-- 2. Check storage buckets
SELECT 
    'STORAGE BUCKET' as check_type,
    name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = b.name) 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING - THIS WILL CAUSE 404'
    END as status
FROM (
    VALUES ('product-images'), ('deposit_proofs')
) AS b(name);

-- 3. Check if RLS is blocking access (this can cause 404-like errors)
SELECT 
    'RLS STATUS' as check_type,
    schemaname || '.' || tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '🔒 ENABLED'
        ELSE '✅ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'deposit_transfer_proofs', 'order_tracking_tokens')
ORDER BY tablename;

-- 4. Check if you have any data (empty tables can cause issues)
SELECT 
    'DATA CHECK' as check_type,
    'products' as table_name,
    COUNT(*) as row_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END as status
FROM products
UNION ALL
SELECT 
    'DATA CHECK',
    'orders',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END
FROM orders;

-- 5. Check if deposit_transfer_proofs has correct structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deposit_transfer_proofs'
    ) THEN
        RAISE NOTICE '❌ CRITICAL: deposit_transfer_proofs table is MISSING';
        RAISE NOTICE '   This will cause 404 errors when accessing deposit proofs';
        RAISE NOTICE '   → Run: supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql';
    ELSE
        -- Check if it has required columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'deposit_transfer_proofs' 
            AND column_name = 'image_urls'
        ) THEN
            RAISE NOTICE '⚠️ WARNING: deposit_transfer_proofs missing image_urls column';
        ELSE
            RAISE NOTICE '✅ deposit_transfer_proofs table structure looks good';
        END IF;
    END IF;
END $$;

-- 6. Test a simple query that might be failing
-- This simulates what the app might be doing
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Try to query products (common first page load)
    BEGIN
        SELECT COUNT(*) INTO test_result FROM products LIMIT 1;
        RAISE NOTICE '✅ products table is queryable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR querying products: %', SQLERRM;
    END;
    
    -- Try to query orders
    BEGIN
        SELECT COUNT(*) INTO test_result FROM orders LIMIT 1;
        RAISE NOTICE '✅ orders table is queryable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR querying orders: %', SQLERRM;
    END;
END $$;


