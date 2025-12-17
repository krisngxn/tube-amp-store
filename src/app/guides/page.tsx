'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './page.module.css';

export default function GuidesPage() {
    const t = useTranslations('guide');

    return (
        <div className={styles.guidesPage}>
            <div className="container">
                <h1>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>

                <div className={styles.guidesGrid}>
                    {['whatIsTubeAmp', 'seVsPp', 'tubeTypes', 'speakerMatching', 'roomAcoustics', 'maintenance'].map((key) => (
                        <Link key={key} href={`/guides/${key}`} className={`${styles.guideCard} card`}>
                            <div className={styles.guideIcon}>📚</div>
                            <h3>{t(`articles.${key}.title`)}</h3>
                            <p>{t(`articles.${key}.description`)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
