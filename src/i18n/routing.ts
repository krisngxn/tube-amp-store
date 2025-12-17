import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '../config/locales';

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: 'never' // No automatic prefix, we handle it manually in middleware
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
