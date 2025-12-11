'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CartPage() {
    const t = useTranslations('cart');
    const tCommon = useTranslations('common');

    // Mock cart data
    const cartItems = [
        {
            id: 1,
            name: 'Classic SE 300B Amplifier',
            price: 45000000,
            quantity: 1,
            image: '',
        },
    ];

    const isEmpty = cartItems.length === 0;
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (isEmpty) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.5 4.5M17 13l1.5 4.5M9 18a1 1 0 100-2 1 1 0 000 2zM15 18a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <h2>{t('empty.title')}</h2>
                        <p>{t('empty.description')}</p>
                        <Link href="/tube-amplifiers" className="btn btn-primary">
                            {t('empty.cta')}
                        </Link>
                    </div>
                </div>

                <style jsx>{`
          .cart-page {
            padding: var(--space-4xl) 0;
            min-height: 60vh;
          }

          .empty-cart {
            text-align: center;
            max-width: 500px;
            margin: 0 auto;
            padding: var(--space-4xl) var(--space-lg);
          }

          .empty-cart svg {
            color: var(--color-text-tertiary);
            margin-bottom: var(--space-xl);
          }

          .empty-cart h2 {
            margin-bottom: var(--space-md);
          }

          .empty-cart p {
            margin-bottom: var(--space-xl);
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1>{t('title')}</h1>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item card">
                                <div className="item-image skeleton"></div>
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-price">{item.price.toLocaleString()}{tCommon('currency')}</p>
                                </div>
                                <div className="item-quantity">
                                    <label className="label">{t('items.quantity')}</label>
                                    <div className="quantity-selector">
                                        <button>-</button>
                                        <span>{item.quantity}</span>
                                        <button>+</button>
                                    </div>
                                </div>
                                <div className="item-total">
                                    <p className="label">{t('items.total')}</p>
                                    <p className="total-price">{(item.price * item.quantity).toLocaleString()}{tCommon('currency')}</p>
                                </div>
                                <button className="btn btn-ghost item-remove">
                                    {t('items.remove')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary card-elevated">
                        <h3>{t('summary.title')}</h3>
                        <div className="summary-row">
                            <span>{t('summary.subtotal')}</span>
                            <span>{subtotal.toLocaleString()}{tCommon('currency')}</span>
                        </div>
                        <div className="summary-row">
                            <span>{t('summary.shipping')}</span>
                            <span className="text-muted">{t('summary.shippingNote')}</span>
                        </div>
                        <div className="divider"></div>
                        <div className="summary-row summary-total">
                            <strong>{t('summary.total')}</strong>
                            <strong className="text-accent">{subtotal.toLocaleString()}{tCommon('currency')}</strong>
                        </div>
                        <Link href="/checkout" className="btn btn-primary btn-large">
                            {t('summary.checkout')}
                        </Link>

                        <div className="summary-note">
                            <p>{t('notes.matchingAdvice')}</p>
                            <button className="btn btn-ghost">
                                {t('notes.chatCta')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .cart-page {
          padding: var(--space-2xl) 0;
          min-height: 100vh;
        }

        .cart-page h1 {
          margin-bottom: var(--space-2xl);
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-2xl);
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .cart-item {
          display: grid;
          grid-template-columns: 120px 1fr auto auto auto;
          gap: var(--space-lg);
          align-items: center;
          padding: var(--space-lg);
        }

        .item-image {
          width: 120px;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
        }

        .item-details h3 {
          font-size: 1.125rem;
          margin-bottom: var(--space-xs);
        }

        .item-price {
          color: var(--color-text-tertiary);
          margin: 0;
        }

        .item-quantity {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .quantity-selector button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-accent-primary);
        }

        .item-total {
          text-align: right;
        }

        .total-price {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-accent-primary);
          margin: 0;
        }

        .item-remove {
          padding: var(--space-sm);
        }

        .cart-summary {
          position: sticky;
          top: 100px;
          padding: var(--space-xl);
        }

        .cart-summary h3 {
          margin-bottom: var(--space-lg);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-md);
          font-size: 0.9375rem;
        }

        .summary-total {
          font-size: 1.125rem;
          margin-top: var(--space-md);
        }

        .btn-large {
          width: 100%;
          padding: var(--space-lg);
          margin-top: var(--space-lg);
        }

        .summary-note {
          margin-top: var(--space-xl);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--color-border-subtle);
          text-align: center;
        }

        .summary-note p {
          font-size: 0.875rem;
          margin-bottom: var(--space-sm);
        }

        @media (max-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }

          .cart-summary {
            position: static;
          }

          .cart-item {
            grid-template-columns: 80px 1fr;
            gap: var(--space-md);
          }

          .item-quantity,
          .item-total {
            grid-column: 2;
          }

          .item-remove {
            grid-column: 2;
            justify-self: start;
          }
        }
      `}</style>
        </div>
    );
}
