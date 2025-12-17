import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyTokenForOrder } from '@/lib/orderTrackingTokens';
import { restoreOrderInventory } from '@/lib/repositories/admin/orders';
import { sendOrderCancellationEmail } from '@/lib/emails/service';
import { defaultLocale, type Locale } from '@/config/locales';

/**
 * POST /api/order/cancel/[orderCode]
 * Customer-initiated order cancellation
 * 
 * Security: Requires valid tracking token OR order code + contact verification
 * Eligibility: Only cancellable statuses (pending, deposit_pending, deposited, confirmed)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        const { orderCode } = await params;
        const body = await request.json();
        const { token, reason } = body;

        if (!reason || !reason.trim()) {
            return NextResponse.json(
                { error: 'Cancellation reason is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Get order by order code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number, status, payment_status, customer_email, customer_name, locale')
            .eq('order_number', orderCode)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate token if provided
        if (token) {
            const isValid = await verifyTokenForOrder(order.id, token);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid or expired tracking token' },
                    { status: 401 }
                );
            }
        } else {
            // If no token, require contact verification (for form-based tracking)
            // This would need to be implemented if we want to support cancellation via form
            return NextResponse.json(
                { error: 'Tracking token is required' },
                { status: 400 }
            );
        }

        // Check eligibility
        const cancellableStatuses: string[] = ['pending', 'deposit_pending', 'deposited', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return NextResponse.json(
                { error: 'This order can no longer be cancelled. Please contact support.' },
                { status: 400 }
            );
        }

        // Cancel order
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                customer_note: order.customer_note 
                    ? `${order.customer_note}\n\n[CANCELLED BY CUSTOMER] Reason: ${reason}`
                    : `[CANCELLED BY CUSTOMER] Reason: ${reason}`,
            })
            .eq('id', order.id);

        if (updateError) {
            console.error('Error cancelling order:', updateError);
            return NextResponse.json(
                { error: 'Failed to cancel order' },
                { status: 500 }
            );
        }

        // Create status history entry
        await supabase
            .from('order_status_history')
            .insert({
                order_id: order.id,
                from_status: order.status,
                to_status: 'cancelled',
                note: `Cancelled by customer. Reason: ${reason}`,
                changed_by: null, // Customer-initiated
            });

        // Restore inventory
        try {
            await restoreOrderInventory(order.id);
        } catch (inventoryError) {
            console.error('Error restoring inventory:', inventoryError);
            // Don't fail the cancellation if inventory restoration fails
            // Admin can manually restore if needed
        }

        // Send cancellation email (non-blocking)
        if (order.customer_email) {
            const locale = (order.locale === 'vi' || order.locale === 'en')
                ? order.locale
                : defaultLocale;

            sendOrderCancellationEmail(order.id, {
                orderCode,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                reason,
                locale: locale as Locale,
            }).catch((error) => {
                console.error('Failed to send cancellation email:', error);
                // Don't throw - email failure shouldn't break cancellation
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
        });
    } catch (error) {
        console.error('Error processing cancellation:', error);
        return NextResponse.json(
            {
                error: 'Failed to process cancellation',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

