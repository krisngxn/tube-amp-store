'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { TrackedOrderDTO } from '@/lib/repositories/orders/tracking';
import styles from './TrackingForm.module.css';

interface TrackingFormProps {
    initialOrderCode?: string;
    errorMessage?: string;
    onSubmit: (orderCode: string, contact: string) => Promise<TrackedOrderDTO | null>;
    onSuccess: (order: TrackedOrderDTO) => void;
    onError: (error: string) => void;
}

export default function TrackingForm({
    initialOrderCode = '',
    errorMessage,
    onSubmit,
    onSuccess,
    onError,
}: TrackingFormProps) {
    const t = useTranslations('tracking');
    
    const [orderCode, setOrderCode] = useState(initialOrderCode);
    const [contactType, setContactType] = useState<'email' | 'phone'>('email');
    const [contact, setContact] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        orderCode?: string;
        contact?: string;
    }>({});

    // Validate email format
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate phone format (basic - allows digits, spaces, dashes, plus)
    const isValidPhone = (phone: string): boolean => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!orderCode.trim()) {
            newErrors.orderCode = t('form.errors.orderCodeRequired');
        }

        if (!contact.trim()) {
            newErrors.contact = t('form.errors.contactRequired');
        } else if (contactType === 'email' && !isValidEmail(contact.trim())) {
            newErrors.contact = t('form.errors.invalidEmail');
        } else if (contactType === 'phone' && !isValidPhone(contact.trim())) {
            newErrors.contact = t('form.errors.invalidPhone');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});
        onError(''); // Clear previous error

        try {
            const order = await onSubmit(orderCode.trim(), contact.trim());
            
            if (order) {
                onSuccess(order);
            } else {
                onError(t('errors.notFound'));
            }
        } catch (err) {
            onError(err instanceof Error ? err.message : t('errors.network'));
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = orderCode.trim() && contact.trim() && 
        (contactType === 'email' ? isValidEmail(contact.trim()) : isValidPhone(contact.trim()));

    return (
        <div className={styles.trackForm}>
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGroup}>
                    <label htmlFor="orderCode">{t('form.orderCode')}</label>
                    <input
                        id="orderCode"
                        type="text"
                        value={orderCode}
                        onChange={(e) => {
                            setOrderCode(e.target.value);
                            if (errors.orderCode) {
                                setErrors(prev => ({ ...prev, orderCode: undefined }));
                            }
                        }}
                        placeholder={t('form.orderCodePlaceholder')}
                        required
                        disabled={loading}
                        className={errors.orderCode ? 'input input-error' : 'input'}
                        aria-invalid={!!errors.orderCode}
                        aria-describedby={errors.orderCode ? 'orderCode-error' : undefined}
                    />
                    {errors.orderCode && (
                        <span id="orderCode-error" className="input-error-message">
                            {errors.orderCode}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label>{t('form.contactType')}</label>
                    <div className={styles.contactTypeToggle}>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${contactType === 'email' ? styles.active : ''}`}
                            onClick={() => {
                                setContactType('email');
                                setContact('');
                                setErrors(prev => ({ ...prev, contact: undefined }));
                            }}
                            disabled={loading}
                        >
                            {t('form.email')}
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${contactType === 'phone' ? styles.active : ''}`}
                            onClick={() => {
                                setContactType('phone');
                                setContact('');
                                setErrors(prev => ({ ...prev, contact: undefined }));
                            }}
                            disabled={loading}
                        >
                            {t('form.phone')}
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="contact">
                        {contactType === 'email' ? t('form.email') : t('form.phone')}
                    </label>
                    <input
                        id="contact"
                        type={contactType === 'email' ? 'email' : 'tel'}
                        value={contact}
                        onChange={(e) => {
                            setContact(e.target.value);
                            if (errors.contact) {
                                setErrors(prev => ({ ...prev, contact: undefined }));
                            }
                        }}
                        placeholder={
                            contactType === 'email' 
                                ? t('form.emailPlaceholder')
                                : t('form.phonePlaceholder')
                        }
                        required
                        disabled={loading}
                        className={errors.contact ? 'input input-error' : 'input'}
                        aria-invalid={!!errors.contact}
                        aria-describedby={errors.contact ? 'contact-error' : undefined}
                    />
                    {errors.contact && (
                        <span id="contact-error" className="input-error-message">
                            {errors.contact}
                        </span>
                    )}
                </div>

                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={loading || !isFormValid}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            {t('form.loading')}
                        </>
                    ) : (
                        t('form.submit')
                    )}
                </button>
            </form>
        </div>
    );
}
