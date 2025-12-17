import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { adminListOrders, type OrderStatus, type PaymentStatus } from '@/lib/repositories/admin/orders';
import OrdersFilters from './OrdersFilters';
import styles from './page.module.css';

interface OrdersListProps {
    searchParams: {
        q?: string;
        status?: string;
        payment?: string;
        page?: string;
        sort?: string;
    };
}

export default async function OrdersList({ searchParams }: OrdersListProps) {
    const t = await getTranslations({ locale: 'vi', namespace: 'admin' });

    const page = Number(searchParams.page) || 1;
    const pageSize = 20;

    const result = await adminListOrders({
        filters: {
            q: searchParams.q,
            status: (searchParams.status as OrderStatus) || 'all',
            paymentStatus: (searchParams.payment as PaymentStatus) || 'all',
        },
        sort: {
            field: 'created_at',
            direction: 'desc',
        },
        pagination: { page, pageSize },
    });

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

    return (
        <div className={styles.ordersList}>
            <OrdersFilters searchParams={searchParams} />

            {result.items.length === 0 ? (
                <div className={styles.empty}>{t('orders.list.empty')}</div>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t('orders.list.orderCode')}</th>
                                    <th>{t('orders.list.dateTime')}</th>
                                    <th>{t('orders.list.customer')}</th>
                                    <th>{t('orders.list.total')}</th>
                                    <th>{t('orders.list.status')}</th>
                                    <th>{t('orders.list.paymentStatus')}</th>
                                    <th>{t('orders.list.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.items.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>{order.orderNumber}</strong>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div>{order.customerName}</div>
                                            <div className={styles.customerPhone}>{order.customerPhone}</div>
                                        </td>
                                        <td>{formatCurrency(order.total)} ₫</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`status-${order.status}`]}`}>
                                                {t(`orders.status.${order.status}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`payment-${order.paymentStatus}`]}`}>
                                                {t(`orders.paymentStatus.${order.paymentStatus}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/orders/${order.orderNumber}`}
                                                className="btn btn-sm btn-ghost"
                                            >
                                                {t('orders.view')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {result.totalPages > 1 && (
                        <div className={styles.pagination}>
                            {page > 1 && (
                                <Link
                                    href={`/admin/orders?${new URLSearchParams({
                                        ...searchParams,
                                        page: String(page - 1),
                                    })}`}
                                    className="btn btn-ghost"
                                >
                                    {t('pagination.previous')}
                                </Link>
                            )}
                            <span className={styles.pageInfo}>
                                {t('pagination.page', { current: page, total: result.totalPages })}
                            </span>
                            {page < result.totalPages && (
                                <Link
                                    href={`/admin/orders?${new URLSearchParams({
                                        ...searchParams,
                                        page: String(page + 1),
                                    })}`}
                                    className="btn btn-ghost"
                                >
                                    {t('pagination.next')}
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

