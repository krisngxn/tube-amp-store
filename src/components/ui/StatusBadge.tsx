'use client';

import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Order statuses
  pending: { label: 'Pending', className: 'pending' },
  confirmed: { label: 'Confirmed', className: 'confirmed' },
  deposited: { label: 'Deposited', className: 'confirmed' },
  processing: { label: 'Processing', className: 'confirmed' },
  shipped: { label: 'Shipped', className: 'confirmed' },
  delivered: { label: 'Delivered', className: 'confirmed' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
  expired: { label: 'Expired', className: 'cancelled' },
  refunded: { label: 'Refunded', className: 'cancelled' },
  
  // Payment statuses
  paid: { label: 'Paid', className: 'confirmed' },
  deposit_pending: { label: 'Deposit Pending', className: 'pending' },
  refund_pending: { label: 'Refund Pending', className: 'pending' },
  partially_refunded: { label: 'Partially Refunded', className: 'pending' },
};

export default function StatusBadge({ status, type = 'order', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'pending' };
  
  return (
    <span className={`${styles.statusBadge} ${styles[config.className]} ${className}`}>
      {config.label}
    </span>
  );
}

