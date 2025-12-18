'use client';

import { useEffect } from 'react';

/**
 * Global error handler for client-side errors
 * This component should be added to the root layout to catch all errors
 */
export function GlobalErrorHandler() {
    useEffect(() => {
        // Handle unhandled promise rejections (like Supabase errors)
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;
            
            // Check if it's a Supabase error
            if (error?.code === 'NOT_FOUND' || error?.message?.includes('404') || error?.message?.includes('NOT_FOUND')) {
                console.error('[🔴 Global 404 Error]', {
                    error,
                    code: error?.code,
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    timestamp: new Date().toISOString(),
                });
                
                // Store in window for debugging
                (window as any).__globalErrors = (window as any).__globalErrors || [];
                (window as any).__globalErrors.push({
                    type: '404',
                    error,
                    timestamp: new Date().toISOString(),
                });
            } else {
                console.error('[⚠️ Global Unhandled Error]', error);
            }
        };

        // Handle general errors
        const handleError = (event: ErrorEvent) => {
            console.error('[⚠️ Global Error]', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
            });
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    return null; // This component doesn't render anything
}

