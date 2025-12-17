'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { adminUpdateOrderStatus, type AdminOrderDetail, type OrderStatus } from '@/lib/repositories/admin/orders';
import { 
    updateOrderStatusAction, 
    markDepositReceivedAction,
    expireReservationAction,
    cancelReservationAction 
} from './actions';
import styles from './page.module.css';

interface OrderDetailContentProps {
    order: AdminOrderDetail;
}

export default function OrderDetailContent({ order }: OrderDetailContentProps) {
    const t = useTranslations('admin.orders.detail');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [depositActionPending, setDepositActionPending] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundRestock, setRefundRestock] = useState(false);
    const [refundNote, setRefundNote] = useState('');
    const [refundPending, setRefundPending] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (selectedStatus === order.status) {
            setError(t('statusUpdate.sameStatus'));
            return;
        }

        startTransition(async () => {
            try {
                await updateOrderStatusAction(order.orderNumber, selectedStatus, note || undefined);
                setSuccess(true);
                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('statusUpdate.error'));
            }
        });
    };

    return (
        <div className={styles.orderDetail}>
            {/* Order Header Info */}
            <div className={styles.section}>
                <div className={styles.infoGrid}>
                    <div>
                        <label>{t('orderCode')}</label>
                        <strong>{order.orderNumber}</strong>
                    </div>
                    <div>
                        <label>{t('createdAt')}</label>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                        <label>{t('statusLabel')}</label>
                        <span className={`${styles.statusBadge} ${styles[`status-${order.status}`]}`}>
                            {t(`status.${order.status}`)}
                        </span>
                    </div>
                    <div>
                        <label>{t('paymentStatusLabel')}</label>
                        <span className={`${styles.statusBadge} ${styles[`payment-${order.paymentStatus}`]}`}>
                            {t(`paymentStatus.${order.paymentStatus}`)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className={styles.section}>
                <h2>{t('customer.title')}</h2>
                <div className={styles.infoGrid}>
                    <div>
                        <label>{t('customer.name')}</label>
                        <span>{order.customerName}</span>
                    </div>
                    <div>
                        <label>{t('customer.phone')}</label>
                        <span>{order.customerPhone}</span>
                    </div>
                    <div>
                        <label>{t('customer.email')}</label>
                        <span>{order.customerEmail}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className={styles.section}>
                <h2>{t('shipping.title')}</h2>
                <p>
                    {order.shippingAddressLine}
                    <br />
                    {order.shippingDistrict && `${order.shippingDistrict}, `}
                    {order.shippingCity}
                    {order.shippingPostalCode && `, ${order.shippingPostalCode}`}
                </p>
            </div>

            {/* Order Items */}
            <div className={styles.section}>
                <h2>{t('items.title')}</h2>
                <div className={styles.itemsTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>{t('items.product')}</th>
                                <th>{t('items.price')}</th>
                                <th>{t('items.quantity')}</th>
                                <th>{t('items.subtotal')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className={styles.itemName}>
                                            {item.productImageUrl && (
                                                <img
                                                    src={item.productImageUrl}
                                                    alt={item.productName}
                                                    className={styles.itemImage}
                                                />
                                            )}
                                            <span>{item.productName}</span>
                                        </div>
                                    </td>
                                    <td>{formatCurrency(item.unitPrice)} ₫</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.subtotal)} ₫</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Totals */}
            <div className={styles.section}>
                <h2>{t('totals.title')}</h2>
                <div className={styles.totals}>
                    <div className={styles.totalRow}>
                        <span>{t('totals.subtotal')}</span>
                        <span>{formatCurrency(order.subtotal)} ₫</span>
                    </div>
                    {order.shippingFee > 0 && (
                        <div className={styles.totalRow}>
                            <span>{t('totals.shipping')}</span>
                            <span>{formatCurrency(order.shippingFee)} ₫</span>
                        </div>
                    )}
                    {order.tax > 0 && (
                        <div className={styles.totalRow}>
                            <span>{t('totals.tax')}</span>
                            <span>{formatCurrency(order.tax)} ₫</span>
                        </div>
                    )}
                    {order.discount > 0 && (
                        <div className={styles.totalRow}>
                            <span>{t('totals.discount')}</span>
                            <span>-{formatCurrency(order.discount)} ₫</span>
                        </div>
                    )}
                    <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                        <strong>{t('totals.total')}</strong>
                        <strong className="text-accent">{formatCurrency(order.total)} ₫</strong>
                    </div>
                </div>
            </div>

            {/* Customer Note */}
            {order.customerNote && (
                <div className={styles.section}>
                    <h2>{t('customerNote.title')}</h2>
                    <p>{order.customerNote}</p>
                </div>
            )}

            {/* Deposit Reservation Info */}
            {order.orderType === 'deposit_reservation' && (
                <div className={styles.section}>
                    <h2>{t('deposit.title')}</h2>
                    <div className={styles.infoGrid}>
                        <div>
                            <label>{t('deposit.amount')}</label>
                            <strong className="text-accent">
                                {formatCurrency(order.depositAmountVnd || 0)} VND
                            </strong>
                        </div>
                        {order.depositDueAt && (
                            <div>
                                <label>{t('deposit.dueAt')}</label>
                                <span>{formatDate(order.depositDueAt)}</span>
                            </div>
                        )}
                        {order.depositReceivedAt && (
                            <div>
                                <label>{t('deposit.receivedAt')}</label>
                                <span className="text-success">{formatDate(order.depositReceivedAt)}</span>
                            </div>
                        )}
                        {order.remainingAmount && (
                            <div>
                                <label>{t('deposit.remaining')}</label>
                                <span>{formatCurrency(order.remainingAmount)} VND</span>
                            </div>
                        )}
                        {order.bankTransferMemo && (
                            <div>
                                <label>{t('deposit.transferMemo', { defaultValue: 'Transfer Memo' })}</label>
                                <code style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                                    {order.bankTransferMemo}
                                </code>
                            </div>
                        )}
                    </div>
                    
                    {/* Deposit Proof Section (for bank transfer) */}
                    {order.depositProof && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>
                                {t('deposit.proofTitle', { defaultValue: 'Transfer Proof' })}
                            </h3>
                            
                            {/* Proof Images */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {order.depositProof.imageUrls.map((url, index) => (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                                        <img 
                                            src={url} 
                                            alt={`Proof ${index + 1}`} 
                                            style={{ 
                                                width: '150px', 
                                                height: '150px', 
                                                objectFit: 'cover', 
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                cursor: 'pointer'
                                            }} 
                                        />
                                    </a>
                                ))}
                            </div>
                            
                            {/* Proof Status */}
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontWeight: '600', marginRight: '8px' }}>
                                    {t('deposit.proofStatus', { defaultValue: 'Status' })}:
                                </span>
                                <span className={`${styles.statusBadge} ${
                                    order.depositProof.status === 'approved' ? styles['status-deposited'] :
                                    order.depositProof.status === 'rejected' ? styles['status-cancelled'] :
                                    styles['status-pending']
                                }`}>
                                    {order.depositProof.status === 'pending' && t('deposit.proofPending', { defaultValue: 'Pending Review' })}
                                    {order.depositProof.status === 'approved' && t('deposit.proofApproved', { defaultValue: 'Approved' })}
                                    {order.depositProof.status === 'rejected' && t('deposit.proofRejected', { defaultValue: 'Rejected' })}
                                </span>
                            </div>
                            
                            {/* Submitted At */}
                            <div style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#666' }}>
                                {t('deposit.proofSubmittedAt', { defaultValue: 'Submitted' })}: {formatDate(order.depositProof.submittedAt)}
                            </div>
                            
                            {/* Review Note (if rejected) */}
                            {order.depositProof.status === 'rejected' && order.depositProof.reviewNote && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#fff8f0', borderLeft: '4px solid #c9a05f', borderRadius: '4px' }}>
                                    <strong>{t('deposit.rejectionNote', { defaultValue: 'Rejection Note' })}:</strong> {order.depositProof.reviewNote}
                                </div>
                            )}
                            
                            {/* Approve/Reject Buttons (only for pending) */}
                            {order.depositProof.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        disabled={depositActionPending}
                                        onClick={async () => {
                                            setDepositActionPending(true);
                                            setError(null);
                                            try {
                                                const response = await fetch(`/api/admin/orders/${order.orderNumber}/deposit-proof`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        action: 'approve',
                                                        proofId: order.depositProof?.id,
                                                    }),
                                                });
                                                const result = await response.json();
                                                if (!response.ok) {
                                                    throw new Error(result.error || 'Failed to approve');
                                                }
                                                setSuccess(true);
                                                router.refresh();
                                            } catch (err) {
                                                setError(err instanceof Error ? err.message : 'Failed to approve proof');
                                            } finally {
                                                setDepositActionPending(false);
                                            }
                                        }}
                                    >
                                        {t('deposit.approveProof', { defaultValue: 'Approve Deposit' })}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        disabled={depositActionPending}
                                        onClick={async () => {
                                            const rejectionNote = prompt(t('deposit.rejectPrompt', { defaultValue: 'Enter rejection reason (optional):' }));
                                            setDepositActionPending(true);
                                            setError(null);
                                            try {
                                                const response = await fetch(`/api/admin/orders/${order.orderNumber}/deposit-proof`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        action: 'reject',
                                                        proofId: order.depositProof?.id,
                                                        note: rejectionNote || undefined,
                                                    }),
                                                });
                                                const result = await response.json();
                                                if (!response.ok) {
                                                    throw new Error(result.error || 'Failed to reject');
                                                }
                                                setSuccess(true);
                                                router.refresh();
                                            } catch (err) {
                                                setError(err instanceof Error ? err.message : 'Failed to reject proof');
                                            } finally {
                                                setDepositActionPending(false);
                                            }
                                        }}
                                    >
                                        {t('deposit.rejectProof', { defaultValue: 'Reject Proof' })}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* No proof uploaded yet (for bank transfer) */}
                    {!order.depositProof && order.paymentStatus === 'deposit_pending' && (
                        <div style={{ marginTop: '24px', padding: '16px', background: '#fff8f0', borderRadius: '8px', border: '1px dashed #c9a05f' }}>
                            <p style={{ margin: 0, color: '#666' }}>
                                {t('deposit.noProofYet', { defaultValue: 'Customer has not uploaded transfer proof yet.' })}
                            </p>
                        </div>
                    )}
                    
                    {/* Deposit Actions */}
                    {order.paymentStatus === 'deposit_pending' && order.status !== 'expired' && order.status !== 'cancelled' && (
                        <div className={styles.depositActions} style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={depositActionPending}
                                onClick={async () => {
                                    setDepositActionPending(true);
                                    setError(null);
                                    setSuccess(false);
                                    try {
                                        await markDepositReceivedAction(order.orderNumber, note || undefined);
                                        setSuccess(true);
                                        // RevalidatePath in the action will handle the refresh
                                        router.refresh();
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : t('deposit.markReceivedError'));
                                    } finally {
                                        setDepositActionPending(false);
                                    }
                                }}
                            >
                                {t('deposit.markReceived')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning"
                                disabled={depositActionPending}
                                onClick={async () => {
                                    if (!confirm(t('deposit.expireConfirm'))) return;
                                    setDepositActionPending(true);
                                    setError(null);
                                    setSuccess(false);
                                    try {
                                        await expireReservationAction(order.orderNumber, note || undefined);
                                        setSuccess(true);
                                        setTimeout(() => {
                                            router.refresh();
                                        }, 1000);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : t('deposit.expireError'));
                                    } finally {
                                        setDepositActionPending(false);
                                    }
                                }}
                            >
                                {t('deposit.expire')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                disabled={depositActionPending}
                                onClick={async () => {
                                    if (!confirm(t('deposit.cancelConfirm'))) return;
                                    setDepositActionPending(true);
                                    setError(null);
                                    setSuccess(false);
                                    try {
                                        await cancelReservationAction(order.orderNumber, note || undefined);
                                        setSuccess(true);
                                        setTimeout(() => {
                                            router.refresh();
                                        }, 1000);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : t('deposit.cancelError'));
                                    } finally {
                                        setDepositActionPending(false);
                                    }
                                }}
                            >
                                {t('deposit.cancel')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Refund Section */}
            {(order.paymentStatus === 'paid' || order.paymentStatus === 'deposited' || order.paymentStatus === 'partially_refunded') && (
                <div className={styles.section}>
                    <h2>{t('refund.title')}</h2>
                    <div className={styles.infoGrid}>
                        <div>
                            <label>{t('refund.paidAmount')}</label>
                            <strong>{formatCurrency(order.orderType === 'deposit_reservation' ? (order.depositAmountVnd || 0) : order.total)} ₫</strong>
                        </div>
                        {order.adminNote && (() => {
                            try {
                                const metadata = JSON.parse(order.adminNote);
                                const refunds = metadata.stripe_refunds;
                                if (refunds) {
                                    const refunded = refunds.total_refunded_amount || 0;
                                    const paid = order.orderType === 'deposit_reservation' ? (order.depositAmountVnd || 0) : order.total;
                                    const remaining = paid - refunded;
                                    return (
                                        <>
                                            <div>
                                                <label>{t('refund.refundedAmount')}</label>
                                                <span>{formatCurrency(refunded)} ₫</span>
                                            </div>
                                            <div>
                                                <label>{t('refund.remainingRefundable')}</label>
                                                <strong className="text-accent">{formatCurrency(remaining)} ₫</strong>
                                            </div>
                                            {refunds.last_refund_id && (
                                                <div>
                                                    <label>{t('refund.lastRefundId')}</label>
                                                    <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{refunds.last_refund_id}</span>
                                                </div>
                                            )}
                                        </>
                                    );
                                }
                            } catch {}
                            return null;
                        })()}
                    </div>
                    <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => setShowRefundModal(true)}
                        disabled={refundPending}
                        style={{ marginTop: '20px' }}
                    >
                        {order.paymentStatus === 'partially_refunded' ? t('refund.buttonPartial') : t('refund.button')}
                    </button>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <div className={styles.modalOverlay} onClick={() => !refundPending && setShowRefundModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>{order.paymentStatus === 'partially_refunded' ? t('refund.modalTitlePartial') : t('refund.modalTitle')}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setError(null);
                            setSuccess(false);
                            setRefundPending(true);
                            try {
                                const paid = order.orderType === 'deposit_reservation' ? (order.depositAmountVnd || 0) : order.total;
                                const metadata = order.adminNote ? (() => {
                                    try {
                                        return JSON.parse(order.adminNote);
                                    } catch {
                                        return {};
                                    }
                                })() : {};
                                const alreadyRefunded = metadata.stripe_refunds?.total_refunded_amount || 0;
                                const remaining = paid - alreadyRefunded;
                                const amount = refundAmount ? parseInt(refundAmount) : remaining;
                                
                                const response = await fetch(`/api/admin/orders/${order.orderNumber}/refund`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        amount,
                                        reason: refundReason || undefined,
                                        restock: refundRestock,
                                        note: refundNote || undefined,
                                    }),
                                });
                                
                                const data = await response.json();
                                if (!response.ok) {
                                    throw new Error(data.error || t('refund.error'));
                                }
                                
                                setSuccess(true);
                                setTimeout(() => {
                                    router.refresh();
                                    setShowRefundModal(false);
                                }, 2000);
                            } catch (err) {
                                setError(err instanceof Error ? err.message : t('refund.error'));
                            } finally {
                                setRefundPending(false);
                            }
                        }}>
                            <div className={styles.formGroup}>
                                <label>{t('refund.amount')}</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder={t('refund.amountPlaceholder')}
                                    disabled={refundPending}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('refund.reason')}</label>
                                <select
                                    className="input"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    disabled={refundPending}
                                >
                                    <option value="">{t('refund.reasonPlaceholder')}</option>
                                    <option value="requested_by_customer">{t('refund.reasonRequestedByCustomer')}</option>
                                    <option value="duplicate">{t('refund.reasonDuplicate')}</option>
                                    <option value="fraudulent">{t('refund.reasonFraudulent')}</option>
                                    <option value="other">{t('refund.reasonOther')}</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={refundRestock}
                                        onChange={(e) => setRefundRestock(e.target.checked)}
                                        disabled={refundPending}
                                    />
                                    {' '}
                                    {t('refund.restock')}
                                </label>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {t('refund.restockDescription')}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('refund.note')}</label>
                                <textarea
                                    className="input"
                                    value={refundNote}
                                    onChange={(e) => setRefundNote(e.target.value)}
                                    placeholder={t('refund.notePlaceholder')}
                                    rows={3}
                                    disabled={refundPending}
                                />
                            </div>
                            {error && <div className={styles.error}>{error}</div>}
                            {success && <div className={styles.success}>{t('refund.success')}</div>}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-warning"
                                    disabled={refundPending}
                                >
                                    {refundPending ? t('refund.submitting') : t('refund.submit')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowRefundModal(false)}
                                    disabled={refundPending}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Update */}
            <div className={styles.section}>
                <h2>{t('statusUpdate.title')}</h2>
                <form onSubmit={handleStatusUpdate} className={styles.statusForm}>
                    <div className={styles.formGroup}>
                        <label>{t('statusUpdate.newStatus')}</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                            className="input"
                            disabled={isPending}
                        >
                            <option value="pending">{t('status.pending')}</option>
                            <option value="confirmed">{t('status.confirmed')}</option>
                            <option value="deposited">{t('status.deposited')}</option>
                            <option value="processing">{t('status.processing')}</option>
                            <option value="shipped">{t('status.shipped')}</option>
                            <option value="delivered">{t('status.delivered')}</option>
                            <option value="cancelled">{t('status.cancelled')}</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('statusUpdate.note')} ({t('statusUpdate.noteOptional')})</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="input"
                            rows={3}
                            disabled={isPending}
                            placeholder={t('statusUpdate.notePlaceholder')}
                        />
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{t('statusUpdate.success')}</div>}
                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                        {isPending ? t('statusUpdate.saving') : t('statusUpdate.update')}
                    </button>
                </form>
            </div>

            {/* Email Status */}
            {order.emailStatuses.length > 0 && (
                <div className={styles.section}>
                    <h2>{t('emailStatus.title')}</h2>
                    <div className={styles.infoGrid}>
                        {order.emailStatuses
                            .filter((email) => email.type === 'order_confirmation')
                            .map((email, index) => (
                                <div key={`confirmation-${index}`}>
                                    <label>{t('emailStatus.confirmation')}</label>
                                    <span className={`${styles.statusBadge} ${styles[`email-${email.status}`]}`}>
                                        {t(`emailStatus.status.${email.status}`)}
                                    </span>
                                    {email.errorMessage && (
                                        <div className={styles.error} style={{ marginTop: '8px', fontSize: '12px' }}>
                                            {email.errorMessage}
                                        </div>
                                    )}
                                </div>
                            ))}
                        {order.emailStatuses
                            .filter((email) => email.type === 'status_update')
                            .slice(0, 1)
                            .map((email, index) => (
                                <div key={`status-update-${index}`}>
                                    <label>{t('emailStatus.lastStatusUpdate')}</label>
                                    <span className={`${styles.statusBadge} ${styles[`email-${email.status}`]}`}>
                                        {t(`emailStatus.status.${email.status}`)}
                                    </span>
                                    {email.metadataStatus && (
                                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                                            ({t(`status.${email.metadataStatus}`)})
                                        </span>
                                    )}
                                    {email.errorMessage && (
                                        <div className={styles.error} style={{ marginTop: '8px', fontSize: '12px' }}>
                                            {email.errorMessage}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Status History */}
            {order.statusHistory.length > 0 && (
                <div className={styles.section}>
                    <h2>{t('statusHistory.title')}</h2>
                    <div className={styles.historyTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('statusHistory.date')}</th>
                                    <th>{t('statusHistory.from')}</th>
                                    <th>{t('statusHistory.to')}</th>
                                    <th>{t('statusHistory.note')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.statusHistory.map((history) => (
                                    <tr key={history.id}>
                                        <td>{formatDate(history.createdAt)}</td>
                                        <td>
                                            {history.fromStatus ? (
                                                <span className={`${styles.statusBadge} ${styles[`status-${history.fromStatus}`]}`}>
                                                    {t(`status.${history.fromStatus}`)}
                                                </span>
                                            ) : (
                                                <span className={styles.statusBadge}>{t('statusHistory.initial')}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`status-${history.toStatus}`]}`}>
                                                {t(`status.${history.toStatus}`)}
                                            </span>
                                        </td>
                                        <td>{history.note || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

