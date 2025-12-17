import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/cron/expire-deposits
 * 
 * Cron job endpoint to expire deposit reservations that have passed their deadline.
 * Should be called periodically (e.g., every 15 minutes) via Vercel Cron or similar.
 * 
 * Protection:
 * - Requires CRON_SECRET environment variable to match
 * - Or can be triggered by Vercel's native cron with proper authorization header
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('Authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        // Check Vercel cron authorization or custom secret
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const supabase = createServiceClient();
        const now = new Date().toISOString();
        
        // Find all deposit reservations that:
        // 1. Are past their deposit_due_at deadline
        // 2. Are still in deposit_pending payment status
        // 3. Are not already expired/cancelled
        const { data: expiredOrders, error: fetchError } = await supabase
            .from('orders')
            .select('id, order_number, customer_email, customer_name, locale')
            .eq('order_type', 'deposit_reservation')
            .eq('payment_status', 'deposit_pending')
            .not('status', 'in', '("cancelled","expired")')
            .lt('deposit_due_at', now);
        
        if (fetchError) {
            console.error('Error fetching expired orders:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch expired orders' },
                { status: 500 }
            );
        }
        
        if (!expiredOrders || expiredOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No expired deposit reservations found',
                expired: 0,
            });
        }
        
        console.log(`Found ${expiredOrders.length} expired deposit reservations`);
        
        const results: { orderNumber: string; success: boolean; error?: string }[] = [];
        
        for (const order of expiredOrders) {
            try {
                // Get order items for inventory restoration
                const { data: orderItems } = await supabase
                    .from('order_items')
                    .select('product_id, quantity')
                    .eq('order_id', order.id);
                
                // Restore inventory for each item
                if (orderItems && orderItems.length > 0) {
                    for (const item of orderItems) {
                        if (item.product_id) {
                            // Try RPC function first, then direct update
                            const { error: rpcError } = await supabase.rpc('restore_product_stock', {
                                p_product_id: item.product_id,
                                p_quantity: item.quantity,
                            });
                            
                            if (rpcError) {
                                // Fallback to direct update
                                const { data: product } = await supabase
                                    .from('products')
                                    .select('stock_quantity')
                                    .eq('id', item.product_id)
                                    .single();
                                
                                if (product) {
                                    await supabase
                                        .from('products')
                                        .update({ stock_quantity: (product.stock_quantity || 0) + item.quantity })
                                        .eq('id', item.product_id);
                                }
                            }
                        }
                    }
                }
                
                // Update order status to expired
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                        status: 'expired',
                        cancelled_at: now,
                        admin_note: JSON.stringify({
                            expired_reason: 'Deposit deadline passed',
                            expired_at: now,
                            expired_by: 'system',
                            inventory_restored: true,
                        }),
                    })
                    .eq('id', order.id);
                
                if (updateError) {
                    throw new Error(updateError.message);
                }
                
                // Create status history entry
                await supabase
                    .from('order_status_history')
                    .insert({
                        order_id: order.id,
                        from_status: 'pending',
                        to_status: 'expired',
                        note: 'Deposit deadline passed - automatic expiry',
                    });
                
                console.log(`Expired order ${order.order_number}, inventory restored`);
                
                results.push({
                    orderNumber: order.order_number,
                    success: true,
                });
            } catch (err) {
                console.error(`Error expiring order ${order.order_number}:`, err);
                results.push({
                    orderNumber: order.order_number,
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        return NextResponse.json({
            success: true,
            message: `Expired ${successCount} orders, ${failCount} failures`,
            expired: successCount,
            failed: failCount,
            results,
        });
    } catch (error) {
        console.error('Error in expire-deposits cron:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
    return POST(request);
}

