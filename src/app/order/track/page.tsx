'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import TrackingForm from './TrackingForm';
import OrderTrackingResult from './OrderTrackingResult';
import type { TrackedOrderDTO } from '@/lib/repositories/orders/tracking';
import styles from './page.module.css';

export default function TrackOrderPage() {
    const t = useTranslations('tracking');
    const searchParams = useSearchParams();

    const [order, setOrder] = useState<TrackedOrderDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [contact, setContact] = useState('');

    // Handle error query parameter from redirects
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'invalid_token') {
            setError(t('errors.invalidToken'));
        } else if (errorParam === 'missing_token') {
            setError(t('errors.missingToken'));
        }
    }, [searchParams, t]);

    const handleSubmit = async (orderCode: string, contactValue: string): Promise<TrackedOrderDTO | null> => {
        try {
            const response = await fetch('/api/order/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderCode,
                    emailOrPhone: contactValue,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('errors.notFound'));
            }

            return data.order || null;
        } catch (err) {
            throw err;
        }
    };

    const handleSuccess = (orderData: TrackedOrderDTO) => {
        setOrder(orderData);
        setError(null);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setOrder(null);
    };

    const handleTrackAnother = () => {
        setOrder(null);
        setContact('');
        setError(null);
    };

    return (
        <div className={styles.trackPage}>
            <div className="container">
                <div className={styles.trackHeader}>
                    <h1>{t('title')}</h1>
                    <p className={styles.subtitle}>{t('subtitle')}</p>
                </div>

                {!order ? (
                    <>
                        {error && (
                            <div className={styles.errorBanner}>
                                <h3>{t('errors.notFoundTitle', { defaultValue: 'Order Not Found' })}</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        <TrackingForm
                            errorMessage={error || undefined}
                            onSubmit={async (orderCode, contactValue) => {
                                setContact(contactValue);
                                return handleSubmit(orderCode, contactValue);
                            }}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                        {!error && (
                            <div className={styles.emptyStateWrapper}>
                                <EmptyState
                                    title={t('empty.title', { defaultValue: 'Track Your Order' })}
                                    description={t('empty.description', { defaultValue: 'Enter your order code and contact information to view your order details.' })}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <OrderTrackingResult
                        order={order}
                        emailOrPhone={contact}
                        onTrackAnother={handleTrackAnother}
                    />
                )}
            </div>
        </div>
    );
}

