import { getAdminUser } from '@/lib/admin/auth';
import AdminNav from './AdminNav';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

// Admin layout uses Supabase cookies and next-intl, so it must be dynamic
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is admin (don't redirect here - let pages handle it)
    // Wrap in try-catch to prevent layout from crashing on 404
    let user;
    try {
        user = await getAdminUser();
    } catch (error: any) {
        // Log the error with full details to identify 404 source
        const is404 = error?.code === 'NOT_FOUND' || error?.message?.includes('404') || error?.message?.includes('NOT_FOUND');
        
        if (is404) {
            console.error('[🔴 AdminLayout] 404 Error getting admin user:', {
                error,
                message: error?.message,
                code: error?.code,
                details: error?.details,
                hint: error?.hint,
            });
        } else {
            console.error('[AdminLayout] Error getting admin user:', {
                error,
                message: error?.message,
                code: error?.code,
            });
        }
        user = null;
    }
    
    // Use default locale (vi) for admin translations
    const locale = 'vi';
    let messages;
    try {
        messages = await getMessages({ locale });
    } catch (error: any) {
        console.error('[AdminLayout] Error loading admin messages:', {
            error,
            message: error?.message,
            code: error?.code,
        });
        messages = {};
    }

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="admin-layout">
                {user && <AdminNav />}
                <main className="admin-main">{children}</main>
            </div>
        </NextIntlClientProvider>
    );
}
