'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import styles from './HomePage.module.css';

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
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={`${styles.hero} ${styles.section}`}>
                <div className={styles.heroBg}>
                    <div className={styles.heroOverlay}></div>
                </div>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={`${styles.heroTitle} fade-in`}>{t('hero.title')}</h1>
                        <p className={`${styles.heroSubtitle} fade-in`}>{t('hero.subtitle')}</p>
                        <div className={`${styles.heroCta} fade-in`}>
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
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t('quickEntry.title')}</h2>
                    <div className="grid grid-4">
                        <Link href="/tube-amplifiers?filter=vocals" className={`${styles.quickEntryCard} card`}>
                            <h3>{t('quickEntry.vocals.title')}</h3>
                            <p>{t('quickEntry.vocals.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=power" className={`${styles.quickEntryCard} card`}>
                            <h3>{t('quickEntry.power.title')}</h3>
                            <p>{t('quickEntry.power.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=small-room" className={`${styles.quickEntryCard} card`}>
                            <h3>{t('quickEntry.smallRoom.title')}</h3>
                            <p>{t('quickEntry.smallRoom.description')}</p>
                        </Link>
                        <Link href="/tube-amplifiers?filter=hard-speakers" className={`${styles.quickEntryCard} card`}>
                            <h3>{t('quickEntry.hardSpeakers.title')}</h3>
                            <p>{t('quickEntry.hardSpeakers.description')}</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t('featured.title')}</h2>
                    <div className={styles.featuredTabs}>
                        <button className={`${styles.tabBtn} ${styles.tabBtnActive}`}>{t('featured.tabs.bestSellers')}</button>
                        <button className={styles.tabBtn}>{t('featured.tabs.newArrivals')}</button>
                        <button className={styles.tabBtn}>{t('featured.tabs.vintage')}</button>
                    </div>
                    <div className="grid grid-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`${styles.productCard} card`}>
                                <div className={`${styles.productImage} skeleton`}></div>
                                <div className={styles.productInfo}>
                                    <div className={styles.productBadges}>
                                        <span className="badge badge-accent">SE 300B</span>
                                        <span className="badge">{tCommon('new')}</span>
                                    </div>
                                    <h3 className={styles.productName}>Classic SE 300B Amplifier</h3>
                                    <p className={styles.productPrice}>45,000,000{tCommon('currency')}</p>
                                    <div className={styles.productSpecs}>
                                        <span>8W • Min 88dB</span>
                                    </div>
                                    <div className={styles.productActions}>
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
            <section className={`${styles.matching} ${styles.section}`}>
                <div className="container">
                    <div>
                        <div>
                            <h2 className={styles.sectionTitle}>{t('matching.title')}</h2>
                            <p className={styles.sectionSubtitle}>{t('matching.subtitle')}</p>
                        </div>
                        <form onSubmit={handleMatchingSubmit} className={`${styles.matchingForm} card-elevated`}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
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
                            <div className={styles.formGroup}>
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
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t('trust.title')}</h2>
                    <div className="grid grid-3">
                        {['tested', 'packaging', 'warranty', 'vintage', 'setup', 'consultation'].map((key) => (
                            <div key={key} className={`${styles.trustCard} card`}>
                                <div className={styles.trustIcon}>
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
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t('customerSetups.title')}</h2>
                    <p className={styles.sectionSubtitle}>{t('customerSetups.subtitle')}</p>
                    <div className={styles.setupsGallery}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.setupCard}>
                                <div className={`${styles.setupImage} skeleton`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Guides Preview */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.guidesHeader}>
                        <h2 className={styles.sectionTitle}>{t('guidesPreview.title')}</h2>
                        <Link href="/guides" className="btn btn-secondary">
                            {t('guidesPreview.viewAll')}
                        </Link>
                    </div>
                    <div className="grid grid-3">
                        {[1, 2, 3].map((i) => (
                            <Link key={i} href={`/guides/article-${i}`} className={`${styles.guideCard} card`}>
                                <div className={styles.guideIcon}>📚</div>
                                <h3>Guide Title {i}</h3>
                                <p>Brief description of the guide content...</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
