import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for Client Components
 * Uses only the public anon key (safe for browser)
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[Supabase Browser Client] Missing environment variables:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
        });
        throw new Error('Supabase configuration is missing');
    }

    const client = createBrowserClient(supabaseUrl, supabaseKey);

    // Add global error handler for client-side errors
    if (typeof window !== 'undefined') {
        // Store errors globally for debugging
        (window as any).__supabaseClient = client;
    }

    return client;
}
