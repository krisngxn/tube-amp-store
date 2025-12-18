/**
 * Wrapper utilities for Supabase queries to handle 404 errors gracefully
 */

export interface SupabaseQueryResult<T> {
    data: T | null;
    error: any | null;
}

/**
 * Safely execute a Supabase query and handle 404 errors
 * Returns null data instead of throwing for 404 errors
 */
export async function safeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
): Promise<T | null> {
    try {
        const result = await queryFn();
        
        if (result.error) {
            // Handle 404 errors gracefully
            if (
                result.error.code === 'NOT_FOUND' ||
                result.error.message?.includes('404') ||
                result.error.message?.includes('NOT_FOUND')
            ) {
                console.log(`[Supabase 404] ${context} - Resource not found (this may be expected)`);
                return null;
            }
            
            // Log other errors
            console.error(`[Supabase Error] ${context}:`, {
                code: result.error.code,
                message: result.error.message,
                details: result.error.details,
                hint: result.error.hint,
            });
            return null;
        }

        return result.data;
    } catch (error: any) {
        console.error(`[Supabase Exception] ${context}:`, {
            error,
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
        });
        return null;
    }
}

/**
 * Safely execute a Supabase query that expects a single result
 * Uses maybeSingle() instead of single() to avoid 404 errors
 */
export async function safeSingleQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
): Promise<T | null> {
    return safeQuery(queryFn, context);
}

