import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for Server Components and Route Handlers
 * This client is configured to work with Next.js cookies
 */
export async function createClient() {
    try {
        const cookieStore = await cookies()

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables:', {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey,
            });
            throw new Error('Supabase configuration is missing');
        }

        return createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch (error) {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                            console.warn('Failed to set cookie in Server Component:', error);
                        }
                    },
                },
            }
        )
    } catch (error) {
        console.error('Error creating Supabase client:', error);
        throw error;
    }
}
