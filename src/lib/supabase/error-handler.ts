/**
 * Utility to handle Supabase errors gracefully
 * Logs 404 errors with context to help identify failing queries
 */

export function handleSupabaseError(error: any, context: string) {
    if (!error) return null;

    // Check if it's a 404 error
    if (error.code === 'NOT_FOUND' || error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
        console.error(`[Supabase 404] ${context}:`, {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        });
        return null; // Return null instead of throwing
    }

    // Log other errors but don't throw
    console.error(`[Supabase Error] ${context}:`, error);
    return null;
}

/**
 * Wrapper for Supabase queries that might return 404
 * Returns null instead of throwing for 404 errors
 */
export async function safeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
): Promise<T | null> {
    try {
        const result = await queryFn();
        
        if (result.error) {
            const handled = handleSupabaseError(result.error, context);
            if (handled === null) {
                return null; // 404 or other handled error
            }
        }

        return result.data;
    } catch (error) {
        handleSupabaseError(error, context);
        return null;
    }
}

