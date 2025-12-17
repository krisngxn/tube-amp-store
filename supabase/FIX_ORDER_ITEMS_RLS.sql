-- =====================================================
-- Fix: Add RLS Policy for order_items INSERT
-- =====================================================
-- Issue: order_items table has RLS enabled but no INSERT policy
-- This prevents order creation from working
-- =====================================================

-- Allow anyone to create order items for existing orders
CREATE POLICY "Anyone can create order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id
        )
    );

-- Note: This policy allows inserts as long as the order exists
-- The order creation policy already validates user_id (guest or authenticated)

