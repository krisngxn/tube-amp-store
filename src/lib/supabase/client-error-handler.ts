/**
 * Client-side error handler for Supabase errors
 * Logs errors to console and can send to error tracking service
 */

export function handleClientSupabaseError(error: any, context: string, queryDetails?: any) {
    if (!error) return;

    const is404 = 
        error.code === 'NOT_FOUND' ||
        error.message?.includes('404') ||
        error.message?.includes('NOT_FOUND');

    const errorInfo = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        context,
        queryDetails,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    if (is404) {
        // Log 404 errors with full context
        console.error(`[🔴 Client Supabase 404] ${context}`, errorInfo);
        
        // Also log to window for debugging
        if (typeof window !== 'undefined') {
            (window as any).__supabaseErrors = (window as any).__supabaseErrors || [];
            (window as any).__supabaseErrors.push(errorInfo);
        }
    } else {
        console.error(`[⚠️ Client Supabase Error] ${context}`, errorInfo);
    }

    // Optionally send to error tracking service
    // You can add Sentry, LogRocket, etc. here
}

/**
 * Wrap a client-side Supabase query to automatically log errors
 */
export async function safeClientQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string,
    queryDetails?: any
): Promise<T | null> {
    try {
        const result = await queryFn();
        
        if (result.error) {
            handleClientSupabaseError(result.error, context, queryDetails);
            
            // Return null for 404 errors instead of throwing
            if (
                result.error.code === 'NOT_FOUND' ||
                result.error.message?.includes('404') ||
                result.error.message?.includes('NOT_FOUND')
            ) {
                return null;
            }
        }

        return result.data;
    } catch (error: any) {
        handleClientSupabaseError(error, context, queryDetails);
        return null;
    }
}

