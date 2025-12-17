import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin/auth';
import OrdersList from './OrdersList';
import styles from './page.module.css';

interface AdminOrdersPageProps {
    searchParams: Promise<{
        q?: string;
        status?: string;
        payment?: string;
        page?: string;
        sort?: string;
    }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
    await requireAdmin();
    const t = await getTranslations({ locale: 'vi', namespace: 'admin' });

    const searchParamsResolved = await searchParams;

    return (
        <div className={styles.ordersPage}>
            <div className={styles.header}>
                <h1>{t('orders.title')}</h1>
            </div>

            <Suspense fallback={<div>{t('loading')}</div>}>
                <OrdersList searchParams={searchParamsResolved} />
            </Suspense>
        </div>
    );
}

