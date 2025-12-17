import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './NotFound.module.css';

export default function ProductNotFound() {
    const t = useTranslations('product');

    return (
        <div className={styles.notFoundPage}>
            <div className="container">
                <div className={styles.content}>
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={styles.icon}
                    >
                        <path
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12 12l-8-4m8 4l8-4m-8 4v10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.3"
                        />
                    </svg>

                    <h1 className={styles.title}>{t('notFound.title')}</h1>
                    <p className={styles.description}>{t('notFound.description')}</p>

                    <Link href="/tube-amplifiers" className="btn btn-primary btn-large">
                        {t('notFound.backToCollection')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
