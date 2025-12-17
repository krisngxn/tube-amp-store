'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

interface ProductsFiltersProps {
    searchParams: {
        q?: string;
        status?: string;
        condition?: string;
        topology?: string;
    };
}

export default function ProductsFilters({ searchParams }: ProductsFiltersProps) {
    const t = useTranslations('admin.products.list');
    const router = useRouter();
    const searchParamsObj = useSearchParams();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParamsObj.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 when filtering
        router.push(`/admin/products?${params.toString()}`);
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
                    {t('search') || 'Search'}
                </button>
            </form>

            <div className={styles.filterGroup}>
                <label className="label">{t('status')}</label>
                <select
                    className="input"
                    value={searchParams.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">{t('statusAll')}</option>
                    <option value="published">{t('published')}</option>
                    <option value="draft">{t('draft')}</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label className="label">{t('condition')}</label>
                <select
                    className="input"
                    value={searchParams.condition || ''}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                    <option value="">{t('conditionAll')}</option>
                    <option value="new">{t('conditionNew')}</option>
                    <option value="like_new">{t('conditionLikeNew')}</option>
                    <option value="vintage">{t('conditionVintage')}</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label className="label">{t('topology')}</label>
                <select
                    className="input"
                    value={searchParams.topology || ''}
                    onChange={(e) => handleFilterChange('topology', e.target.value)}
                >
                    <option value="">{t('topologyAll')}</option>
                    <option value="se">SE</option>
                    <option value="pp">PP</option>
                </select>
            </div>
        </div>
    );
}
