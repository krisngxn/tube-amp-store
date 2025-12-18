import { NextRequest, NextResponse } from 'next/server';
import { trackOrderByToken } from '@/lib/repositories/orders/tracking';

/**
 * GET /api/order/track-token
 * Track order by token (from email link)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const orderCode = searchParams.get('code');
        const token = searchParams.get('t');

        // Validation
        if (!orderCode || !token) {
            return NextResponse.json(
                { error: 'Order code and token are required' },
                { status: 400 }
            );
        }

        // Track order by token
        const order = await trackOrderByToken(orderCode, token);

        if (!order) {
            // Generic error for invalid/expired token
            return NextResponse.json(
                { error: 'Invalid or expired tracking link' },
                { status: 404 }
            );
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Error tracking order by token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}




