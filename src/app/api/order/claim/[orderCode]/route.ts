import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/user';
import { createServiceClient } from '@/lib/supabase/service';
import { trackOrderByCodeAndContact, trackOrderByToken } from '@/lib/repositories/orders/tracking';

/**
 * POST /api/order/claim/[orderCode]
 * Claim a guest order to the authenticated user's account
 * 
 * Requirements:
 * - User must be authenticated
 * - User must have proven ownership via tracking lookup or token
 * - User's email must match order email (or phone match in strict mode)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        const user = await requireAuth();
        const { orderCode } = await params;
        const body = await request.json().catch(() => ({}));
        const { claimMethod, token, emailOrPhone } = body;

        if (!claimMethod || !['tracking_lookup', 'token_link'].includes(claimMethod)) {
            return NextResponse.json(
                { error: 'Invalid claim method' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Step 1: Verify user has access to this order
        let order: any = null;
        
        if (claimMethod === 'token_link' && token) {
            // Verify via token
            const trackedOrder = await trackOrderByToken(orderCode, token);
            if (!trackedOrder) {
                return NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 403 }
                );
            }
            order = trackedOrder;
        } else if (claimMethod === 'tracking_lookup' && emailOrPhone) {
            // Verify via tracking lookup
            const trackedOrder = await trackOrderByCodeAndContact(orderCode, emailOrPhone);
            if (!trackedOrder) {
                return NextResponse.json(
                    { error: 'Order not found or access denied' },
                    { status: 403 }
                );
            }
            order = trackedOrder;
        } else {
            return NextResponse.json(
                { error: 'Missing required verification data' },
                { status: 400 }
            );
        }

        // Step 2: Get order from database to check current ownership
        const { data: dbOrder, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id, customer_email, customer_phone')
            .eq('order_number', orderCode)
            .single();

        if (orderError || !dbOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Step 3: Check if already claimed by this user (idempotency)
        if (dbOrder.user_id === user.id) {
            return NextResponse.json({
                success: true,
                message: 'Order already claimed',
                orderId: dbOrder.id,
            });
        }

        // Step 4: Verify email/phone match (security check)
        const userProfile = await supabase
            .from('user_profiles')
            .select('email, phone')
            .eq('id', user.id)
            .single();

        if (userProfile.error || !userProfile.data) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 500 }
            );
        }

        const normalizeContact = (contact: string) => contact.trim().toLowerCase().replace(/\s+/g, '');
        const userEmail = userProfile.data.email ? normalizeContact(userProfile.data.email) : '';
        const userPhone = userProfile.data.phone ? normalizeContact(userProfile.data.phone) : '';
        const orderEmail = dbOrder.customer_email ? normalizeContact(dbOrder.customer_email) : '';
        const orderPhone = dbOrder.customer_phone ? normalizeContact(dbOrder.customer_phone) : '';

        // Require email match (or phone match if email not available)
        const emailMatches = userEmail && orderEmail && userEmail === orderEmail;
        const phoneMatches = userPhone && orderPhone && userPhone === orderPhone;
        
        if (!emailMatches && !phoneMatches) {
            return NextResponse.json(
                { error: 'Order email or phone does not match your account' },
                { status: 403 }
            );
        }

        // Step 5: Claim the order
        const { error: updateError } = await supabase
            .from('orders')
            .update({ user_id: user.id })
            .eq('id', dbOrder.id);

        if (updateError) {
            console.error('Error claiming order:', updateError);
            return NextResponse.json(
                { error: 'Failed to claim order' },
                { status: 500 }
            );
        }

        // Step 6: Record claim audit
        const ipHash = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        // In production, hash the IP for privacy
        const { error: claimError } = await supabase
            .from('order_claims')
            .insert({
                order_id: dbOrder.id,
                user_id: user.id,
                claim_method: claimMethod,
                ip_hash: ipHash ? Buffer.from(ipHash).toString('base64').slice(0, 32) : null,
            });

        if (claimError) {
            // Log but don't fail - audit is nice to have
            console.error('Error recording claim audit:', claimError);
        }

        return NextResponse.json({
            success: true,
            message: 'Order claimed successfully',
            orderId: dbOrder.id,
        });
    } catch (error) {
        console.error('Error claiming order:', error);
        
        // Handle redirect from requireAuth
        if (error && typeof error === 'object' && 'digest' in error) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to claim order' },
            { status: 500 }
        );
    }
}

