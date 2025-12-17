import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyTokenForOrder } from '@/lib/orderTrackingTokens';
import { sendChangeRequestEmail } from '@/lib/emails/service';
import { defaultLocale, type Locale } from '@/config/locales';

/**
 * POST /api/order/change-request/[orderCode]
 * Customer-initiated change request
 * 
 * Security: Requires valid tracking token
 * Behavior: Logs request, sends email to admin, no automatic order modification
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        const { orderCode } = await params;
        const body = await request.json();
        const { token, message, category } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Get order by order code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number, status, payment_status, customer_email, customer_name, locale, admin_note')
            .eq('order_number', orderCode)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate token
        if (!token) {
            return NextResponse.json(
                { error: 'Tracking token is required' },
                { status: 400 }
            );
        }

        const isValid = await verifyTokenForOrder(order.id, token);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid or expired tracking token' },
                { status: 401 }
            );
        }

        // Log change request in admin_note
        const changeRequestNote = `[CHANGE REQUEST] ${new Date().toISOString()}\nCategory: ${category || 'Other'}\nMessage: ${message}`;
        const updatedAdminNote = order.admin_note
            ? `${order.admin_note}\n\n${changeRequestNote}`
            : changeRequestNote;

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                admin_note: updatedAdminNote,
            })
            .eq('id', order.id);

        if (updateError) {
            console.error('Error logging change request:', updateError);
            // Don't fail - continue to send email
        }

        // Send email to admin (non-blocking)
        try {
            const locale = (order.locale === 'vi' || order.locale === 'en')
                ? order.locale
                : defaultLocale;

            await sendChangeRequestEmail(order.id, {
                orderCode,
                customerName: order.customer_name,
                customerEmail: order.customer_email || '',
                message: message.trim(),
                category: category || 'other',
                locale: locale as Locale,
            });
        } catch (emailError) {
            console.error('Failed to send change request email:', emailError);
            // Don't throw - email failure shouldn't break the request
        }

        return NextResponse.json({
            success: true,
            message: 'Change request submitted successfully',
        });
    } catch (error) {
        console.error('Error processing change request:', error);
        return NextResponse.json(
            {
                error: 'Failed to process change request',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

