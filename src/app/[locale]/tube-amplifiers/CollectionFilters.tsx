'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

export default function CollectionFilters() {
    const t = useTranslations('collection');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearAllFilters = () => {
        router.push(pathname);
    };

    const isFilterActive = () => {
        return searchParams.toString().length > 0;
    };

    return (
        <aside className="filters-sidebar bg-secondary border border-subtle rounded-lg p-8 sticky top-24 h-fit">
            <div className="filters-header flex justify-between items-center mb-6">
                <h3 className="text-lg m-0">{t('filters.title')}</h3>
                {isFilterActive() && (
                    <button
                        onClick={clearAllFilters}
                        className="btn btn-ghost text-sm"
                    >
                        {t('filters.clear')}
                    </button>
                )}
            </div>

            {/* Topology Filter */}
            <div className="filter-group flex flex-col gap-2 mb-6">
                <h4 className="filter-label text-sm font-semibold text-secondary mb-1">
                    {t('filters.topology.label')}
                </h4>
                <label className="checkbox-label flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-accent">
                    <input
                        type="checkbox"
                        checked={searchParams.get('topology') === 'se'}
                        onChange={(e) => updateFilters('topology', e.target.checked ? 'se' : null)}
                    />
                    <span>{t('filters.topology.options.se')}</span>
                </label>
                <label className="checkbox-label flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-accent">
                    <input
                        type="checkbox"
                        checked={searchParams.get('topology') === 'pp'}
                        onChange={(e) => updateFilters('topology', e.target.checked ? 'pp' : null)}
                    />
                    <span>{t('filters.topology.options.pp')}</span>
                </label>
            </div>

            <div className="divider"></div>

            {/* Tube Type Filter */}
            <div className="filter-group flex flex-col gap-2 mb-6">
                <h4 className="filter-label text-sm font-semibold text-secondary mb-1">
                    {t('filters.tubeType.label')}
                </h4>
                {['300B', '2A3', 'EL34', 'KT88', 'KT66', '6L6', 'EL84', '6V6'].map((tube) => (
                    <label key={tube} className="checkbox-label flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-accent">
                        <input
                            type="checkbox"
                            checked={searchParams.get('tube') === tube}
                            onChange={(e) => updateFilters('tube', e.target.checked ? tube : null)}
                        />
                        <span>{tube}</span>
                    </label>
                ))}
            </div>

            <div className="divider"></div>

            {/* Condition Filter */}
            <div className="filter-group flex flex-col gap-2 mb-6">
                <h4 className="filter-label text-sm font-semibold text-secondary mb-1">
                    {t('filters.condition.label')}
                </h4>
                {[
                    { value: 'new', label: t('filters.condition.options.new') },
                    { value: 'like_new', label: t('filters.condition.options.likeNew') },
                    { value: 'vintage', label: t('filters.condition.options.vintage') },
                ].map(({ value, label }) => (
                    <label key={value} className="checkbox-label flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-accent">
                        <input
                            type="checkbox"
                            checked={searchParams.get('condition') === value}
                            onChange={(e) => updateFilters('condition', e.target.checked ? value : null)}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>

            <div className="divider"></div>

            {/* Price Range Filter */}
            <div className="filter-group flex flex-col gap-2 mb-6">
                <h4 className="filter-label text-sm font-semibold text-secondary mb-1">
                    {t('filters.price.label')}
                </h4>
                <input
                    type="number"
                    className="input"
                    placeholder={t('filters.price.min')}
                    defaultValue={searchParams.get('priceMin') || ''}
                    onBlur={(e) => updateFilters('priceMin', e.target.value || null)}
                />
                <input
                    type="number"
                    className="input"
                    placeholder={t('filters.price.max')}
                    defaultValue={searchParams.get('priceMax') || ''}
                    onBlur={(e) => updateFilters('priceMax', e.target.value || null)}
                />
            </div>
        </aside>
    );
}
