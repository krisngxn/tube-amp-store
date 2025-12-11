'use client';

import { useTranslations } from 'next-intl';

export default function ContactPage() {
    const t = useTranslations('footer');

    return (
        <div className="contact-page">
            <div className="container">
                <h1>Contact Us</h1>
                <div className="contact-content">
                    <div className="contact-info card">
                        <h2>{t('storeInfo.title')}</h2>
                        <p>{t('storeInfo.description')}</p>
                        <div className="info-items">
                            <p><strong>Address:</strong> {t('storeInfo.address')}</p>
                            <p><strong>Phone:</strong> {t('storeInfo.phone')}</p>
                            <p><strong>Email:</strong> {t('storeInfo.email')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .contact-page {
          padding: var(--space-2xl) 0;
          min-height: 100vh;
        }

        .contact-page h1 {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .contact-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .contact-info {
          padding: var(--space-2xl);
        }

        .info-items {
          margin-top: var(--space-lg);
        }

        .info-items p {
          margin-bottom: var(--space-md);
        }
      `}</style>
        </div>
    );
}
