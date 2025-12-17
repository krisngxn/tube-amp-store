'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './Footer.module.css';

export default function Footer() {
    const t = useTranslations('footer');
    const currentYear = new Date().getFullYear();

    const shopLinks = [
        { href: '/tube-amplifiers', label: t('links.tubeAmplifiers') },
        { href: '/tube-amplifiers?filter=vintage', label: t('links.vintage') },
        { href: '/tube-amplifiers?filter=new', label: t('links.newArrivals') },
    ];

    const supportLinks = [
        { href: '/guides', label: t('links.guides') },
        { href: '/service', label: t('links.service') },
        { href: '/reviews', label: t('links.reviews') },
        { href: '/contact', label: t('links.contact') },
    ];

    const policyLinks = [
        { href: '/policies/shipping', label: t('links.shipping') },
        { href: '/policies/warranty', label: t('links.warranty') },
        { href: '/policies/returns', label: t('links.returns') },
        { href: '/policies/payment', label: t('links.payment') },
        { href: '/policies/privacy', label: t('links.privacy') },
        { href: '/policies/terms', label: t('links.terms') },
    ];

    return (
        <footer className={styles.footer}>
            <div className="container">
                {/* Trust Section */}
                <div className={styles.footerTrust}>
                    <h3 className={styles.trustTitle}>{t('trust.title')}</h3>
                    <div className={styles.trustGrid}>
                        <div className={styles.trustItem}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.tested')}</span>
                        </div>
                        <div className={styles.trustItem}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.packaging')}</span>
                        </div>
                        <div className={styles.trustItem}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m10.607 2.121a6 6 0 010 8.486m-8.486 0a6 6 0 010-8.486M12 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.support')}</span>
                        </div>
                        <div className={styles.trustItem}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.warranty')}</span>
                        </div>
                    </div>
                </div>

                <div className="divider divider-accent"></div>

                {/* Main Footer Content */}
                <div className={styles.footerMain}>
                    {/* Store Info */}
                    <div className={styles.footerSection}>
                        <h4 className={styles.footerBrand}>{t('storeInfo.title')}</h4>
                        <p className={styles.footerDescription}>{t('storeInfo.description')}</p>
                        <div className={styles.footerContact}>
                            <p>{t('storeInfo.address')}</p>
                            <p>{t('storeInfo.phone')}</p>
                            <p>{t('storeInfo.email')}</p>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className={styles.footerSection}>
                        <h5 className={styles.footerHeading}>{t('sections.shop')}</h5>
                        <ul className={styles.footerLinks}>
                            {shopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className={styles.footerSection}>
                        <h5 className={styles.footerHeading}>{t('sections.support')}</h5>
                        <ul className={styles.footerLinks}>
                            {supportLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div className={styles.footerSection}>
                        <h5 className={styles.footerHeading}>{t('sections.policies')}</h5>
                        <ul className={styles.footerLinks}>
                            {policyLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Copyright */}
                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>© {currentYear} {t('storeInfo.title')}. {t('copyright').split('. ')[1]}</p>
                </div>
            </div>
        </footer>
    );
}
