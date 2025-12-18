import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '../config/locales';

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: 'never' // No automatic prefix, locale handled in i18n/request.ts
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
