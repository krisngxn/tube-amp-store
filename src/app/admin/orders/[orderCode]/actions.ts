'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { 
    adminUpdateOrderStatus, 
    adminMarkDepositReceived,
    adminExpireReservation,
    adminCancelReservation,
    type OrderStatus 
} from '@/lib/repositories/admin/orders';

/**
 * Server action to update order status
 */
export async function updateOrderStatusAction(
    orderCode: string,
    newStatus: OrderStatus,
    note?: string
): Promise<void> {
    // Ensure user is admin
    const user = await requireAdmin();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        await adminUpdateOrderStatus(orderCode, newStatus, note, user.id);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error instanceof Error ? error : new Error('Failed to update order status');
    }
}

/**
 * Server action to mark deposit as received
 */
export async function markDepositReceivedAction(
    orderCode: string,
    note?: string
): Promise<void> {
    const user = await requireAdmin();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        await adminMarkDepositReceived(orderCode, note, user.id);
        // Revalidate the order detail page and orders list
        revalidatePath(`/admin/orders/${orderCode}`);
        revalidatePath('/admin/orders');
    } catch (error) {
        console.error('Error marking deposit received:', error);
        throw error instanceof Error ? error : new Error('Failed to mark deposit as received');
    }
}

/**
 * Server action to expire reservation
 */
export async function expireReservationAction(
    orderCode: string,
    note?: string
): Promise<void> {
    const user = await requireAdmin();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        await adminExpireReservation(orderCode, note, user.id);
    } catch (error) {
        console.error('Error expiring reservation:', error);
        throw error instanceof Error ? error : new Error('Failed to expire reservation');
    }
}

/**
 * Server action to cancel reservation
 */
export async function cancelReservationAction(
    orderCode: string,
    note?: string
): Promise<void> {
    const user = await requireAdmin();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        await adminCancelReservation(orderCode, note, user.id);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        throw error instanceof Error ? error : new Error('Failed to cancel reservation');
    }
}

