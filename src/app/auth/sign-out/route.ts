import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * POST /auth/sign-out
 * Sign out the current user
 */
export async function POST() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    // Redirect to home page after sign out
    // Note: redirect() throws a special error that Next.js handles internally
    // We don't catch it here - let it propagate
    redirect('/');
}

