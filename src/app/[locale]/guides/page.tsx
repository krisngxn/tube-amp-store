'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function GuidesPage() {
    const t = useTranslations('guide');

    return (
        <div className="guides-page">
            <div className="container">
                <h1>{t('title')}</h1>
                <p className="subtitle">{t('subtitle')}</p>

                <div className="guides-grid">
                    {['whatIsTubeAmp', 'seVsPp', 'tubeTypes', 'speakerMatching', 'roomAcoustics', 'maintenance'].map((key) => (
                        <Link key={key} href={`/guides/${key}`} className="guide-card card">
                            <div className="guide-icon">📚</div>
                            <h3>{t(`articles.${key}.title`)}</h3>
                            <p>{t(`articles.${key}.description`)}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .guides-page {
          padding: var(--space-2xl) 0;
          min-height: 100vh;
        }

        .guides-page h1 {
          text-align: center;
          margin-bottom: var(--space-md);
        }

        .subtitle {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-3xl);
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-xl);
        }

        .guide-card {
          padding: var(--space-xl);
          text-align: center;
        }

        .guide-icon {
          font-size: 3rem;
          margin-bottom: var(--space-md);
        }

        .guide-card h3 {
          margin-bottom: var(--space-sm);
        }

        .guide-card p {
          margin: 0;
          font-size: 0.875rem;
        }
      `}</style>
        </div>
    );
}
