-- =====================================================
-- ORDER EMAILS TABLE
-- =====================================================
-- Tracks email notifications sent for orders
-- Supports idempotency and retry logic

CREATE TABLE IF NOT EXISTS public.order_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Email type
    type TEXT NOT NULL CHECK (type IN ('order_confirmation', 'status_update')),
    
    -- Recipient info
    to_email TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'vi',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped_no_email')),
    
    -- Provider tracking
    provider_message_id TEXT, -- Resend message ID or similar
    error_message TEXT,
    
    -- Metadata for status updates
    metadata_status TEXT, -- Store the status that triggered this email (for status_update type)
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Idempotency constraints
    -- Order confirmation: only one per order
    CONSTRAINT unique_order_confirmation UNIQUE(order_id, type) 
        DEFERRABLE INITIALLY DEFERRED,
    -- Status update: only one per (order_id, status)
    CONSTRAINT unique_status_update UNIQUE(order_id, type, metadata_status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_order_emails_order_id ON public.order_emails(order_id);
CREATE INDEX IF NOT EXISTS idx_order_emails_status ON public.order_emails(status);
CREATE INDEX IF NOT EXISTS idx_order_emails_type ON public.order_emails(type);
CREATE INDEX IF NOT EXISTS idx_order_emails_created_at ON public.order_emails(created_at DESC);

-- Update updated_at trigger
CREATE TRIGGER update_order_emails_updated_at BEFORE UPDATE ON public.order_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.order_emails IS 'Tracks email notifications sent for orders';
COMMENT ON COLUMN public.order_emails.type IS 'Type of email: order_confirmation or status_update';
COMMENT ON COLUMN public.order_emails.status IS 'Email send status: queued, sent, failed, or skipped_no_email';
COMMENT ON COLUMN public.order_emails.metadata_status IS 'For status_update type: the order status that triggered this email';

