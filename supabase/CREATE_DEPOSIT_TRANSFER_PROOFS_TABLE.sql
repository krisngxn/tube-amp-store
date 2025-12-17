-- =====================================================
-- Deposit Transfer Proofs Table
-- =====================================================
-- Stores proof of bank transfer uploads for deposit reservations
-- Customers upload images as proof of transfer
-- Admin manually verifies and approves/rejects
-- =====================================================

-- Create deposit transfer proofs table
CREATE TABLE IF NOT EXISTS public.deposit_transfer_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Proof images (stored in Supabase Storage)
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    storage_paths TEXT[] NOT NULL DEFAULT '{}', -- Full storage paths for deletion
    
    -- Status: pending (awaiting review), approved, rejected
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin review
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT, -- Admin note (e.g., rejection reason)
    
    -- Submission metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    customer_note TEXT, -- Optional note from customer
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure only one active proof submission per order at a time
    -- (rejected proofs remain for history, but customer can submit new one)
    CONSTRAINT unique_active_proof_per_order UNIQUE (order_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_order_id ON public.deposit_transfer_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_status ON public.deposit_transfer_proofs(status);
CREATE INDEX IF NOT EXISTS idx_deposit_proofs_submitted_at ON public.deposit_transfer_proofs(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.deposit_transfer_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Service role only (customers access via API, admin via authenticated routes)
CREATE POLICY "Service role can manage deposit proofs" ON public.deposit_transfer_proofs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow admins to view all proofs
CREATE POLICY "Admins can view deposit proofs" ON public.deposit_transfer_proofs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Allow admins to update proofs (approve/reject)
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

-- Trigger to update updated_at
CREATE TRIGGER update_deposit_proofs_updated_at 
    BEFORE UPDATE ON public.deposit_transfer_proofs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Add order fields for bank transfer tracking
-- =====================================================

-- Add deposit_due_hours to orders if not exists (for expiry calculation)
-- This should already exist from previous deposit reservation feature

-- Add bank transfer specific fields to orders
DO $$
BEGIN
    -- Add field to track if bank transfer instructions were sent
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'bank_transfer_memo'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN bank_transfer_memo TEXT;
    END IF;
    
    -- Add field to track VietQR generation timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vietqr_generated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN vietqr_generated_at TIMESTAMPTZ;
    END IF;
END $$;

-- =====================================================
-- Storage bucket for deposit proofs
-- =====================================================
-- Run this via Supabase Dashboard or CLI:
-- 
-- supabase storage bucket create deposit-proofs --public
-- 
-- Or via SQL (requires storage extension):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('deposit-proofs', 'deposit-proofs', true)
-- ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.deposit_transfer_proofs IS 
'Stores proof of bank transfer uploads for deposit reservations. 
Customers upload images, admin manually verifies.';

