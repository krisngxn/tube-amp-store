import { NextRequest, NextResponse } from 'next/server';
import { trackOrderByCodeAndContact } from '@/lib/repositories/orders/tracking';

/**
 * Rate limiting: Simple in-memory map (MVP)
 * In production, consider using Redis or a more robust solution
 */
interface RateLimitEntry {
    count: number;
    resetAt: Date;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired rate limit entries periodically
setInterval(() => {
    const now = new Date();
    for (const [ip, entry] of rateLimitMap.entries()) {
        if (entry.resetAt < now) {
            rateLimitMap.delete(ip);
        }
    }
}, 60 * 1000); // Every minute

/**
 * Check rate limit for an IP address
 * Returns true if allowed, false if rate limited
 */
function checkRateLimit(ip: string): boolean {
    const now = new Date();
    const entry = rateLimitMap.get(ip);

    if (!entry || entry.resetAt < now) {
        // Create new entry: 10 requests per 15 minutes
        rateLimitMap.set(ip, {
            count: 1,
            resetAt: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes
        });
        return true;
    }

    if (entry.count >= 10) {
        return false; // Rate limited
    }

    entry.count++;
    return true;
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
        return realIP;
    }
    
    return 'unknown';
}

/**
 * POST /api/order/track
 * Track order by order code and contact (email or phone)
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request);
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { orderCode, emailOrPhone } = body;

        // Validation
        if (!orderCode || typeof orderCode !== 'string' || orderCode.trim() === '') {
            return NextResponse.json(
                { error: 'Order code is required' },
                { status: 400 }
            );
        }

        if (!emailOrPhone || typeof emailOrPhone !== 'string' || emailOrPhone.trim() === '') {
            return NextResponse.json(
                { error: 'Email or phone is required' },
                { status: 400 }
            );
        }

        // Track order
        const order = await trackOrderByCodeAndContact(orderCode.trim(), emailOrPhone.trim());

        if (!order) {
            // Generic error to prevent enumeration
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Error tracking order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



