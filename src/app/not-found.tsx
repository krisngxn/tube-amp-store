import Link from 'next/link';

export default function NotFound() {
    // Simple 404 page without i18n to avoid any potential errors
    const t = (key: string) => {
        const fallbacks: Record<string, string> = {
            'notFound.title': '404 - Page Not Found',
            'notFound.description': 'The page you are looking for does not exist.',
            'notFound.backHome': 'Back to Home',
        };
        return fallbacks[key] || key;
    };

    return (
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
                404
            </h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                {t('notFound.title') || 'Page Not Found'}
            </h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                {t('notFound.description') || 'The page you are looking for does not exist.'}
            </p>
            <Link
                href="/"
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#d4a574',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                }}
            >
                {t('notFound.backHome') || 'Back to Home'}
            </Link>
        </div>
    );
}

