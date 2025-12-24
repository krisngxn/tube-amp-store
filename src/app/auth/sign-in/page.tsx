'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignInPage() {
    const t = useTranslations('auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/account/orders';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message || t('errors.signInFailed'));
                return;
            }

            if (data.user) {
                // Ensure profile exists
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .upsert({
                        id: data.user.id,
                        email: data.user.email!,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'id',
                    });

                if (profileError) {
                    console.error('Error ensuring profile:', profileError);
                }

                // Redirect to intended page or account
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.signInFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className="container">
                <div className={styles.authCard}>
                    <h1>{t('signIn.title')}</h1>
                    <p className={styles.subtitle}>{t('signIn.subtitle')}</p>

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">{t('signIn.email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('signIn.emailPlaceholder')}
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">{t('signIn.password')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('signIn.passwordPlaceholder')}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-large"
                            disabled={loading}
                        >
                            {loading ? t('signIn.loading') : t('signIn.submit')}
                        </button>
                    </form>

                    <div className={styles.authFooter}>
                        <p>
                            {t('signIn.noAccount')}{' '}
                            <Link href="/auth/sign-up" className={styles.link}>
                                {t('signIn.signUpLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

