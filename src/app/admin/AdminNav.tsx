'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import styles from './AdminNav.module.css';

export default function AdminNav() {
    const t = useTranslations('admin');
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <nav className={styles.adminNav}>
            <div className={styles.navContainer}>
                <div className={styles.navBrand}>
                    <Link href="/admin/products">{t('title')}</Link>
                </div>

                <div className={styles.navLinks}>
                    <Link
                        href="/admin/products"
                        className={pathname?.includes('/admin/products') && !pathname?.includes('/new') && !pathname?.match(/\/[a-f0-9-]+$/) ? styles.active : ''}
                    >
                        {t('products.title')}
                    </Link>
                    <Link
                        href="/admin/orders"
                        className={pathname?.includes('/admin/orders') ? styles.active : ''}
                    >
                        {t('orders.title')}
                    </Link>
                </div>

                <div className={styles.navActions}>
                    <button onClick={handleLogout} className="btn btn-ghost">
                        {t('logout')}
                    </button>
                </div>
            </div>
        </nav>
    );
}
