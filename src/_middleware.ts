import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { locales, defaultLocale, type Locale } from './config/locales';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, admin routes, static files, and Next.js internals
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/_vercel') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check if pathname starts with a locale
    const pathnameLocale = locales.find(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    // If pathname has locale prefix, strip it and set locale header
    if (pathnameLocale) {
        const pathnameWithoutLocale = pathname === `/${pathnameLocale}`
            ? '/'
            : pathname.slice(`/${pathnameLocale}`.length);
        
        const response = NextResponse.rewrite(
            new URL(pathnameWithoutLocale, request.url)
        );
        
        // Set locale cookie and header
        response.cookies.set(LOCALE_COOKIE_NAME, pathnameLocale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
        });
        response.headers.set('x-locale', pathnameLocale);
        
        return response;
    }

    // For root path and paths without locale prefix, detect locale from cookie/header
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const locale = (cookieLocale && locales.includes(cookieLocale as Locale))
        ? (cookieLocale as Locale)
        : defaultLocale;

    // Set locale cookie if not present
    const response = NextResponse.next();
    if (!cookieLocale || !locales.includes(cookieLocale as Locale)) {
        response.cookies.set(LOCALE_COOKIE_NAME, locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
        });
    }
    
    // Set locale header for server components
    response.headers.set('x-locale', locale);

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`, or `/admin`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)']
};
