'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { TrackedOrderDTO } from '@/lib/repositories/orders/tracking';
import styles from './page.module.css';

interface OrderActionsProps {
    order: TrackedOrderDTO;
    token: string;
}

export default function OrderActions({ order, token }: OrderActionsProps) {
    const t = useTranslations('tracking');
    const router = useRouter();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [changeMessage, setChangeMessage] = useState('');
    const [changeCategory, setChangeCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check if order is eligible for cancellation
    const cancellableStatuses: string[] = ['pending', 'deposit_pending', 'deposited', 'confirmed'];
    const isCancellable = cancellableStatuses.includes(order.status);

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            setError(t('cancel.reasonRequired'));
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/order/cancel/${order.orderCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    reason: cancelReason.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('cancel.error'));
            }

            setSuccess(t('cancel.success'));
            setShowCancelModal(false);
            
            // Refresh page after a short delay
            setTimeout(() => {
                router.refresh();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('cancel.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!changeMessage.trim()) {
            setError(t('changeRequest.messageRequired'));
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/order/change-request/${order.orderCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    message: changeMessage.trim(),
                    category: changeCategory || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('changeRequest.error'));
            }

            setSuccess(t('changeRequest.success'));
            setChangeMessage('');
            setChangeCategory('');
            
            // Close modal after a short delay
            setTimeout(() => {
                setShowChangeModal(false);
                setSuccess(null);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('changeRequest.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles.actions}>
                {isCancellable && (
                    <button
                        type="button"
                        className="btn btn-error"
                        onClick={() => setShowCancelModal(true)}
                    >
                        {t('actions.cancelOrder')}
                    </button>
                )}
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowChangeModal(true)}
                >
                    {t('actions.requestChange')}
                </button>
                <a href="/contact" className="btn btn-primary">
                    {t('actions.contact')}
                </a>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className={styles.modalOverlay} onClick={() => !isSubmitting && setShowCancelModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('cancel.title')}</h3>
                        <p className={styles.warning}>{t('cancel.warning')}</p>
                        
                        <div className={styles.formGroup}>
                            <label>{t('cancel.reason')}</label>
                            <select
                                className="input"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                disabled={isSubmitting}
                                required
                            >
                                <option value="">{t('cancel.reasonPlaceholder')}</option>
                                <option value="ordered_by_mistake">{t('cancel.reasonMistake')}</option>
                                <option value="want_to_change_items">{t('cancel.reasonChangeItems')}</option>
                                <option value="other">{t('cancel.reasonOther')}</option>
                            </select>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={handleCancelOrder}
                                disabled={isSubmitting || !cancelReason}
                            >
                                {isSubmitting ? t('cancel.processing') : t('cancel.confirm')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setError(null);
                                }}
                                disabled={isSubmitting}
                            >
                                {t('cancel.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Change Modal */}
            {showChangeModal && (
                <div className={styles.modalOverlay} onClick={() => !isSubmitting && setShowChangeModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('changeRequest.title')}</h3>
                        <p>{t('changeRequest.description')}</p>
                        
                        <form onSubmit={handleRequestChange}>
                            <div className={styles.formGroup}>
                                <label>{t('changeRequest.category')}</label>
                                <select
                                    className="input"
                                    value={changeCategory}
                                    onChange={(e) => setChangeCategory(e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    <option value="">{t('changeRequest.categoryPlaceholder')}</option>
                                    <option value="change_items">{t('changeRequest.categoryChangeItems')}</option>
                                    <option value="change_address">{t('changeRequest.categoryChangeAddress')}</option>
                                    <option value="cancel_refund">{t('changeRequest.categoryCancelRefund')}</option>
                                    <option value="other">{t('changeRequest.categoryOther')}</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>{t('changeRequest.message')} *</label>
                                <textarea
                                    className="input"
                                    value={changeMessage}
                                    onChange={(e) => setChangeMessage(e.target.value)}
                                    placeholder={t('changeRequest.messagePlaceholder')}
                                    rows={5}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            {error && <div className={styles.error}>{error}</div>}
                            {success && <div className={styles.success}>{success}</div>}

                            <div className={styles.modalActions}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting || !changeMessage.trim()}
                                >
                                    {isSubmitting ? t('changeRequest.submitting') : t('changeRequest.submit')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowChangeModal(false);
                                        setChangeMessage('');
                                        setChangeCategory('');
                                        setError(null);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {t('changeRequest.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

