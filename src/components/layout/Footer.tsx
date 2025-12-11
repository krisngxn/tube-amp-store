'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

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
        <footer className="footer">
            <div className="container">
                {/* Trust Section */}
                <div className="footer-trust">
                    <h3 className="trust-title">{t('trust.title')}</h3>
                    <div className="trust-grid">
                        <div className="trust-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.tested')}</span>
                        </div>
                        <div className="trust-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.packaging')}</span>
                        </div>
                        <div className="trust-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m10.607 2.121a6 6 0 010 8.486m-8.486 0a6 6 0 010-8.486M12 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.support')}</span>
                        </div>
                        <div className="trust-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>{t('trust.warranty')}</span>
                        </div>
                    </div>
                </div>

                <div className="divider divider-accent"></div>

                {/* Main Footer Content */}
                <div className="footer-main">
                    {/* Store Info */}
                    <div className="footer-section">
                        <h4 className="footer-brand">{t('storeInfo.title')}</h4>
                        <p className="footer-description">{t('storeInfo.description')}</p>
                        <div className="footer-contact">
                            <p>{t('storeInfo.address')}</p>
                            <p>{t('storeInfo.phone')}</p>
                            <p>{t('storeInfo.email')}</p>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="footer-section">
                        <h5 className="footer-heading">{t('sections.shop')}</h5>
                        <ul className="footer-links">
                            {shopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="footer-section">
                        <h5 className="footer-heading">{t('sections.support')}</h5>
                        <ul className="footer-links">
                            {supportLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div className="footer-section">
                        <h5 className="footer-heading">{t('sections.policies')}</h5>
                        <ul className="footer-links">
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
                <div className="footer-bottom">
                    <p className="copyright">© {currentYear} {t('storeInfo.title')}. {t('copyright').split('. ')[1]}</p>
                </div>
            </div>

            <style jsx>{`
        .footer {
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border-subtle);
          padding: var(--space-4xl) 0 var(--space-xl);
          margin-top: var(--space-4xl);
        }

        .footer-trust {
          text-align: center;
          margin-bottom: var(--space-3xl);
        }

        .trust-title {
          font-size: 1.5rem;
          margin-bottom: var(--space-xl);
          color: var(--color-accent-primary);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
          max-width: 900px;
          margin: 0 auto;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          justify-content: center;
        }

        .trust-item svg {
          color: var(--color-accent-primary);
          flex-shrink: 0;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .footer-brand {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--color-accent-primary);
          margin-bottom: var(--space-sm);
        }

        .footer-description {
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .footer-contact {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .footer-contact p {
          margin-bottom: var(--space-xs);
        }

        .footer-heading {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-primary);
          margin-bottom: var(--space-sm);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .footer-links a {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-links a:hover {
          color: var(--color-accent-primary);
        }

        .footer-bottom {
          text-align: center;
        }

        .copyright {
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        @media (max-width: 1024px) {
          .footer-main {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .footer {
            padding: var(--space-2xl) 0 var(--space-lg);
          }

          .trust-grid {
            grid-template-columns: 1fr;
            gap: var(--space-md);
          }

          .footer-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </footer>
    );
}
