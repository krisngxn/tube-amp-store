'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const t = useTranslations('product');
    const tCommon = useTranslations('common');
    const [activeTab, setActiveTab] = useState('overview');
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="product-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link href="/">{tCommon('brand')}</Link>
                    <span>/</span>
                    <Link href="/tube-amplifiers">Tube Amplifiers</Link>
                    <span>/</span>
                    <span>Product Name</span>
                </nav>

                {/* Product Main */}
                <div className="product-main">
                    {/* Gallery */}
                    <div className="product-gallery">
                        <div className="gallery-main skeleton"></div>
                        <div className="gallery-thumbs">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="gallery-thumb skeleton"></div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="product-details">
                        <div className="product-badges">
                            <span className="badge badge-accent">SE 300B</span>
                            <span className="badge badge-success">{tCommon('inStock')}</span>
                        </div>

                        <h1 className="product-title">Classic SE 300B Amplifier</h1>

                        <p className="product-price">45,000,000{tCommon('currency')}</p>

                        {/* Summary */}
                        <div className="product-summary card">
                            <h3>{t('summary.title')}</h3>
                            <ul>
                                <li>Single-Ended 300B topology for pure, detailed sound</li>
                                <li>8W output power, perfect for high-sensitivity speakers</li>
                                <li>Handmade with premium components</li>
                            </ul>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span>{t('trust.tested')}</span>
                            </div>
                            <div className="trust-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span>{t('trust.safeShipping')}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="product-actions">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <button className="btn btn-primary btn-large">
                                {t('cta.addToCart')}
                            </button>
                            <button className="btn btn-secondary btn-large">
                                {t('cta.reserveWithDeposit')}
                            </button>
                            <button className="btn btn-ghost sticky-chat">
                                {t('cta.chatForMatching')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Matching Section */}
                <section className="matching-section card">
                    <h2>{t('matching.title')}</h2>
                    <div className="matching-info">
                        <div className="matching-item">
                            <strong>{t('matching.recommendedSensitivity', { db: 88 })}</strong>
                        </div>
                        <div className="matching-item">
                            <strong>{t('matching.taps', { taps: '4Ω, 8Ω, 16Ω' })}</strong>
                        </div>
                    </div>
                    <button className="btn btn-secondary">
                        {t('matching.checkCompatibility')}
                    </button>
                </section>

                {/* Tabs */}
                <div className="product-tabs">
                    <div className="tabs-nav">
                        {['overview', 'specifications', 'sound', 'matching', 'condition', 'shipping', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {t(`tabs.${tab}`)}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content card">
                        {activeTab === 'overview' && (
                            <div>
                                <h3>Overview</h3>
                                <p>Detailed product overview content goes here...</p>
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div>
                                <h3>{t('tabs.specifications')}</h3>
                                <table className="specs-table">
                                    <tbody>
                                        <tr>
                                            <td>{t('specifications.topology')}</td>
                                            <td>Single-Ended (SE)</td>
                                        </tr>
                                        <tr>
                                            <td>{t('specifications.tubeType')}</td>
                                            <td>300B</td>
                                        </tr>
                                        <tr>
                                            <td>{t('specifications.power')}</td>
                                            <td>8W</td>
                                        </tr>
                                        <tr>
                                            <td>{t('specifications.taps')}</td>
                                            <td>4Ω, 8Ω, 16Ω</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* Other tabs would be similar */}
                    </div>
                </div>

                {/* Related Products */}
                <section className="related-products">
                    <h2>{t('related.title')}</h2>
                    <div className="products-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="product-card card">
                                <div className="product-image skeleton"></div>
                                <h3>Related Product {i}</h3>
                                <p className="product-price">35,000,000{tCommon('currency')}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx>{`
        .product-page {
          padding: var(--space-2xl) 0;
        }

        .breadcrumb {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          font-size: 0.875rem;
          color: var(--color-text-tertiary);
        }

        .breadcrumb a {
          color: var(--color-text-tertiary);
        }

        .breadcrumb a:hover {
          color: var(--color-accent-primary);
        }

        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
          margin-bottom: var(--space-3xl);
        }

        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .gallery-main {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-lg);
        }

        .gallery-thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-sm);
        }

        .gallery-thumb {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .product-badges {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .product-title {
          font-size: 2rem;
          margin: 0;
        }

        .product-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-accent-primary);
          margin: 0;
        }

        .product-summary {
          padding: var(--space-lg);
        }

        .product-summary h3 {
          font-size: 1rem;
          margin-bottom: var(--space-md);
        }

        .product-summary ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .product-summary li::before {
          content: '✓';
          color: var(--color-accent-primary);
          margin-right: var(--space-sm);
        }

        .trust-badges {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .trust-badge svg {
          color: var(--color-accent-primary);
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          width: fit-content;
        }

        .quantity-selector button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-accent-primary);
          font-size: 1.25rem;
        }

        .btn-large {
          padding: var(--space-lg) var(--space-xl);
          font-size: 1rem;
        }

        .matching-section {
          padding: var(--space-2xl);
          margin-bottom: var(--space-3xl);
        }

        .matching-info {
          display: flex;
          gap: var(--space-xl);
          margin: var(--space-lg) 0;
          flex-wrap: wrap;
        }

        .product-tabs {
          margin-bottom: var(--space-3xl);
        }

        .tabs-nav {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
          overflow-x: auto;
          padding-bottom: var(--space-sm);
        }

        .tab-btn {
          padding: var(--space-sm) var(--space-lg);
          background: transparent;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover,
        .tab-btn.active {
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          background: var(--color-accent-glow);
        }

        .tab-content {
          padding: var(--space-2xl);
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .specs-table td {
          padding: var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .specs-table td:first-child {
          color: var(--color-text-tertiary);
          width: 40%;
        }

        .related-products h2 {
          margin-bottom: var(--space-xl);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .product-card {
          padding: var(--space-lg);
        }

        .product-image {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        @media (max-width: 1024px) {
          .product-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
