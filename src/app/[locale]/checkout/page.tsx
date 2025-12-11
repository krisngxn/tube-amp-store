'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CheckoutPage() {
    const t = useTranslations('checkout');
    const tCommon = useTranslations('common');

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>{t('title')}</h1>
                <div className="checkout-layout">
                    <div className="checkout-form">
                        <div className="form-section card">
                            <h2>{t('information.title')}</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="label">{t('information.fullName.label')}</label>
                                    <input type="text" className="input" placeholder={t('information.fullName.placeholder')} />
                                </div>
                                <div className="form-group">
                                    <label className="label">{t('information.phone.label')}</label>
                                    <input type="tel" className="input" placeholder={t('information.phone.placeholder')} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="label">{t('information.email.label')}</label>
                                    <input type="email" className="input" placeholder={t('information.email.placeholder')} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="label">{t('information.address.label')}</label>
                                    <input type="text" className="input" placeholder={t('information.address.placeholder')} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section card">
                            <h2>{t('payment.title')}</h2>
                            <div className="payment-methods">
                                <label className="payment-method">
                                    <input type="radio" name="payment" defaultChecked />
                                    <div className="payment-info">
                                        <strong>{t('payment.methods.cod.title')}</strong>
                                        <p>{t('payment.methods.cod.description')}</p>
                                    </div>
                                </label>
                                <label className="payment-method">
                                    <input type="radio" name="payment" />
                                    <div className="payment-info">
                                        <strong>{t('payment.methods.bankTransfer.title')}</strong>
                                        <p>{t('payment.methods.bankTransfer.description')}</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <Link href="/cart" className="btn btn-ghost">{t('actions.backToCart')}</Link>
                            <button className="btn btn-primary">{t('actions.placeOrder')}</button>
                        </div>
                    </div>

                    <div className="order-summary card-elevated">
                        <h3>{t('orderSummary.title')}</h3>
                        <div className="summary-items">
                            <div className="summary-item">
                                <span>Sample Product</span>
                                <span>45,000,000{tCommon('currency')}</span>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="summary-row">
                            <span>{t('orderSummary.subtotal')}</span>
                            <span>45,000,000{tCommon('currency')}</span>
                        </div>
                        <div className="summary-row">
                            <strong>{t('orderSummary.total')}</strong>
                            <strong className="text-accent">45,000,000{tCommon('currency')}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .checkout-page {
          padding: var(--space-2xl) 0;
          min-height: 100vh;
        }

        .checkout-page h1 {
          margin-bottom: var(--space-2xl);
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-2xl);
          align-items: start;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .form-section {
          padding: var(--space-xl);
        }

        .form-section h2 {
          font-size: 1.25rem;
          margin-bottom: var(--space-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .payment-method {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .payment-method:hover {
          border-color: var(--color-accent-primary);
          background: var(--color-accent-glow);
        }

        .payment-info strong {
          display: block;
          margin-bottom: var(--space-xs);
        }

        .payment-info p {
          font-size: 0.875rem;
          margin: 0;
        }

        .checkout-actions {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .order-summary {
          position: sticky;
          top: 100px;
          padding: var(--space-xl);
        }

        .summary-items {
          margin-bottom: var(--space-lg);
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
          font-size: 0.9375rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        @media (max-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .order-summary {
            position: static;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
