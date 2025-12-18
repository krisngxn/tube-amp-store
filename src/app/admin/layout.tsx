import { getAdminUser } from '@/lib/admin/auth';
import AdminNav from './AdminNav';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is admin (don't redirect here - let pages handle it)
    let user;
    try {
        user = await getAdminUser();
    } catch (error: any) {
        // Log the error with full details to identify 404 source
        console.error('[AdminLayout] Error getting admin user:', {
            error,
            message: error?.message,
            code: error?.code,
            details: error?.details,
            stack: error?.stack,
        });
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
