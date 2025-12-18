-- =====================================================
-- Comprehensive Database & Storage Check
-- =====================================================
-- Run this to verify everything is set up correctly
-- =====================================================

-- 1. CHECK ALL REQUIRED TABLES
SELECT 
    '=== REQUIRED TABLES ===' as check_type,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('user_profiles'),
        ('products'),
        ('product_translations'),
        ('product_images'),
        ('orders'),
        ('order_items'),
        ('order_status_history'),
        ('order_tracking_tokens'),
        ('order_emails'),
        ('deposit_transfer_proofs'),
        ('product_reviews'),
        ('guides'),
        ('guide_translations')
) AS t(table_name)
ORDER BY status, table_name;

-- 2. CHECK STORAGE BUCKETS
SELECT 
    '=== STORAGE BUCKETS ===' as check_type,
    name as bucket_name,
    CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as visibility,
    file_size_limit,
    CASE 
        WHEN name = 'product-images' THEN '✅ REQUIRED'
        WHEN name = 'deposit_proofs' THEN '✅ REQUIRED'
        ELSE '⚠️ OPTIONAL'
    END as requirement
FROM storage.buckets
ORDER BY name;

-- 3. CHECK MISSING BUCKETS
SELECT 
    '=== MISSING BUCKETS ===' as check_type,
    required_bucket,
    '❌ MISSING - CREATE IN DASHBOARD' as status
FROM (
    VALUES ('product-images'), ('deposit_proofs')
) AS required(required_bucket)
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = required.required_bucket
);

-- 4. CHECK ORDERS TABLE COLUMNS
SELECT 
    '=== ORDERS TABLE COLUMNS ===' as check_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('bank_transfer_memo', 'deposit_due_at', 'payment_method') 
        THEN '✅ REQUIRED'
        ELSE '✅ EXISTS'
    END as status
FROM information_schema.columns
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN (
    'id', 'order_number', 'status', 'payment_status', 'payment_method',
    'bank_transfer_memo', 'deposit_due_at', 'deposit_amount_vnd'
)
ORDER BY column_name;

-- 5. CHECK PAYMENT_METHOD ENUM
SELECT 
    '=== PAYMENT_METHOD ENUM ===' as check_type,
    enumlabel as value,
    CASE 
        WHEN enumlabel = 'bank_transfer' THEN '✅ REQUIRED'
        ELSE '✅ EXISTS'
    END as status
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
ORDER BY enumsortorder;

-- 6. CHECK IF BANK_TRANSFER EXISTS IN ENUM
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'bank_transfer' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
    ) THEN
        RAISE NOTICE '❌ payment_method enum MISSING bank_transfer value';
        RAISE NOTICE '   → Run: ALTER TYPE payment_method ADD VALUE ''bank_transfer'';';
    ELSE
        RAISE NOTICE '✅ payment_method enum includes bank_transfer';
    END IF;
END $$;

-- 7. CHECK DEPOSIT_TRANSFER_PROOFS TABLE STRUCTURE
SELECT 
    '=== DEPOSIT_TRANSFER_PROOFS COLUMNS ===' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'deposit_transfer_proofs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. CHECK RLS POLICIES ON DEPOSIT_TRANSFER_PROOFS
SELECT 
    '=== RLS POLICIES ===' as check_type,
    schemaname || '.' || tablename as table_name,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'deposit_transfer_proofs'
ORDER BY policyname;

-- 9. CHECK IF YOU HAVE ANY DATA
SELECT 
    '=== DATA CHECK ===' as check_type,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM orders) as orders_count,
    (SELECT COUNT(*) FROM deposit_transfer_proofs) as deposit_proofs_count,
    (SELECT COUNT(*) FROM order_tracking_tokens) as tracking_tokens_count;

-- 10. FINAL SUMMARY
SELECT 
    '=== SUMMARY ===' as summary,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM storage.buckets) as total_buckets,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'product-images') 
        AND EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'deposit_proofs')
        THEN '✅ All buckets exist'
        ELSE '❌ Missing buckets'
    END as buckets_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deposit_transfer_proofs')
        THEN '✅ deposit_transfer_proofs exists'
        ELSE '❌ deposit_transfer_proofs MISSING'
    END as deposit_proofs_table_status;

