-- =====================================================
-- DEPOSIT RESERVATION INDEXES
-- =====================================================
-- Run this AFTER ADD_DEPOSIT_RESERVATION_FIELDS.sql
-- Enum values must be committed before they can be used in indexes

-- Add index for querying deposit orders by due date
-- Only index active deposit reservations (not expired, cancelled, or delivered)
CREATE INDEX IF NOT EXISTS idx_orders_deposit_due_at ON public.orders(deposit_due_at)
WHERE order_type = 'deposit_reservation' AND status NOT IN ('expired', 'cancelled', 'delivered');

-- Add index for order_type
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

