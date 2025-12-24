'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import TrackingForm from '@/app/order/track/TrackingForm';
import OrderTrackingResult from '@/app/order/track/OrderTrackingResult';
import type { TrackedOrderDTO } from '@/lib/repositories/orders/tracking';

interface TrackingFormWrapperProps {
    initialOrderCode: string;
    errorMessage?: string;
}

export default function TrackingFormWrapper({
    initialOrderCode,
    errorMessage,
}: TrackingFormWrapperProps) {
    const t = useTranslations('tracking');
    const [order, setOrder] = useState<TrackedOrderDTO | null>(null);
    const [error, setError] = useState<string | null>(errorMessage || null);
    const [contact, setContact] = useState('');

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

    if (order) {
        return (
            <OrderTrackingResult
                order={order}
                emailOrPhone={contact}
                onTrackAnother={handleTrackAnother}
            />
        );
    }

    return (
        <TrackingForm
            initialOrderCode={initialOrderCode}
            errorMessage={error || undefined}
            onSubmit={async (orderCode, contactValue) => {
                setContact(contactValue);
                return handleSubmit(orderCode, contactValue);
            }}
            onSuccess={handleSuccess}
            onError={handleError}
        />
    );
}

