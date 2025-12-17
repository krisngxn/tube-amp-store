'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

interface OrdersFiltersProps {
    searchParams: {
        q?: string;
        status?: string;
        payment?: string;
    };
}

export default function OrdersFilters({ searchParams }: OrdersFiltersProps) {
    const t = useTranslations('admin.orders.list');
    const router = useRouter();
    const searchParamsObj = useSearchParams();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParamsObj.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 when filtering
        router.push(`/admin/orders?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('q') as string;
        handleFilterChange('q', query);
    };

    return (
        <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                    type="text"
                    name="q"
                    className="input"
                    placeholder={t('searchPlaceholder')}
                    defaultValue={searchParams.q}
                />
                <button type="submit" className="btn btn-primary">
                    {t('search')}
                </button>
            </form>

            <div className={styles.filterGroup}>
                <label className="label">{t('status')}</label>
                <select
                    className="input"
                    value={searchParams.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="all">{t('statusAll')}</option>
                    <option value="pending">{t('statusPending')}</option>
                    <option value="confirmed">{t('statusConfirmed')}</option>
                    <option value="deposited">{t('statusDeposited')}</option>
                    <option value="processing">{t('statusProcessing')}</option>
                    <option value="shipped">{t('statusShipped')}</option>
                    <option value="delivered">{t('statusDelivered')}</option>
                    <option value="cancelled">{t('statusCancelled')}</option>
                    <option value="refunded">{t('statusRefunded')}</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label className="label">{t('paymentStatus')}</label>
                <select
                    className="input"
                    value={searchParams.payment || 'all'}
                    onChange={(e) => handleFilterChange('payment', e.target.value)}
                >
                    <option value="all">{t('paymentStatusAll')}</option>
                    <option value="pending">{t('paymentStatusPending')}</option>
                    <option value="deposit_pending">{t('paymentStatusDepositPending')}</option>
                    <option value="deposited">{t('paymentStatusDeposited')}</option>
                    <option value="paid">{t('paymentStatusPaid')}</option>
                    <option value="failed">{t('paymentStatusFailed')}</option>
                    <option value="refund_pending">{t('paymentStatusRefundPending')}</option>
                    <option value="partially_refunded">{t('paymentStatusPartiallyRefunded')}</option>
                    <option value="refunded">{t('paymentStatusRefunded')}</option>
                </select>
            </div>
        </div>
    );
}

