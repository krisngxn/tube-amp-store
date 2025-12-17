'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface BankTransferInstructionsProps {
    order: {
        order_number: string;
        deposit_amount_vnd?: number;
        bank_transfer_memo?: string;
        deposit_due_at?: string;
    };
    locale: string;
    translations: {
        title: string;
        qrTitle: string;
        qrInstructions: string;
        bankDetails: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
        amount: string;
        memo: string;
        memoNote: string;
        copyMemo: string;
        copied: string;
        deadline: string;
        deadlineWarning: string;
        nextSteps: {
            title: string;
            step1: string;
            step2: string;
            step3: string;
        };
        fallbackMessage: string;
        currency: string;
    };
    bankConfig: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        bankBin: string;
    };
}

export default function BankTransferInstructions({
    order,
    locale,
    translations: t,
    bankConfig,
}: BankTransferInstructionsProps) {
    const [copied, setCopied] = useState(false);
    
    const depositAmount = order.deposit_amount_vnd || 0;
    const memo = order.bank_transfer_memo || `RTB-${order.order_number}`;
    
    // Generate VietQR URL
    const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankBin}-${bankConfig.accountNumber}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    const handleCopyMemo = async () => {
        try {
            await navigator.clipboard.writeText(memo);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    
    return (
        <div className={styles.bankTransferSection}>
            <h2>{t.title}</h2>
            
            {/* VietQR Section */}
            <div className={styles.qrSection}>
                <h3>{t.qrTitle}</h3>
                <p className={styles.qrInstructions}>{t.qrInstructions}</p>
                
                <div className={styles.qrContainer}>
                    <img 
                        src={qrUrl}
                        alt="VietQR Code"
                        className={styles.qrImage}
                        width={300}
                        height={300}
                    />
                </div>
                
                <p className={styles.fallbackMessage}>{t.fallbackMessage}</p>
            </div>
            
            {/* Bank Details */}
            <div className={styles.bankDetails}>
                <h3>{t.bankDetails}</h3>
                <table className={styles.bankTable}>
                    <tbody>
                        <tr>
                            <td><strong>{t.bankName}:</strong></td>
                            <td>{bankConfig.bankName}</td>
                        </tr>
                        <tr>
                            <td><strong>{t.accountNumber}:</strong></td>
                            <td>
                                <code className={styles.accountCode}>{bankConfig.accountNumber}</code>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>{t.accountName}:</strong></td>
                            <td>{bankConfig.accountName}</td>
                        </tr>
                        <tr>
                            <td><strong>{t.amount}:</strong></td>
                            <td className={styles.amountValue}>
                                {formatCurrency(depositAmount)} {t.currency}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>{t.memo}:</strong></td>
                            <td>
                                <div className={styles.memoContainer}>
                                    <code className={styles.memoCode}>{memo}</code>
                                    <button 
                                        type="button"
                                        onClick={handleCopyMemo}
                                        className={styles.copyButton}
                                    >
                                        {copied ? t.copied : t.copyMemo}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className={styles.memoNote}>{t.memoNote}</p>
            </div>
            
            {/* Deadline Warning */}
            {order.deposit_due_at && (
                <div className={styles.deadlineSection}>
                    <h4>{t.deadline}</h4>
                    <p className={styles.deadlineTime}>{formatDate(order.deposit_due_at)}</p>
                    <p className={styles.deadlineWarning}>{t.deadlineWarning}</p>
                </div>
            )}
            
            {/* Next Steps */}
            <div className={styles.nextStepsSection}>
                <h3>{t.nextSteps.title}</h3>
                <ol className={styles.stepsList}>
                    <li>{t.nextSteps.step1}</li>
                    <li>{t.nextSteps.step2}</li>
                    <li>{t.nextSteps.step3}</li>
                </ol>
            </div>
        </div>
    );
}

