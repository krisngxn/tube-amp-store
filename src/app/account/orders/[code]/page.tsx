import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/user';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './page.module.css';

interface AccountOrderDetailPageProps {
    params: Promise<{ code: string }>;
}

export default async function AccountOrderDetailPage({ params }: AccountOrderDetailPageProps) {
    await requireAuth();
    const { code } = await params;
    const t = await getTranslations('account.orders');
    const tTracking = await getTranslations('tracking');
    const tCommon = await getTranslations('common');
    const locale = await getTranslations({ locale: 'en' });
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // requireAuth should have redirected
    }

    // Fetch order - must belong to current user
    const serviceSupabase = createServiceClient();
    const { data: order, error } = await serviceSupabase
        .from('orders')
        .select(
            `
            id,
            order_number,
            created_at,
            status,
            payment_status,
            order_type,
            is_deposit_order,
            deposit_amount_vnd,
            deposit_due_at,
            deposit_received_at,
            remaining_amount,
            payment_method,
            subtotal,
            shipping_fee,
            tax,
            discount,
            total,
            order_items (
                id,
                product_name,
                product_slug,
                product_image_url,
                unit_price,
                quantity,
                subtotal
            ),
            order_status_history (
                id,
                from_status,
                to_status,
                note,
                changed_by,
                created_at
            )
        `
        )
        .eq('order_number', code)
        .eq('user_id', user.id) // Enforce ownership
        .single();

    if (error || !order) {
        notFound();
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusLabel = (status: string) => {
        return tTracking(`status.${status}`, { defaultValue: status });
    };

    const getPaymentStatusLabel = (status: string) => {
        return tTracking(`paymentStatus.${status}`, { defaultValue: status });
    };

    return (
        <div className={styles.orderDetailPage}>
            <div className={styles.orderHeader}>
                <div>
                    <h1>{t('orderCode')}: {order.order_number}</h1>
                    <p className={styles.orderDate}>
                        {tTracking('order.createdAt')}: {formatDate(order.created_at)}
                    </p>
                </div>
                <div className={styles.statusBadges}>
                    <StatusBadge 
                        status={order.status} 
                        type="order" 
                        label={getStatusLabel(order.status)}
                    />
                    {order.payment_status && order.payment_status !== order.status && (
                        <StatusBadge 
                            status={order.payment_status} 
                            type="payment" 
                            label={getPaymentStatusLabel(order.payment_status)}
                        />
                    )}
                </div>
            </div>

            {/* Status Timeline */}
            {order.order_status_history && order.order_status_history.length > 0 && (
                <div className={styles.statusTimeline}>
                    <h2>{tTracking('order.timeline')}</h2>
                    <div className={styles.timeline}>
                        {order.order_status_history
                            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((history: any) => (
                                <div key={history.id} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineStatus}>
                                            {history.from_status ? (
                                                <>
                                                    {getStatusLabel(history.from_status)} → {getStatusLabel(history.to_status)}
                                                </>
                                            ) : (
                                                getStatusLabel(history.to_status)
                                            )}
                                        </div>
                                        <div className={styles.timelineDate}>
                                            {formatDate(history.created_at)}
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
                <h2>{tTracking('order.items')}</h2>
                <div className={styles.itemsList}>
                    {order.order_items?.map((item: any) => (
                        <div key={item.id} className={styles.orderItem}>
                            {item.product_image_url && (
                                <img
                                    src={item.product_image_url}
                                    alt={item.product_name}
                                    className={styles.itemImage}
                                />
                            )}
                            <div className={styles.itemInfo}>
                                <h3>
                                    {item.product_slug ? (
                                        <a href={`/product/${item.product_slug}`} className={styles.productLink}>
                                            {item.product_name}
                                        </a>
                                    ) : (
                                        item.product_name
                                    )}
                                </h3>
                                <p>
                                    {tCommon('quantity')}: {item.quantity} × {formatCurrency(item.unit_price)} {tCommon('currency')}
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
                <h2>{tTracking('order.totals')}</h2>
                <div className={styles.totalsList}>
                    <div className={styles.totalRow}>
                        <span>{tTracking('order.subtotal')}</span>
                        <span>{formatCurrency(Number(order.subtotal))} {tCommon('currency')}</span>
                    </div>
                    {Number(order.shipping_fee) > 0 && (
                        <div className={styles.totalRow}>
                            <span>{tTracking('order.shipping')}</span>
                            <span>{formatCurrency(Number(order.shipping_fee))} {tCommon('currency')}</span>
                        </div>
                    )}
                    {Number(order.tax) > 0 && (
                        <div className={styles.totalRow}>
                            <span>{tTracking('order.tax')}</span>
                            <span>{formatCurrency(Number(order.tax))} {tCommon('currency')}</span>
                        </div>
                    )}
                    {Number(order.discount) > 0 && (
                        <div className={styles.totalRow}>
                            <span>{tTracking('order.discount')}</span>
                            <span>-{formatCurrency(Number(order.discount))} {tCommon('currency')}</span>
                        </div>
                    )}
                    {order.order_type === 'deposit_reservation' && order.deposit_amount_vnd && (
                        <>
                            <div className={`${styles.totalRow} ${styles.depositRow}`}>
                                <span>{tTracking('order.depositAmount')}</span>
                                <span className="text-accent">
                                    {formatCurrency(Number(order.deposit_amount_vnd))} {tCommon('currency')}
                                </span>
                            </div>
                            {order.remaining_amount && (
                                <div className={styles.totalRow}>
                                    <span>{tTracking('order.remainingBalance')}</span>
                                    <span>{formatCurrency(Number(order.remaining_amount))} {tCommon('currency')}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                        <strong>
                            {order.order_type === 'deposit_reservation' && order.deposit_amount_vnd
                                ? tTracking('order.depositDue')
                                : tTracking('order.total')}
                        </strong>
                        <strong className="text-accent">
                            {order.order_type === 'deposit_reservation' && order.deposit_amount_vnd
                                ? `${formatCurrency(Number(order.deposit_amount_vnd))} ${tCommon('currency')}`
                                : `${formatCurrency(Number(order.total))} ${tCommon('currency')}`}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            <div className={styles.paymentSection}>
                <h2>{tTracking('order.paymentStatus')}</h2>
                <p>
                    <strong>{getPaymentStatusLabel(order.payment_status)}</strong>
                </p>
                <p className={styles.paymentMethod}>
                    {tTracking('order.paymentMethod')}: {order.payment_method === 'cod' ? tTracking('order.paymentCod') : tTracking('order.paymentBank')}
                </p>
            </div>
        </div>
    );
}

