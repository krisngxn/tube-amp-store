import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/service';
import { setStripeCheckoutSession } from '@/lib/repositories/admin/orders';

/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe Checkout Session for an order
 * 
 * Security: Validates order exists and is payable
 * Only allows creating sessions for orders that are not already paid/cancelled/expired
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderCode } = body;

        if (!orderCode || typeof orderCode !== 'string') {
            return NextResponse.json(
                { error: 'orderCode is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Fetch order with items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(
                `
                id,
                order_number,
                order_type,
                payment_status,
                status,
                total,
                deposit_amount_vnd,
                customer_email,
                customer_name,
                locale,
                order_items (
                    product_name,
                    quantity,
                    unit_price,
                    subtotal
                )
            `
            )
            .eq('order_number', orderCode)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate order is payable
        if (
            order.payment_status === 'paid' ||
            order.payment_status === 'deposited' ||
            order.status === 'cancelled' ||
            order.status === 'expired'
        ) {
            return NextResponse.json(
                { error: 'Order is not payable' },
                { status: 400 }
            );
        }

        // Calculate amount to charge
        const isDepositOrder = order.order_type === 'deposit_reservation';
        const amountToCharge = isDepositOrder
            ? Number(order.deposit_amount_vnd || 0)
            : Number(order.total);

        if (amountToCharge <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount to charge' },
                { status: 400 }
            );
        }

        // Convert VND to smallest currency unit (VND has no decimals in Stripe)
        // Stripe expects amounts in smallest currency unit (e.g., cents for USD, but VND has no decimals)
        const amountInSmallestUnit = Math.round(amountToCharge);

        // Get base URL for success/cancel URLs
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL ||
            'http://localhost:3000';

        // Build success and cancel URLs
        const successUrl = `${baseUrl}/order-success/${orderCode}?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/checkout?cancelled=1&orderCode=${orderCode}`;

        // Create Stripe Checkout Session
        let stripe;
        try {
            stripe = getStripe();
        } catch (stripeInitError) {
            console.error('Failed to initialize Stripe:', stripeInitError);
            return NextResponse.json(
                {
                    error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
                    details: stripeInitError instanceof Error ? stripeInitError.message : 'Unknown error',
                },
                { status: 500 }
            );
        }

        // Build line items
        const lineItems: Array<{
            price_data: {
                currency: string;
                product_data: {
                    name: string;
                };
                unit_amount: number;
            };
            quantity: number;
        }> = [];

        // Validate order has items
        if (!order.order_items || order.order_items.length === 0) {
            return NextResponse.json(
                { error: 'Order has no items' },
                { status: 400 }
            );
        }

        if (isDepositOrder) {
            // For deposit orders, show deposit amount as a single line item
            lineItems.push({
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: `${order.order_items[0]?.product_name || 'Order'} - Deposit`,
                    },
                    unit_amount: amountInSmallestUnit,
                },
                quantity: 1,
            });
        } else {
            // For full orders, show all items
            for (const item of order.order_items) {
                const itemAmount = Math.round(Number(item.unit_price));
                if (itemAmount <= 0) {
                    console.warn(`Invalid item price for ${item.product_name}: ${item.unit_price}`);
                    continue; // Skip invalid items
                }
                lineItems.push({
                    price_data: {
                        currency: 'vnd',
                        product_data: {
                            name: item.product_name || 'Product',
                        },
                        unit_amount: itemAmount,
                    },
                    quantity: item.quantity || 1,
                });
            }
        }

        // Validate we have at least one line item
        if (lineItems.length === 0) {
            return NextResponse.json(
                { error: 'No valid line items to charge' },
                { status: 400 }
            );
        }

        // Create Stripe Checkout Session
        // Note: Don't set currency at session level - it's set per line item
        // Stripe test mode may not support VND, so we'll try VND first and fallback to USD
        let session;
        try {
            session = await stripe.checkout.sessions.create({
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                client_reference_id: orderCode,
                customer_email: order.customer_email || undefined,
                metadata: {
                    order_id: order.id,
                    order_code: orderCode,
                    order_type: order.order_type || 'standard',
                },
                line_items: lineItems,
            });
        } catch (currencyError: any) {
            // If VND is not supported, try USD (for test mode)
            if (currencyError?.code === 'resource_missing' || 
                currencyError?.message?.includes('currency') ||
                currencyError?.message?.includes('vnd')) {
                console.log('VND not supported, falling back to USD for test mode');
                
                // Convert VND to USD (approximate: 1 USD ≈ 25,000 VND)
                const USD_RATE = 25000;
                const usdLineItems = lineItems.map(item => ({
                    ...item,
                    price_data: {
                        ...item.price_data,
                        currency: 'usd',
                        unit_amount: Math.round(item.price_data.unit_amount / USD_RATE * 100), // Convert to cents
                    },
                }));

                session = await stripe.checkout.sessions.create({
                    mode: 'payment',
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    client_reference_id: orderCode,
                    customer_email: order.customer_email || undefined,
                    metadata: {
                        order_id: order.id,
                        order_code: orderCode,
                        order_type: order.order_type || 'standard',
                        currency_converted: 'vnd_to_usd',
                        original_amount_vnd: amountToCharge.toString(),
                    },
                    line_items: usdLineItems,
                });
            } else {
                throw currencyError;
            }
        }

        // Store session ID in order
        await setStripeCheckoutSession(order.id, session.id);

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        
        // Log full error details for debugging
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        
        // Check if Stripe API key is missing
        if (error instanceof Error && (
            error.message.includes('No API key provided') ||
            error.message.includes('Invalid API Key')
        )) {
            return NextResponse.json(
                {
                    error: 'Stripe API key not configured. Please set STRIPE_SECRET_KEY environment variable.',
                    details: 'Server configuration error',
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

