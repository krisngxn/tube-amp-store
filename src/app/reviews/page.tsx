'use client';

import styles from './page.module.css';

export default function ReviewsPage() {
    return (
        <div className={styles.reviewsPage}>
            <div className="container">
                <h1>Customer Reviews & Setups</h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Customer reviews and setup gallery coming soon...
                </p>
            </div>
        </div>
    );
}
