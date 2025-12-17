'use client';

import { useState, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import type { TrackedOrderDTO } from '@/lib/repositories/orders/tracking';

interface TrackingFormProps {
    initialOrderCode?: string;
    errorMessage?: string;
}

export default function TrackingForm({ initialOrderCode = '', errorMessage }: TrackingFormProps) {
    const t = useTranslations('tracking');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();

    const [orderCode, setOrderCode] = useState(initialOrderCode);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(errorMessage || null);
    const [order, setOrder] = useState<TrackedOrderDTO | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/order/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderCode: orderCode.trim(),
                    emailOrPhone: emailOrPhone.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || t('errors.notFound'));
                setOrder(null);
                return;
            }

            setOrder(data.order);
            setError(null);
        } catch (err) {
            setError(t('errors.network'));
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusLabel = (status: string) => {
        return t(`status.${status}`, { defaultValue: status });
    };

    const getPaymentStatusLabel = (status: string) => {
        return t(`paymentStatus.${status}`, { defaultValue: status });
    };

    if (order) {
        return (
            <div className={styles.orderDetails}>
                {/* Order Header */}
                <div className={styles.orderHeader}>
                    <div>
                        <h2>{t('order.orderCode')}: {order.orderCode}</h2>
                        <p className={styles.orderDate}>
                            {t('order.createdAt')}: {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className={styles.statusBadge}>
                        <span className={styles.statusLabel}>{t('order.status')}:</span>
                        <span className={`${styles.statusValue} ${styles[`status-${order.status}`]}`}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                </div>

                {/* Status Timeline */}
                {order.statusHistory.length > 0 && (
                    <div className={styles.statusTimeline}>
                        <h3>{t('order.timeline')}</h3>
                        <div className={styles.timeline}>
                            {order.statusHistory.map((history) => (
                                <div key={history.id} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineStatus}>
                                            {history.fromStatus ? (
                                                <>
                                                    {getStatusLabel(history.fromStatus)} → {getStatusLabel(history.toStatus)}
                                                </>
                                            ) : (
                                                getStatusLabel(history.toStatus)
                                            )}
                                        </div>
                                        <div className={styles.timelineDate}>
                                            {formatDate(history.createdAt)}
                                        </div>
                                        {history.note && (
                                            <div className={styles.timelineNote}>
                                                {history.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className={styles.itemsSection}>
                    <h3>{t('order.items')}</h3>
                    <div className={styles.itemsList}>
                        {order.orderItems.map((item) => (
                            <div key={item.id} className={styles.orderItem}>
                                {item.productImageUrl && (
                                    <img
                                        src={item.productImageUrl}
                                        alt={item.productName}
                                        className={styles.itemImage}
                                    />
                                )}
                                <div className={styles.itemInfo}>
                                    <h4>{item.productName}</h4>
                                    <p>
                                        {tCommon('quantity')}: {item.quantity} × {formatCurrency(item.unitPrice)} {tCommon('currency')}
                                    </p>
                                </div>
                                <div className={styles.itemTotal}>
                                    {formatCurrency(item.subtotal)} {tCommon('currency')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className={styles.totalsSection}>
                    <h3>{t('order.totals')}</h3>
                    <div className={styles.totalsList}>
                        <div className={styles.totalRow}>
                            <span>{t('order.subtotal')}</span>
                            <span>{formatCurrency(order.subtotal)} {tCommon('currency')}</span>
                        </div>
                        {order.shippingFee > 0 && (
                            <div className={styles.totalRow}>
                                <span>{t('order.shipping')}</span>
                                <span>{formatCurrency(order.shippingFee)} {tCommon('currency')}</span>
                            </div>
                        )}
                        {order.tax > 0 && (
                            <div className={styles.totalRow}>
                                <span>{t('order.tax')}</span>
                                <span>{formatCurrency(order.tax)} {tCommon('currency')}</span>
                            </div>
                        )}
                        {order.discount > 0 && (
                            <div className={styles.totalRow}>
                                <span>{t('order.discount')}</span>
                                <span>-{formatCurrency(order.discount)} {tCommon('currency')}</span>
                            </div>
                        )}
                        {order.orderType === 'deposit_reservation' && order.depositAmountVnd && (
                            <>
                                <div className={`${styles.totalRow} ${styles.depositRow}`}>
                                    <span>{t('order.depositAmount')}</span>
                                    <span className="text-accent">
                                        {formatCurrency(order.depositAmountVnd)} {tCommon('currency')}
                                    </span>
                                </div>
                                {order.remainingAmount && (
                                    <div className={styles.totalRow}>
                                        <span>{t('order.remainingBalance')}</span>
                                        <span>{formatCurrency(order.remainingAmount)} {tCommon('currency')}</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                            <strong>
                                {order.orderType === 'deposit_reservation' && order.depositAmountVnd
                                    ? t('order.depositDue')
                                    : t('order.total')}
                            </strong>
                            <strong className="text-accent">
                                {order.orderType === 'deposit_reservation' && order.depositAmountVnd
                                    ? `${formatCurrency(order.depositAmountVnd)} ${tCommon('currency')}`
                                    : `${formatCurrency(order.total)} ${tCommon('currency')}`}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Deposit Details */}
                {order.orderType === 'deposit_reservation' && (
                    <div className={styles.depositSection}>
                        <h3>{t('order.depositDetails')}</h3>
                        <div className={styles.depositInfo}>
                            {order.depositAmountVnd && (
                                <div className={styles.depositRow}>
                                    <span>{t('order.depositAmount')}:</span>
                                    <strong className="text-accent">
                                        {formatCurrency(order.depositAmountVnd)} {tCommon('currency')}
                                    </strong>
                                </div>
                            )}
                            {order.depositDueAt && (
                                <div className={styles.depositRow}>
                                    <span>{t('order.depositDueAt')}:</span>
                                    <strong>
                                        {formatDate(order.depositDueAt)}
                                    </strong>
                                </div>
                            )}
                            {order.remainingAmount && (
                                <div className={styles.depositRow}>
                                    <span>{t('order.remainingBalance')}:</span>
                                    <span>
                                        {formatCurrency(order.remainingAmount)} {tCommon('currency')}
                                    </span>
                                </div>
                            )}
                            {order.depositReceivedAt && (
                                <div className={styles.depositRow}>
                                    <span>{t('order.depositReceivedAt')}:</span>
                                    <span className="text-success">
                                        {formatDate(order.depositReceivedAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Status */}
                <div className={styles.paymentSection}>
                    <h3>{t('order.paymentStatus')}</h3>
                    <p>
                        <strong>{getPaymentStatusLabel(order.paymentStatus)}</strong>
                    </p>
                    <p className={styles.paymentMethod}>
                        {t('order.paymentMethod')}: {order.paymentMethod === 'cod' ? t('order.paymentCod') : t('order.paymentBank')}
                    </p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            setOrder(null);
                            setOrderCode('');
                            setEmailOrPhone('');
                        }}
                    >
                        {t('actions.trackAnother')}
                    </button>
                    <Link href="/contact" className="btn btn-primary">
                        {t('actions.contact')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.trackForm}>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="orderCode">{t('form.orderCode')}</label>
                    <input
                        id="orderCode"
                        type="text"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        placeholder={t('form.orderCodePlaceholder')}
                        required
                        disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="emailOrPhone">{t('form.emailOrPhone')}</label>
                    <input
                        id="emailOrPhone"
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder={t('form.emailOrPhonePlaceholder')}
                        required
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? t('form.loading') : t('form.submit')}
                </button>
            </form>
        </div>
    );
}

