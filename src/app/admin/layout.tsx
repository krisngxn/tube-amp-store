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
    const user = await getAdminUser();
    
    // Use default locale (vi) for admin translations
    const locale = 'vi';
    const messages = await getMessages({ locale });

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="admin-layout">
                {user && <AdminNav />}
                <main className="admin-main">{children}</main>
            </div>
        </NextIntlClientProvider>
    );
}
