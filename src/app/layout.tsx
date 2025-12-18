// Import polyfills first
import '@/lib/polyfills';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import StorefrontWrapper from '@/components/layout/StorefrontWrapper';
import { defaultLocale } from '@/config/locales';
import { GlobalErrorHandler } from './error-handler';
import './globals.css';

// This app uses cookies, headers and next-intl in Server Components.
// Force dynamic rendering globally to avoid DYNAMIC_SERVER_USAGE errors.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let locale: string;
    let messages: any;

    try {
        locale = await getLocale();
        messages = await getMessages();
    } catch (error: any) {
        // Log detailed error to identify 404 source
        console.error('[RootLayout] Error loading locale/messages:', {
            error,
            message: error?.message,
            code: error?.code,
            details: error?.details,
            stack: error?.stack,
        });
        // Fallback to default locale if there's an error
        locale = defaultLocale;
        try {
            const defaultMessages = await import(`../../messages/${defaultLocale}/common.json`);
            messages = { common: defaultMessages.default };
        } catch (fallbackError: any) {
            console.error('[RootLayout] Error loading fallback messages:', {
                error: fallbackError,
                message: fallbackError?.message,
            });
            messages = {};
        }
    }

    return (
        <html lang={locale}>
            <body>
                <GlobalErrorHandler />
                <NextIntlClientProvider messages={messages}>
                    <StorefrontWrapper>{children}</StorefrontWrapper>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
