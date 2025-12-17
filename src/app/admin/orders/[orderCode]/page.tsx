import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin/auth';
import { adminGetOrderByCode } from '@/lib/repositories/admin/orders';
import OrderDetailContent from './OrderDetailContent';
import styles from './page.module.css';

interface AdminOrderDetailPageProps {
    params: Promise<{ orderCode: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
    await requireAdmin();
    const { orderCode } = await params;
    const t = await getTranslations({ locale: 'vi', namespace: 'admin' });

    const order = await adminGetOrderByCode(orderCode);

    if (!order) {
        notFound();
    }

    return (
        <div className={styles.orderDetailPage}>
            <div className={styles.header}>
                <h1>
                    {t('orders.detail.title')} {order.orderNumber}
                </h1>
            </div>

            <OrderDetailContent order={order} />
        </div>
    );
}

