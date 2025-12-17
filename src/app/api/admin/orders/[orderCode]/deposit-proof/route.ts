import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isAdmin } from '@/lib/admin/auth';
import { 
    getDepositProofByOrderId, 
    getAllDepositProofsForOrder,
    reviewDepositProof 
} from '@/lib/repositories/deposit-proofs';
import { sendDepositApprovedEmail, sendDepositRejectedEmail } from '@/lib/emails/service';

interface RouteParams {
    params: Promise<{ orderCode: string }>;
}

/**
 * GET /api/admin/orders/[orderCode]/deposit-proof
 * Get deposit proof(s) for an order
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Check admin authentication
        const adminCheck = await isAdmin();
        if (!adminCheck) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderCode } = await params;
        const supabase = createServiceClient();

        // Get order by code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number, order_type, payment_method, payment_status')
            .eq('order_number', orderCode)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Get all proofs for history
        const allProofs = await getAllDepositProofsForOrder(order.id);
        
        // Get latest/active proof
        const latestProof = await getDepositProofByOrderId(order.id);

        return NextResponse.json({
            orderId: order.id,
            orderCode: order.order_number,
            orderType: order.order_type,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            latestProof,
            proofHistory: allProofs,
        });
    } catch (error) {
        console.error('Error getting deposit proofs:', error);
        return NextResponse.json(
            { error: 'Failed to get deposit proofs' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/orders/[orderCode]/deposit-proof
 * Review (approve/reject) a deposit proof
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        // Check admin authentication
        const adminCheck = await isAdmin();
        if (!adminCheck) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderCode } = await params;
        const body = await request.json();
        
        const { action, proofId, note } = body as {
            action: 'approve' | 'reject';
            proofId: string;
            note?: string;
        };

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        if (!proofId) {
            return NextResponse.json(
                { error: 'proofId is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Get order by code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number, customer_email, customer_name, payment_status, locale, deposit_amount_vnd')
            .eq('order_number', orderCode)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify the proof belongs to this order
        const { data: proofCheck } = await supabase
            .from('deposit_transfer_proofs')
            .select('id, order_id, status')
            .eq('id', proofId)
            .single();

        if (!proofCheck || proofCheck.order_id !== order.id) {
            return NextResponse.json(
                { error: 'Proof not found for this order' },
                { status: 404 }
            );
        }

        if (proofCheck.status !== 'pending') {
            return NextResponse.json(
                { error: 'Proof has already been reviewed' },
                { status: 400 }
            );
        }

        // Review the proof
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await reviewDepositProof({
            proofId,
            status: newStatus,
            reviewNote: note,
        });

        // If approved, update order payment status
        if (action === 'approve') {
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: 'deposited',
                    status: 'deposited',
                    deposit_received_at: new Date().toISOString(),
                })
                .eq('id', order.id);

            if (updateError) {
                console.error('Error updating order status:', updateError);
                // Don't fail the request - proof is already marked as approved
            }

            // Send approval email
            if (order.customer_email) {
                try {
                    await sendDepositApprovedEmail(order.id, {
                        orderCode: order.order_number,
                        customerName: order.customer_name,
                        customerEmail: order.customer_email,
                        depositAmount: order.deposit_amount_vnd || 0,
                        locale: order.locale || 'vi',
                    });
                } catch (emailError) {
                    console.error('Failed to send deposit approval email:', emailError);
                }
            }
        } else {
            // Send rejection email
            if (order.customer_email) {
                try {
                    await sendDepositRejectedEmail(order.id, {
                        orderCode: order.order_number,
                        customerName: order.customer_name,
                        customerEmail: order.customer_email,
                        rejectionNote: note,
                        locale: order.locale || 'vi',
                    });
                } catch (emailError) {
                    console.error('Failed to send deposit rejection email:', emailError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            action,
            proofId,
            message: action === 'approve' 
                ? 'Deposit approved successfully' 
                : 'Proof rejected. Customer can re-upload.',
        });
    } catch (error) {
        console.error('Error reviewing deposit proof:', error);
        return NextResponse.json(
            { error: 'Failed to review deposit proof' },
            { status: 500 }
        );
    }
}

