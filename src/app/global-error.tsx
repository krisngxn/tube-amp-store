'use client';

/**
 * Global error boundary for the entire app
 * Catches errors that bubble up to the root
 * This must be a client component and must export default
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Check if it's a Supabase 404 error
    const isSupabase404 = 
        (error?.message?.includes('404') || false) ||
        (error?.message?.includes('NOT_FOUND') || false) ||
        (error?.digest?.includes('404') || false);

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                        {isSupabase404 ? '404' : 'Error'}
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        {isSupabase404 ? 'Resource Not Found' : 'Something went wrong'}
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '600px' }}>
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    {error.digest && (
                        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#999' }}>
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#d4a574',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            Try again
                        </button>
                        <a
                            href="/"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#333',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '500',
                            }}
                        >
                            Go home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}

