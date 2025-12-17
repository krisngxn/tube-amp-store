'use client';

import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locales, type Locale, defaultLocale } from '@/config/locales';
import styles from './LocaleSwitcher.module.css';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export default function LocaleSwitcher() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);

    useEffect(() => {
        // Get locale from cookie on mount
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
            ?.split('=')[1] as Locale | undefined;
        
        if (cookieLocale && locales.includes(cookieLocale)) {
            setCurrentLocale(cookieLocale);
        }
    }, []);

    function onSelectChange(nextLocale: Locale) {
        // Set cookie
        document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        
        setCurrentLocale(nextLocale);
        
        // Reload page to apply new locale
        startTransition(() => {
            router.refresh();
        });
    }

    return (
        <div className={styles.localeSwitcher}>
            <select
                value={currentLocale}
                onChange={(e) => onSelectChange(e.target.value as Locale)}
                disabled={isPending}
                className={styles.localeSelect}
                aria-label="Select language"
            >
                {locales.map((locale) => (
                    <option key={locale} value={locale}>
                        {locale === 'vi' ? 'VI' : 'EN'}
                    </option>
                ))}
            </select>
        </div>
    );
}
