-- =====================================================
-- DEPOSIT RESERVATION FIELDS MIGRATION
-- =====================================================
-- Adds missing fields for full deposit reservation workflow
-- Run this after the base schema is deployed

-- Extend payment_status enum to include deposit states
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'deposit_pending';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'deposited';

-- Extend order_status enum to include expired
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'expired';

-- Add order_type enum
DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('standard', 'deposit_reservation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add deposit_type enum for products
DO $$ BEGIN
    CREATE TYPE deposit_type AS ENUM ('percent', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing deposit fields to products table
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS deposit_type deposit_type,
    ADD COLUMN IF NOT EXISTS deposit_due_hours INTEGER DEFAULT 24,
    ADD COLUMN IF NOT EXISTS reservation_policy_note TEXT;

-- Update existing products: if allow_deposit=true and deposit_percentage exists, set deposit_type='percent'
UPDATE public.products
SET deposit_type = 'percent'
WHERE allow_deposit = true 
  AND deposit_percentage IS NOT NULL 
  AND deposit_type IS NULL;

-- Update existing products: if allow_deposit=true and deposit_amount exists (but no percentage), set deposit_type='fixed'
UPDATE public.products
SET deposit_type = 'fixed'
WHERE allow_deposit = true 
  AND deposit_amount IS NOT NULL 
  AND deposit_percentage IS NULL 
  AND deposit_type IS NULL;

-- Add missing deposit fields to orders table
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS order_type order_type DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS deposit_amount_vnd DECIMAL(12, 2),
    ADD COLUMN IF NOT EXISTS deposit_due_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deposit_received_at TIMESTAMPTZ;

-- Set order_type based on existing is_deposit_order flag
UPDATE public.orders
SET order_type = 'deposit_reservation'
WHERE is_deposit_order = true AND order_type = 'standard';

-- Set deposit_amount_vnd from existing deposit_paid if not set
UPDATE public.orders
SET deposit_amount_vnd = deposit_paid
WHERE is_deposit_order = true 
  AND deposit_amount_vnd IS NULL 
  AND deposit_paid IS NOT NULL;

-- Set deposit_received_at from existing deposit_paid_at if not set
UPDATE public.orders
SET deposit_received_at = deposit_paid_at
WHERE is_deposit_order = true 
  AND deposit_received_at IS NULL 
  AND deposit_paid_at IS NOT NULL;

-- Add check constraint for deposit orders
ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS valid_deposit_order;

ALTER TABLE public.orders
    ADD CONSTRAINT valid_deposit_order CHECK (
        (order_type = 'standard') OR
        (order_type = 'deposit_reservation' AND deposit_amount_vnd IS NOT NULL AND deposit_due_at IS NOT NULL)
    );

-- Note: Indexes that reference new enum values must be created in a separate transaction
-- See ADD_DEPOSIT_RESERVATION_INDEXES.sql

COMMENT ON COLUMN public.products.deposit_type IS 'Type of deposit: percent (use deposit_percentage) or fixed (use deposit_amount)';
COMMENT ON COLUMN public.products.deposit_due_hours IS 'Hours until deposit reservation expires (default: 24)';
COMMENT ON COLUMN public.products.reservation_policy_note IS 'Admin note about reservation policy for this product';
COMMENT ON COLUMN public.orders.order_type IS 'Type of order: standard or deposit_reservation';
COMMENT ON COLUMN public.orders.deposit_amount_vnd IS 'Deposit amount in VND (for deposit_reservation orders)';
COMMENT ON COLUMN public.orders.deposit_due_at IS 'Deadline for deposit payment (for deposit_reservation orders)';
COMMENT ON COLUMN public.orders.deposit_received_at IS 'Timestamp when deposit was received (for deposit_reservation orders)';

