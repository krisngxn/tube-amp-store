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
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            // Log but don't throw - 404 from auth.getUser() is normal for unauthenticated users
            if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
                console.log('User not authenticated (expected for public pages)');
            } else {
                console.error('Error getting user from Supabase auth:', error);
            }
            return false;
        }

        if (!user || !user.email) {
            return false;
        }

        return ADMIN_EMAILS.includes(user.email.toLowerCase());
    } catch (error) {
        console.error('Error in isAdmin:', error);
        return false;
    }
}

/**
 * Require admin access, redirect to login if not admin
 */
export async function requireAdmin(locale?: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            console.error('Error getting user in requireAdmin:', error);
            const { redirect: nextRedirect } = await import('next/navigation');
            nextRedirect('/admin/login');
            return; // Never reached, but satisfies TypeScript
        }

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
    } catch (error) {
        console.error('Error in requireAdmin:', error);
        const { redirect: nextRedirect } = await import('next/navigation');
        nextRedirect('/admin/login');
        return; // Never reached, but satisfies TypeScript
    }
}

/**
 * Get admin user or null
 */
export async function getAdminUser() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            console.error('Error getting user from Supabase:', error);
            return null;
        }

        if (!user || !user.email) {
            return null;
        }

        if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error in getAdminUser:', error);
        return null;
    }
}

