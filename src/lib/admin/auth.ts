import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/routing';

/**
 * Admin Authentication Utilities
 * Uses email allowlist from environment variables
 * 
 * Set ADMIN_ALLOWLIST_EMAILS in .env.local:
 * ADMIN_ALLOWLIST_EMAILS=admin@example.com,another@example.com
 */

const ADMIN_EMAILS = process.env.ADMIN_ALLOWLIST_EMAILS?.split(',').map((e) => e.trim()).filter(Boolean) || [];

/**
 * Check if user is admin based on email allowlist
 */
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return false;
    }

    return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Require admin access, redirect to login if not admin
 */
export async function requireAdmin(locale?: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
        // Use Next.js redirect for admin routes (no locale)
        const { redirect: nextRedirect } = await import('next/navigation');
        nextRedirect('/admin/login');
        return; // Never reached, but satisfies TypeScript
    }

    const userEmail = user.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(userEmail)) {
        const { redirect: nextRedirect } = await import('next/navigation');
        nextRedirect('/admin/login');
        return; // Never reached, but satisfies TypeScript
    }

    return user;
}

/**
 * Get admin user or null
 */
export async function getAdminUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return null;
    }

    if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return null;
    }

    return user;
}

