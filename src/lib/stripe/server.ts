import Stripe from 'stripe';

/**
 * Stripe Server Utilities
 * Singleton Stripe instance and webhook verification helpers
 */

let stripeInstance: Stripe | null = null;

/**
 * Get or create Stripe instance (singleton)
 */
export function getStripe(): Stripe {
    if (stripeInstance) {
        return stripeInstance;
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        const error = new Error('STRIPE_SECRET_KEY environment variable is not set. Please configure Stripe API keys in your environment variables.');
        console.error(error.message);
        throw error;
    }

    try {
        stripeInstance = new Stripe(secretKey, {
            // Use default API version (Stripe SDK will use latest stable)
            // For production, consider pinning to a specific version for stability
        });
    } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        throw new Error(`Failed to initialize Stripe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return stripeInstance;
}

/**
 * Verify Stripe webhook event signature
 * @param rawBody - Raw request body as string or Buffer
 * @param signature - Stripe signature header value
 * @returns Verified Stripe event or null if verification fails
 */
export async function getStripeWebhookEvent(
    rawBody: string | Buffer,
    signature: string
): Promise<Stripe.Event | null> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    try {
        const stripe = getStripe();
        const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        return event;
    } catch (error) {
        console.error('Stripe webhook signature verification failed:', error);
        return null;
    }
}

/**
 * Extract Stripe metadata from order
 * Stores Stripe identifiers in admin_note as JSON
 */
export interface StripeRefundInfo {
    total_refunded_amount: number; // Total amount refunded in minor units
    currency: string;
    last_refund_id?: string;
    refund_status?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
    refunds?: Array<{
        refund_id: string;
        amount: number;
        status: string;
        created_at: string;
        reason?: string;
    }>;
    inventory_restored_at?: string; // Timestamp when inventory was restored (if applicable)
}

export interface StripeMetadata {
    stripe_checkout_session_id?: string;
    stripe_payment_intent_id?: string;
    stripe_payment_status?: string;
    stripe_processed_events?: string[]; // Array of processed event IDs for idempotency
    stripe_refunds?: StripeRefundInfo; // Refund information
}

/**
 * Parse Stripe metadata from admin_note field
 */
export function parseStripeMetadata(adminNote: string | null): StripeMetadata {
    if (!adminNote) {
        return {};
    }

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(adminNote);
        // Check if it's a Stripe metadata object
        if (parsed.stripe_checkout_session_id || parsed.stripe_payment_intent_id) {
            return parsed as StripeMetadata;
        }
        // If admin_note contains other text, return empty (don't mix with admin notes)
        return {};
    } catch {
        // Not JSON or not Stripe metadata
        return {};
    }
}

/**
 * Serialize Stripe metadata to admin_note field
 * Note: This overwrites admin_note. In production, consider a separate metadata field.
 */
export function serializeStripeMetadata(metadata: StripeMetadata): string {
    return JSON.stringify(metadata);
}

