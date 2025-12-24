import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Customer Authentication Utilities
 * For regular users (non-admin)
 */

/**
 * Get current authenticated user (customer or admin)
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            // 404/NOT_FOUND is normal for unauthenticated users
            if (error.message?.includes('404') || error.message?.includes('NOT_FOUND') || error.code === 'NOT_FOUND') {
                return null;
            }
            console.error('[getCurrentUser] Auth error:', {
                code: error.code,
                message: error.message,
            });
            return null;
        }

        return user;
    } catch (error: any) {
        console.error('[getCurrentUser] Unexpected error:', {
            error,
            message: error?.message,
            code: error?.code,
        });
        return null;
    }
}

/**
 * Require authenticated user (customer or admin)
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth(redirectTo?: string) {
    const user = await getCurrentUser();
    
    if (!user) {
        const signInPath = redirectTo ? `/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}` : '/auth/sign-in';
        redirect(signInPath);
    }
    
    return user;
}

/**
 * Get user profile (from user_profiles table)
 * Returns null if user not found or not authenticated
 */
export async function getUserProfile() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return null;
        }

        const supabase = await createClient();
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('id, email, full_name, phone, role, preferred_locale')
            .eq('id', user.id)
            .single();

        if (error) {
            // Profile might not exist yet (user just signed up)
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('[getUserProfile] Error:', error);
            return null;
        }

        return profile;
    } catch (error) {
        console.error('[getUserProfile] Unexpected error:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}

