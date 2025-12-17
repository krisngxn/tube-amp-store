-- =====================================================
-- Fix: Update RLS Policy for orders INSERT (Guest Checkout)
-- =====================================================
-- Issue: RLS policy not allowing anonymous users to create orders
-- Error: "new row violates row-level security policy for table \"orders\""
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create new policy that explicitly allows guest checkout
-- This allows:
-- 1. Authenticated users creating orders for themselves
-- 2. Anonymous users creating orders (user_id IS NULL)
CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT 
    WITH CHECK (
        -- Allow if user_id matches authenticated user
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        -- Allow if user_id is NULL (guest checkout)
        user_id IS NULL
    );

-- Note: This policy allows both authenticated and anonymous users to create orders
-- For guest checkout, user_id will be NULL which is explicitly allowed

