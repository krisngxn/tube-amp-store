'use client';

export default function ReviewsPage() {
    return (
        <div className="reviews-page">
            <div className="container">
                <h1>Customer Reviews & Setups</h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Customer reviews and setup gallery coming soon...
                </p>
            </div>

            <style jsx>{`
        .reviews-page {
          padding: var(--space-2xl) 0;
          min-height: 100vh;
        }

        .reviews-page h1 {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
      `}</style>
        </div>
    );
}
