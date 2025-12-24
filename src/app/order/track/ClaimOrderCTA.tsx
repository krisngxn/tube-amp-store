'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import styles from './ClaimOrderCTA.module.css';

interface ClaimOrderCTAProps {
    orderCode: string;
    orderId: string;
    claimMethod: 'tracking_lookup' | 'token_link';
    token?: string;
    emailOrPhone?: string;
}

export default function ClaimOrderCTA({
    orderCode,
    orderId,
    claimMethod,
    token,
    emailOrPhone,
}: ClaimOrderCTAProps) {
    const t = useTranslations('tracking.claim');
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isClaimed, setIsClaimed] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);

            if (user) {
                // Check if order is already claimed
                const { data: order } = await supabase
                    .from('orders')
                    .select('user_id')
                    .eq('id', orderId)
                    .single();

                if (order && order.user_id === user.id) {
                    setIsClaimed(true);
                }
            }
        };

        checkAuth();
    }, [orderId]);

    const handleClaim = async () => {
        if (!isAuthenticated) {
            // Redirect to sign-in with return URL
            const returnUrl = `/order/track/${orderCode}${token ? `?t=${token}` : ''}`;
            router.push(`/auth/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
            return;
        }

        setIsClaiming(true);
        setError(null);

        try {
            const response = await fetch(`/api/order/claim/${orderCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    claimMethod,
                    token,
                    emailOrPhone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('error'));
            }

            setSuccess(true);
            setIsClaimed(true);
            
            // Redirect to account orders after a short delay
            setTimeout(() => {
                router.push('/account/orders');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsClaiming(false);
        }
    };

    if (isAuthenticated === null) {
        // Still checking auth
        return null;
    }

    if (isClaimed) {
        return (
            <div className={styles.claimCTA}>
                <p className={styles.successMessage}>{t('claimed')}</p>
                <Link href="/account/orders" className="btn btn-primary">
                    {t('viewOrders')}
                </Link>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.claimCTA}>
                <p className={styles.claimPrompt}>{t('signInPrompt')}</p>
                <Link
                    href={`/auth/sign-in?redirect=${encodeURIComponent(`/order/track/${orderCode}${token ? `?t=${token}` : ''}`)}`}
                    className="btn btn-primary"
                >
                    {t('signInToSave')}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.claimCTA}>
            <p className={styles.claimPrompt}>{t('savePrompt')}</p>
            {error && (
                <div className={styles.errorMessage}>{error}</div>
            )}
            {success && (
                <div className={styles.successMessage}>{t('success')}</div>
            )}
            <button
                type="button"
                className="btn btn-primary"
                onClick={handleClaim}
                disabled={isClaiming || success}
            >
                {isClaiming ? t('claiming') : t('saveOrder')}
            </button>
        </div>
    );
}

