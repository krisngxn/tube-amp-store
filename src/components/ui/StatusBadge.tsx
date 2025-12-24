'use client';

import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
  className?: string;
  label?: string; // Optional translated label
}

const statusConfig: Record<string, { className: string }> = {
  // Order statuses
  pending: { className: 'pending' },
  confirmed: { className: 'confirmed' },
  deposited: { className: 'confirmed' },
  processing: { className: 'confirmed' },
  shipped: { className: 'confirmed' },
  delivered: { className: 'confirmed' },
  cancelled: { className: 'cancelled' },
  expired: { className: 'cancelled' },
  refunded: { className: 'cancelled' },
  
  // Payment statuses
  paid: { className: 'confirmed' },
  deposit_pending: { className: 'pending' },
  refund_pending: { className: 'pending' },
  partially_refunded: { className: 'pending' },
};

export default function StatusBadge({ status, type = 'order', className = '', label }: StatusBadgeProps) {
  const config = statusConfig[status] || { className: 'pending' };
  const displayLabel = label || status;
  
  return (
    <span className={`${styles.statusBadge} ${styles[config.className]} ${className}`}>
      {displayLabel}
    </span>
  );
}


