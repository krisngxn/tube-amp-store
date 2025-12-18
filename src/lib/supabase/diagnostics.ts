/**
 * Diagnostic utilities to help identify Supabase 404 errors
 * This should be used temporarily to debug production issues
 */

export function logSupabaseError(error: any, context: string, queryDetails?: any) {
    if (!error) return;

    const is404 = 
        error.code === 'NOT_FOUND' ||
        error.message?.includes('404') ||
        error.message?.includes('NOT_FOUND');

    if (is404) {
        console.error(`[🔴 Supabase 404] ${context}`, {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            queryDetails,
            timestamp: new Date().toISOString(),
        });
    } else {
        console.error(`[⚠️ Supabase Error] ${context}`, {
            code: error.code,
            message: error.message,
            details: error.details,
            queryDetails,
        });
    }
}

/**
 * Wrap a Supabase query to automatically log errors
 */
export function withDiagnostics<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string,
    queryDetails?: any
): Promise<{ data: T | null; error: any }> {
    return queryFn().then((result) => {
        if (result.error) {
            logSupabaseError(result.error, context, queryDetails);
        }
        return result;
    }).catch((error) => {
        logSupabaseError(error, context, queryDetails);
        return { data: null, error };
    });
}

