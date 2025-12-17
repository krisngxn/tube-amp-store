import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { adminGetOrderByCode, restoreOrderInventory, markOrderRefundPendingFromStripe } from '@/lib/repositories/admin/orders';
import { getStripe, parseStripeMetadata } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/admin/orders/[orderCode]/refund
 * Admin endpoint to request a refund for an order
 * 
 * Security: Requires admin authentication
 * Flow: Creates refund request in Stripe, sets payment_status to refund_pending
 * Final state: Only webhook events finalize refund state
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        // Require admin authentication
        const adminUser = await requireAdmin();
        if (!adminUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderCode } = await params;
        const body = await request.json();
        const {
            amount, // Optional: partial refund amount in minor units (VND has no decimals)
            reason, // Optional: requested_by_customer, duplicate, fraudulent, other
            restock, // Boolean: if true, cancel order + restore inventory before refund
            note, // Optional: admin note
        } = body;

        // Load order
        const order = await adminGetOrderByCode(orderCode);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate refundable state
        const refundableStatuses: string[] = ['paid', 'deposited', 'partially_refunded'];
        if (!refundableStatuses.includes(order.paymentStatus)) {
            return NextResponse.json(
                { error: `Order payment status "${order.paymentStatus}" cannot be refunded. Only paid, deposited, or partially_refunded orders can be refunded.` },
                { status: 400 }
            );
        }

        // Get Stripe identifiers from metadata
        const metadata = parseStripeMetadata(order.adminNote || null);
        const paymentIntentId = metadata.stripe_payment_intent_id;
        const checkoutSessionId = metadata.stripe_checkout_session_id;

        if (!paymentIntentId && !checkoutSessionId) {
            return NextResponse.json(
                { error: 'Refund unavailable: missing Stripe payment reference. This order was not paid via Stripe.' },
                { status: 400 }
            );
        }

        // Get payment intent ID (fetch from session if needed)
        let finalPaymentIntentId = paymentIntentId;
        if (!finalPaymentIntentId && checkoutSessionId) {
            try {
                const stripe = getStripe();
                const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
                if (typeof session.payment_intent === 'string') {
                    finalPaymentIntentId = session.payment_intent;
                } else if (session.payment_intent) {
                    finalPaymentIntentId = session.payment_intent.id;
                }
            } catch (error) {
                console.error('Error fetching Stripe session:', error);
                return NextResponse.json(
                    { error: 'Failed to retrieve Stripe payment information' },
                    { status: 500 }
                );
            }
        }

        if (!finalPaymentIntentId) {
            return NextResponse.json(
                { error: 'Refund unavailable: could not determine payment intent ID' },
                { status: 400 }
            );
        }

        // Handle restock option: cancel order + restore inventory first
        if (restock) {
            if (order.status !== 'cancelled') {
                // Cancel order and restore inventory
                const supabase = createServiceClient();
                
                // Restore inventory
                await restoreOrderInventory(order.id);

                // Update order status to cancelled
                await supabase
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', order.id);

                // Insert status history
                await supabase
                    .from('order_status_history')
                    .insert({
                        order_id: order.id,
                        from_status: order.status,
                        to_status: 'cancelled',
                        note: note || 'Order cancelled before refund (restock requested)',
                        changed_by: adminUser.id,
                    });
            }
        }

        // Determine refund amount
        // For deposit orders, use deposit amount; for normal orders, use total
        const paidAmount = order.orderType === 'deposit_reservation' 
            ? (order.depositAmountVnd || 0)
            : order.total;

        // Check existing refunds
        const existingRefunds = metadata.stripe_refunds;
        const alreadyRefunded = existingRefunds?.total_refunded_amount || 0;
        const remainingRefundable = paidAmount - alreadyRefunded;

        if (remainingRefundable <= 0) {
            return NextResponse.json(
                { error: 'Order is already fully refunded' },
                { status: 400 }
            );
        }

        // Determine refund amount
        const refundAmount = amount ? Math.min(amount, remainingRefundable) : remainingRefundable;

        if (refundAmount <= 0) {
            return NextResponse.json(
                { error: 'Invalid refund amount' },
                { status: 400 }
            );
        }

        // Create Stripe refund
        const stripe = getStripe();
        let refund;
        try {
            // Retrieve payment intent to get charge ID
            const paymentIntent = await stripe.paymentIntents.retrieve(finalPaymentIntentId);
            const chargeId = typeof paymentIntent.latest_charge === 'string' 
                ? paymentIntent.latest_charge 
                : paymentIntent.latest_charge?.id;

            if (!chargeId) {
                return NextResponse.json(
                    { error: 'Could not find charge ID for refund' },
                    { status: 400 }
                );
            }

            // Create refund
            refund = await stripe.refunds.create({
                charge: chargeId,
                amount: refundAmount,
                reason: reason || undefined,
                metadata: {
                    order_id: order.id,
                    order_code: orderCode,
                    refund_requested_by: adminUser.id,
                    refund_note: note || '',
                },
            });
        } catch (error) {
            console.error('Error creating Stripe refund:', error);
            return NextResponse.json(
                {
                    error: 'Failed to create refund in Stripe',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
                { status: 500 }
            );
        }

        // Store refund request in order metadata and set payment_status to refund_pending
        await markOrderRefundPendingFromStripe(order.id, {
            refundId: refund.id,
            amount: refundAmount,
            currency: refund.currency,
            reason: reason || undefined,
            note: note || undefined,
            restock: restock || false,
        });

        return NextResponse.json({
            success: true,
            message: 'Refund requested successfully. Waiting for Stripe webhook to finalize.',
            refund: {
                id: refund.id,
                amount: refundAmount,
                status: refund.status,
            },
        });
    } catch (error) {
        console.error('Error processing refund request:', error);
        return NextResponse.json(
            {
                error: 'Failed to process refund request',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

