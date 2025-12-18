-- =====================================================
-- Diagnostic Script: Check Missing Resources
-- =====================================================
-- Run this in Supabase SQL Editor to identify what's missing
-- =====================================================

-- 1. Check which tables exist
SELECT 
    'TABLE' as resource_type,
    table_name as resource_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check which tables are MISSING (required tables)
SELECT 
    'MISSING TABLE' as issue,
    required_table as table_name
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
) AS required(required_table)
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = required.required_table
);

-- 3. Check storage buckets
SELECT 
    'STORAGE BUCKET' as resource_type,
    name as resource_name,
    CASE 
        WHEN public THEN 'PUBLIC' 
        ELSE 'PRIVATE' 
    END as status
FROM storage.buckets
ORDER BY name;

-- 4. Check for missing storage buckets
SELECT 
    'MISSING BUCKET' as issue,
    required_bucket as bucket_name
FROM (
    VALUES 
        ('product-images'),
        ('deposit_proofs')
) AS required(required_bucket)
WHERE NOT EXISTS (
    SELECT 1 
    FROM storage.buckets 
    WHERE name = required.required_bucket
);

-- 5. Check if deposit_transfer_proofs table exists and has correct structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deposit_transfer_proofs'
    ) THEN
        RAISE NOTICE '❌ deposit_transfer_proofs table is MISSING';
        RAISE NOTICE '   → Run: supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql';
    ELSE
        RAISE NOTICE '✅ deposit_transfer_proofs table EXISTS';
    END IF;
END $$;

-- 6. Check if order_tracking_tokens table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_tracking_tokens'
    ) THEN
        RAISE NOTICE '❌ order_tracking_tokens table is MISSING';
        RAISE NOTICE '   → Run: supabase/CREATE_ORDER_TRACKING_TOKENS_TABLE.sql';
    ELSE
        RAISE NOTICE '✅ order_tracking_tokens table EXISTS';
    END IF;
END $$;

-- 7. Check if order_emails table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_emails'
    ) THEN
        RAISE NOTICE '❌ order_emails table is MISSING';
        RAISE NOTICE '   → Run: supabase/CREATE_ORDER_EMAILS_TABLE.sql';
    ELSE
        RAISE NOTICE '✅ order_emails table EXISTS';
    END IF;
END $$;

-- 8. Check if orders table has deposit fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'deposit_due_at'
    ) THEN
        RAISE NOTICE '❌ orders.deposit_due_at column is MISSING';
        RAISE NOTICE '   → Run: supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql';
    ELSE
        RAISE NOTICE '✅ orders.deposit_due_at column EXISTS';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'bank_transfer_memo'
    ) THEN
        RAISE NOTICE '❌ orders.bank_transfer_memo column is MISSING';
        RAISE NOTICE '   → Run: supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql or CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql';
    ELSE
        RAISE NOTICE '✅ orders.bank_transfer_memo column EXISTS';
    END IF;
END $$;

-- 9. Check if payment_method enum includes 'bank_transfer'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'bank_transfer' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'payment_method'
        )
    ) THEN
        RAISE NOTICE '❌ payment_method enum is MISSING bank_transfer';
        RAISE NOTICE '   → Run: supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql';
    ELSE
        RAISE NOTICE '✅ payment_method enum includes bank_transfer';
    END IF;
END $$;

-- Summary
SELECT 
    '=== SUMMARY ===' as summary,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables_count,
    (SELECT COUNT(*) FROM storage.buckets) as buckets_count;

