'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.css';

export default function ContactPage() {
    const t = useTranslations('footer');

    return (
        <div className={styles.contactPage}>
            <div className="container">
                <h1>Contact Us</h1>
                <div className={styles.contactContent}>
                    <div className={`${styles.contactInfo} card`}>
                        <h2>{t('storeInfo.title')}</h2>
                        <p>{t('storeInfo.description')}</p>
                        <div className={styles.infoItems}>
                            <p><strong>Address:</strong> {t('storeInfo.address')}</p>
                            <p><strong>Phone:</strong> {t('storeInfo.phone')}</p>
                            <p><strong>Email:</strong> {t('storeInfo.email')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
