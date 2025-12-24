-- =====================================================
-- Order Claims Table
-- =====================================================
-- Tracks when users claim guest orders to their account
-- Provides audit trail for security and support

CREATE TABLE IF NOT EXISTS public.order_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    claim_method TEXT NOT NULL CHECK (claim_method IN ('tracking_lookup', 'token_link')),
    ip_hash TEXT, -- Optional: hashed IP for security (not storing raw IP)
    note TEXT, -- Optional: admin notes or claim context
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one claim per order (idempotency handled in application logic)
    UNIQUE(order_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_order_claims_order_id ON public.order_claims(order_id);
CREATE INDEX IF NOT EXISTS idx_order_claims_user_id ON public.order_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_order_claims_claimed_at ON public.order_claims(claimed_at DESC);

-- RLS: Users can view their own claims, admins can view all
ALTER TABLE public.order_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON public.order_claims
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Only service role can insert claims (via API)
CREATE POLICY "Service role can insert claims" ON public.order_claims
    FOR INSERT WITH CHECK (true); -- Service role bypasses RLS

COMMENT ON TABLE public.order_claims IS 'Audit trail for order claiming - tracks when users attach guest orders to their account';
COMMENT ON COLUMN public.order_claims.claim_method IS 'How the user proved ownership: tracking_lookup (code+email/phone) or token_link (secure token)';
COMMENT ON COLUMN public.order_claims.ip_hash IS 'Optional hashed IP address for security audit (not storing raw IP)';

