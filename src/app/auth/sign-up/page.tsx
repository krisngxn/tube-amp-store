'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignUpPage() {
    const t = useTranslations('auth');
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(t('signUp.errors.passwordMismatch'));
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError(t('signUp.errors.passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            
            // Sign up user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || undefined,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message || t('signUp.errors.signUpFailed'));
                return;
            }

            if (data.user) {
                // Create user profile
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: data.user.id,
                        email: data.user.email!,
                        full_name: fullName || null,
                        role: 'customer',
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Don't fail sign-up if profile creation fails - it can be created later
                }

                // Redirect to sign-in (or account if email confirmation not required)
                router.push('/auth/sign-in?message=signup_success');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('signUp.errors.signUpFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className="container">
                <div className={styles.authCard}>
                    <h1>{t('signUp.title')}</h1>
                    <p className={styles.subtitle}>{t('signUp.subtitle')}</p>

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">{t('signUp.fullName')}</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={t('signUp.fullNamePlaceholder')}
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">{t('signUp.email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('signUp.emailPlaceholder')}
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">{t('signUp.password')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('signUp.passwordPlaceholder')}
                                required
                                disabled={loading}
                                autoComplete="new-password"
                                minLength={6}
                            />
                            <small className={styles.hint}>{t('signUp.passwordHint')}</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">{t('signUp.confirmPassword')}</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('signUp.confirmPasswordPlaceholder')}
                                required
                                disabled={loading}
                                autoComplete="new-password"
                                minLength={6}
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
                            {loading ? t('signUp.loading') : t('signUp.submit')}
                        </button>
                    </form>

                    <div className={styles.authFooter}>
                        <p>
                            {t('signUp.hasAccount')}{' '}
                            <Link href="/auth/sign-in" className={styles.link}>
                                {t('signUp.signInLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

