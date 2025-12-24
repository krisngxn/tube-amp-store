import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/user';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './layout.module.css';

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAuth();
    const t = await getTranslations('account');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user profile
    const { data: profile } = user ? await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single() : { data: null };

    return (
        <div className={styles.accountLayout}>
            <div className="container">
                <div className={styles.accountHeader}>
                    <div>
                        <h1>{t('title')}</h1>
                        {profile?.full_name && (
                            <p className={styles.welcomeText}>
                                {t('welcome', { name: profile.full_name })}
                            </p>
                        )}
                    </div>
                    <form action="/auth/sign-out" method="POST" className={styles.signOutForm}>
                        <button type="submit" className="btn btn-ghost">
                            {t('signOut')}
                        </button>
                    </form>
                </div>

                <nav className={styles.accountNav}>
                    <Link href="/account/orders" className={styles.navLink}>
                        {t('nav.orders')}
                    </Link>
                </nav>

                <div className={styles.accountContent}>
                    {children}
                </div>
            </div>
        </div>
    );
}

