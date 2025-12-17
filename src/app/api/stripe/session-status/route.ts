import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/server';

/**
 * GET /api/stripe/session-status?session_id=<session_id>
 * Returns simplified payment status for UI polling
 * Purely for UX, not authoritative (webhook is authoritative)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            sessionId: session.id,
            paymentStatus: session.payment_status,
            status: session.status,
            orderCode: session.client_reference_id,
        });
    } catch (error) {
        console.error('Error fetching session status:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch session status',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

