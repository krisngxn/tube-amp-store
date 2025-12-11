'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, type Locale } from '@/config/locales';

export default function LocaleSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isPending, startTransition] = useTransition();

    const currentLocale = params.locale as Locale;

    function onSelectChange(nextLocale: Locale) {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className="locale-switcher">
            <select
                value={currentLocale}
                onChange={(e) => onSelectChange(e.target.value as Locale)}
                disabled={isPending}
                className="locale-select"
                aria-label="Select language"
            >
                {locales.map((locale) => (
                    <option key={locale} value={locale}>
                        {locale === 'vi' ? 'VI' : 'EN'}
                    </option>
                ))}
            </select>

            <style jsx>{`
        .locale-switcher {
          position: relative;
        }

        .locale-select {
          appearance: none;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          padding: var(--space-sm) var(--space-lg) var(--space-sm) var(--space-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23a8a8a8' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right var(--space-sm) center;
        }

        .locale-select:hover {
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .locale-select:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        .locale-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
