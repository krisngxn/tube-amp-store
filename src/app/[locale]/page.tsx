'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
    const t = useTranslations('home');
    const tCommon = useTranslations('common');
    const [matchingForm, setMatchingForm] = useState({
        sensitivity: '',
        impedance: '8',
        roomSize: 'medium',
        listeningLevel: 'medium',
        genres: '',
    });

    const handleMatchingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement matching logic
        console.log('Matching form submitted:', matchingForm);
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-overlay"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title fade-in">{t('hero.title')}</h1>
                        <p className="hero-subtitle fade-in">{t('hero.subtitle')}</p>
                        <div className="hero-cta fade-in">
                            <Link href="/tube-amplifiers" className="btn btn-primary">
                                {t('hero.cta.browse')}
                            </Link>
                            <button className="btn btn-secondary">
                                {t('hero.cta.matching')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Entry Tiles */}
            <section className="quick-entry">
                <div className="container">
                    <h2 className="section-title">{t('quickEntry.title')}</h2>
                    <div className="grid grid-4">
                        <Link href="/tube-amplifiers?filter=vocals" className="quick-entry-card card">
                            <h3>{t('quickEntry.vocals.title')}</h3>
                            <p>{t('quickEntry.vocals.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=power" className="quick-entry-card card">
                            <h3>{t('quickEntry.power.title')}</h3>
                            <p>{t('quickEntry.power.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=small-room" className="quick-entry-card card">
                            <h3>{t('quickEntry.smallRoom.title')}</h3>
                            <p>{t('quickEntry.smallRoom.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=hard-speakers" className="quick-entry-card card">
                            <h3>{t('quickEntry.hardSpeakers.title')}</h3>
                            <p>{t('quickEntry.hardSpeakers.description')}</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured">
                <div className="container">
                    <h2 className="section-title">{t('featured.title')}</h2>
                    <div className="featured-tabs">
                        <button className="tab-btn active">{t('featured.tabs.bestSellers')}</button>
                        <button className="tab-btn">{t('featured.tabs.newArrivals')}</button>
                        <button className="tab-btn">{t('featured.tabs.vintage')}</button>
                    </div>
                    <div className="grid grid-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="product-card card">
                                <div className="product-image skeleton"></div>
                                <div className="product-info">
                                    <div className="product-badges">
                                        <span className="badge badge-accent">SE 300B</span>
                                        <span className="badge">{tCommon('new')}</span>
                                    </div>
                                    <h3 className="product-name">Classic SE 300B Amplifier</h3>
                                    <p className="product-price">45,000,000{tCommon('currency')}</p>
                                    <div className="product-specs">
                                        <span>8W • Min 88dB</span>
                                    </div>
                                    <div className="product-actions">
                                        <Link href={`/product/sample-${i}`} className="btn btn-secondary">
                                            {tCommon('view')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Matching Advice Tool */}
            <section className="matching">
                <div className="container">
                    <div className="matching-content">
                        <div className="matching-header">
                            <h2 className="section-title">{t('matching.title')}</h2>
                            <p className="section-subtitle">{t('matching.subtitle')}</p>
                        </div>
                        <form onSubmit={handleMatchingSubmit} className="matching-form card-elevated">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="label">{t('matching.form.sensitivity.label')}</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder={t('matching.form.sensitivity.placeholder')}
                                        value={matchingForm.sensitivity}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, sensitivity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">{t('matching.form.impedance.label')}</label>
                                    <select
                                        className="input select"
                                        value={matchingForm.impedance}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, impedance: e.target.value })}
                                    >
                                        <option value="4">{t('matching.form.impedance.options.4')}</option>
                                        <option value="6">{t('matching.form.impedance.options.6')}</option>
                                        <option value="8">{t('matching.form.impedance.options.8')}</option>
                                        <option value="16">{t('matching.form.impedance.options.16')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">{t('matching.form.roomSize.label')}</label>
                                    <select
                                        className="input select"
                                        value={matchingForm.roomSize}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, roomSize: e.target.value })}
                                    >
                                        <option value="small">{t('matching.form.roomSize.options.small')}</option>
                                        <option value="medium">{t('matching.form.roomSize.options.medium')}</option>
                                        <option value="large">{t('matching.form.roomSize.options.large')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">{t('matching.form.listeningLevel.label')}</label>
                                    <select
                                        className="input select"
                                        value={matchingForm.listeningLevel}
                                        onChange={(e) => setMatchingForm({ ...matchingForm, listeningLevel: e.target.value })}
                                    >
                                        <option value="low">{t('matching.form.listeningLevel.options.low')}</option>
                                        <option value="medium">{t('matching.form.listeningLevel.options.medium')}</option>
                                        <option value="loud">{t('matching.form.listeningLevel.options.loud')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">{t('matching.form.genres.label')}</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('matching.form.genres.placeholder')}
                                    value={matchingForm.genres}
                                    onChange={(e) => setMatchingForm({ ...matchingForm, genres: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                {t('matching.form.submit')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="trust">
                <div className="container">
                    <h2 className="section-title">{t('trust.title')}</h2>
                    <div className="grid grid-3">
                        {['tested', 'packaging', 'warranty', 'vintage', 'setup', 'consultation'].map((key) => (
                            <div key={key} className="trust-card card">
                                <div className="trust-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h3>{t(`trust.badges.${key}.title`)}</h3>
                                <p>{t(`trust.badges.${key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Customer Setups */}
            <section className="customer-setups">
                <div className="container">
                    <h2 className="section-title">{t('customerSetups.title')}</h2>
                    <p className="section-subtitle">{t('customerSetups.subtitle')}</p>
                    <div className="setups-gallery">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="setup-card">
                                <div className="setup-image skeleton"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Guides Preview */}
            <section className="guides-preview">
                <div className="container">
                    <div className="guides-header">
                        <h2 className="section-title">{t('guidesPreview.title')}</h2>
                        <Link href="/guides" className="btn btn-secondary">
                            {t('guidesPreview.viewAll')}
                        </Link>
                    </div>
                    <div className="grid grid-3">
                        {[1, 2, 3].map((i) => (
                            <Link key={i} href={`/guides/article-${i}`} className="guide-card card">
                                <div className="guide-icon">📚</div>
                                <h3>Guide Title {i}</h3>
                                <p>Brief description of the guide content...</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        /* Hero */
        .hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, var(--color-bg-primary) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          padding: var(--space-2xl) var(--space-lg);
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          margin-bottom: var(--space-lg);
          background: linear-gradient(135deg, var(--color-accent-bright), var(--color-accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          margin-bottom: var(--space-2xl);
          color: var(--color-text-secondary);
        }

        .hero-cta {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Sections */
        section {
          padding: var(--space-4xl) 0;
        }

        .section-title {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .section-subtitle {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-xl);
          color: var(--color-text-secondary);
        }

        /* Quick Entry */
        .quick-entry-card {
          text-align: center;
          padding: var(--space-xl);
          cursor: pointer;
        }

        .quick-entry-card h3 {
          font-size: 1.125rem;
          margin-bottom: var(--space-sm);
          color: var(--color-accent-primary);
        }

        .quick-entry-card p {
          font-size: 0.875rem;
          margin: 0;
        }

        /* Featured */
        .featured-tabs {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: var(--space-sm) var(--space-lg);
          background: transparent;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover,
        .tab-btn.active {
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          background: var(--color-accent-glow);
        }

        /* Product Card */
        .product-card {
          display: flex;
          flex-direction: column;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        .product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-badges {
          display: flex;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
          flex-wrap: wrap;
        }

        .product-name {
          font-size: 1.125rem;
          margin-bottom: var(--space-sm);
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-accent-primary);
          margin-bottom: var(--space-sm);
        }

        .product-specs {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
          margin-bottom: var(--space-md);
        }

        .product-actions {
          margin-top: auto;
        }

        /* Matching */
        .matching {
          background: var(--color-bg-secondary);
        }

        .matching-form {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-2xl);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        /* Trust */
        .trust-card {
          text-align: center;
          padding: var(--space-xl);
        }

        .trust-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--space-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-glow);
          border-radius: 50%;
          color: var(--color-accent-primary);
        }

        .trust-card h3 {
          font-size: 1.125rem;
          margin-bottom: var(--space-sm);
        }

        .trust-card p {
          font-size: 0.875rem;
          margin: 0;
        }

        /* Customer Setups */
        .setups-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .setup-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .setup-image {
          width: 100%;
          aspect-ratio: 16/9;
        }

        /* Guides */
        .guides-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .guide-card {
          text-align: center;
          padding: var(--space-xl);
        }

        .guide-icon {
          font-size: 3rem;
          margin-bottom: var(--space-md);
        }

        .guide-card h3 {
          font-size: 1.125rem;
          margin-bottom: var(--space-sm);
        }

        .guide-card p {
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .guides-header {
            flex-direction: column;
            gap: var(--space-md);
          }
        }
      `}</style>
        </div>
    );
}
