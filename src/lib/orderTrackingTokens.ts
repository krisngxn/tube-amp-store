/**
 * Order Tracking Tokens
 * Server-only functions for generating, hashing, and verifying tracking tokens
 * Tokens are stored as SHA-256 hashes in the database (never plaintext)
 */

import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

const TOKEN_EXPIRY_DAYS = 7;
const TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure random token
 * Returns base64url-encoded token (URL-safe)
 */
export function generateToken(): string {
    return crypto.randomBytes(TOKEN_BYTES).toString('base64url');
}

/**
 * Hash a token using SHA-256 with optional pepper
 * Pepper is read from ORDER_TRACKING_TOKEN_PEPPER env var
 */
export function hashToken(token: string): string {
    const pepper = process.env.ORDER_TRACKING_TOKEN_PEPPER || '';
    const combined = token + pepper;
    return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Create a tracking token for an order
 * Stores only the hash in the database
 * Returns the plaintext token (to be included in email)
 */
export async function createTrackingToken(
    orderId: string,
    createdBy: string = 'checkout'
): Promise<string> {
    const supabase = createServiceClient();
    
    // Generate token and hash
    const tokenPlain = generateToken();
    const tokenHash = hashToken(tokenPlain);
    
    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
    
    // Insert token record
    const { error } = await supabase
        .from('order_tracking_tokens')
        .insert({
            order_id: orderId,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            created_by: createdBy,
            access_count: 0,
        });
    
    if (error) {
        console.error('Error creating tracking token:', error);
        throw new Error('Failed to create tracking token');
    }
    
    return tokenPlain;
}

/**
 * Find a valid (non-expired, non-revoked) token for an order
 * Returns the token record if found, null otherwise
 */
export async function findValidTokenForOrder(orderId: string): Promise<{
    id: string;
    token_hash: string;
    expires_at: string;
    created_by: string | null;
} | null> {
    const supabase = createServiceClient();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
        .from('order_tracking_tokens')
        .select('id, token_hash, expires_at, created_by')
        .eq('order_id', orderId)
        .is('revoked_at', null)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    
    if (error) {
        console.error('Error finding valid token:', error);
        return null;
    }
    
    return data;
}

/**
 * Verify a token for an order and update access metadata
 * Returns true if token is valid, false otherwise
 * Updates last_accessed_at and increments access_count on success
 */
export async function verifyTokenForOrder(
    orderId: string,
    tokenPlain: string
): Promise<boolean> {
    const supabase = createServiceClient();
    const tokenHash = hashToken(tokenPlain);
    const now = new Date().toISOString();
    
    // Find matching token that:
    // - Belongs to this order
    // - Hash matches
    // - Not revoked
    // - Not expired
    const { data, error } = await supabase
        .from('order_tracking_tokens')
        .select('id, access_count')
        .eq('order_id', orderId)
        .eq('token_hash', tokenHash)
        .is('revoked_at', null)
        .gt('expires_at', now)
        .maybeSingle();
    
    if (error || !data) {
        return false;
    }
    
    // Update access metadata
    await supabase
        .from('order_tracking_tokens')
        .update({
            last_accessed_at: now,
            access_count: (data.access_count || 0) + 1,
        })
        .eq('id', data.id);
    
    return true;
}

/**
 * Revoke a token (mark as revoked)
 * Useful for security purposes (e.g., if token is compromised)
 */
export async function revokeToken(orderId: string, tokenPlain: string): Promise<boolean> {
    const supabase = createServiceClient();
    const tokenHash = hashToken(tokenPlain);
    const now = new Date().toISOString();
    
    const { error } = await supabase
        .from('order_tracking_tokens')
        .update({ revoked_at: now })
        .eq('order_id', orderId)
        .eq('token_hash', tokenHash)
        .is('revoked_at', null);
    
    if (error) {
        console.error('Error revoking token:', error);
        return false;
    }
    
    return true;
}

/**
 * Get or create a tracking token for an order
 * Since we can't retrieve plaintext from existing tokens (we only store hash),
 * we always create a new token. Multiple tokens per order are valid until expiry.
 * 
 * For status update emails, this ensures a fresh token is always available.
 * All tokens remain valid until expiry, so customers can use any token they received.
 */
export async function getOrCreateTrackingToken(
    orderId: string,
    createdBy: string = 'checkout'
): Promise<string> {
    // Always create a new token
    // Multiple tokens per order are fine - they're all valid until expiry
    // This ensures we always have a plaintext token to include in emails
    return await createTrackingToken(orderId, createdBy);
}

