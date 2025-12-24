import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/user';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import styles from './page.module.css';

export default async function AccountOrdersPage() {
    await requireAuth();
    const t = await getTranslations('account.orders');
    const tTracking = await getTranslations('tracking');
    const tCommon = await getTranslations('common');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // requireAuth should have redirected
    }

    // Fetch user's orders
    const serviceSupabase = createServiceClient();
    const { data: orders, error } = await serviceSupabase
        .from('orders')
        .select('id, order_number, status, payment_status, total, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className={styles.ordersPage}>
            <h2>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>

            {!orders || orders.length === 0 ? (
                <EmptyState
                    title={t('empty.title')}
                    description={t('empty.description')}
                    action={{
                        label: t('empty.action'),
                        href: '/tube-amplifiers',
                    }}
                />
            ) : (
                <div className={styles.ordersList}>
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/account/orders/${order.order_number}`}
                            className={styles.orderCard}
                        >
                            <div className={styles.orderHeader}>
                                <div>
                                    <h3 className={styles.orderCode}>
                                        {t('orderCode')}: {order.order_number}
                                    </h3>
                                    <p className={styles.orderDate}>
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className={styles.orderStatus}>
                                    <StatusBadge 
                                        status={order.status} 
                                        type="order" 
                                        label={tTracking(`status.${order.status}`, { defaultValue: order.status })}
                                    />
                                    {order.payment_status && order.payment_status !== order.status && (
                                        <StatusBadge 
                                            status={order.payment_status} 
                                            type="payment" 
                                            label={tTracking(`paymentStatus.${order.payment_status}`, { defaultValue: order.payment_status })}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.orderTotal}>
                                <span className={styles.totalLabel}>{t('total')}:</span>
                                <span className={styles.totalAmount}>
                                    {formatCurrency(Number(order.total))} {tCommon('currency')}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

