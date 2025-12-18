-- =====================================================
-- Quick Fix for 404 NOT_FOUND Errors
-- =====================================================
-- Run this in Supabase SQL Editor to fix common missing resources
-- =====================================================

-- 1. Create deposit_transfer_proofs table if missing
CREATE TABLE IF NOT EXISTS public.deposit_transfer_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Proof images (stored in Supabase Storage)
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    storage_paths TEXT[] NOT NULL DEFAULT '{}',
    
    -- Status: pending, approved, rejected
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin review
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    
    -- Submission metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    customer_note TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_order_id ON public.deposit_transfer_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_status ON public.deposit_transfer_proofs(status);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_submitted_at ON public.deposit_transfer_proofs(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.deposit_transfer_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Service role can manage deposit proofs" ON public.deposit_transfer_proofs;
CREATE POLICY "Service role can manage deposit proofs" ON public.deposit_transfer_proofs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can view deposit proofs" ON public.deposit_transfer_proofs;
CREATE POLICY "Admins can view deposit proofs" ON public.deposit_transfer_proofs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can update deposit proofs" ON public.deposit_transfer_proofs;
CREATE POLICY "Admins can update deposit proofs" ON public.deposit_transfer_proofs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Add updated_at trigger if function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        DROP TRIGGER IF EXISTS update_deposit_proofs_updated_at ON public.deposit_transfer_proofs;
        CREATE TRIGGER update_deposit_proofs_updated_at 
            BEFORE UPDATE ON public.deposit_transfer_proofs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 2. Add missing columns to orders table
DO $$
BEGIN
    -- Add bank_transfer_memo if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'bank_transfer_memo'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN bank_transfer_memo TEXT;
    END IF;
    
    -- Add deposit_due_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'deposit_due_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN deposit_due_at TIMESTAMPTZ;
    END IF;
    
    -- Add vietqr_generated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vietqr_generated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN vietqr_generated_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Add bank_transfer to payment_method enum if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'bank_transfer' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'payment_method'
        )
    ) THEN
        ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';
    END IF;
END $$;

-- 4. Create storage buckets (if storage extension is available)
-- Note: This might fail if you don't have storage extension enabled
-- If it fails, create buckets manually in Supabase Dashboard → Storage

DO $$
BEGIN
    -- Create product-images bucket
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'product-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'product-images',
            'product-images',
            true,
            10485760, -- 10MB
            ARRAY['image/jpeg', 'image/png', 'image/webp']
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Create deposit_proofs bucket
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'deposit_proofs'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'deposit_proofs',
            'deposit_proofs',
            true,
            5242880, -- 5MB
            ARRAY['image/jpeg', 'image/png', 'image/webp']
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create storage buckets via SQL. Please create them manually in Supabase Dashboard → Storage';
        RAISE NOTICE 'Required buckets: product-images (public), deposit_proofs (public)';
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quick fix completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify storage buckets exist in Supabase Dashboard → Storage';
    RAISE NOTICE '2. If buckets are missing, create them manually:';
    RAISE NOTICE '   - product-images (public, 10MB limit)';
    RAISE NOTICE '   - deposit_proofs (public, 5MB limit)';
    RAISE NOTICE '3. Redeploy your Vercel app';
END $$;

