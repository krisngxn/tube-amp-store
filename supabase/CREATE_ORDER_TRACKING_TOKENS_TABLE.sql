-- =====================================================
-- Create order_tracking_tokens table
-- =====================================================
-- Stores secure, reusable tracking tokens for order tracking links
-- Tokens are hashed (SHA-256) before storage
-- Tokens expire after 7 days and can be revoked
-- =====================================================

CREATE TABLE IF NOT EXISTS public.order_tracking_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_by TEXT, -- e.g., "checkout", "status_email", "deposit_confirmation"
    
    CONSTRAINT token_hash_not_empty CHECK (token_hash != ''),
    CONSTRAINT expires_at_future CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_tracking_tokens_order_id ON public.order_tracking_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tokens_token_hash ON public.order_tracking_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tokens_expires_at ON public.order_tracking_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tokens_valid ON public.order_tracking_tokens(order_id, expires_at, revoked_at) 
    WHERE revoked_at IS NULL;

-- RLS Policies
-- Public users cannot access this table at all
-- Only service-role server code can access it
ALTER TABLE public.order_tracking_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all public access
CREATE POLICY "Deny all public access" ON public.order_tracking_tokens
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Note: Service role client bypasses RLS automatically
-- This table should only be accessed server-side using service role client

