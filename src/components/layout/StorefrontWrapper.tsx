'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

/**
 * Conditionally renders Header and Footer for storefront pages only
 * Admin pages are excluded
 */
export default function StorefrontWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.includes('/admin') || false;

    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <div className="app-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
        </div>
    );
}

