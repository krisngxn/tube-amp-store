import { createServiceClient } from '@/lib/supabase/service';
import { verifyTokenForOrder } from '@/lib/orderTrackingTokens';

/**
 * Order Tracking Repository
 * Server-only functions for customer order tracking (no authentication)
 * Uses service role key to bypass RLS
 */

export type OrderStatus = 'pending' | 'confirmed' | 'deposited' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'expired';
export type PaymentStatus = 'pending' | 'deposit_pending' | 'deposited' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
    id: string;
    productName: string;
    productSlug?: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface OrderStatusHistory {
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note?: string;
    changedBy?: string;
    createdAt: string;
}

export interface TrackedOrderDTO {
    orderCode: string;
    createdAt: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    orderType: 'standard' | 'deposit_reservation';
    depositAmountVnd?: number;
    depositDueAt?: string;
    depositReceivedAt?: string;
    remainingAmount?: number;
    paymentMethod: 'cod' | 'bank_transfer';
    orderItems: OrderItem[];
    statusHistory: OrderStatusHistory[];
    subtotal: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
}

/**
 * Normalize email/phone for comparison
 */
function normalizeContact(contact: string): string {
    return contact.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Track order by order code and contact (email or phone)
 * Validates that the contact matches the order
 */
export async function trackOrderByCodeAndContact(
    orderCode: string,
    emailOrPhone: string
): Promise<TrackedOrderDTO | null> {
    const supabase = createServiceClient();
    const normalizedContact = normalizeContact(emailOrPhone);

    // Fetch order with items and status history
    const { data: order, error } = await supabase
        .from('orders')
        .select(
            `
            id,
            order_number,
            created_at,
            status,
            payment_status,
            order_type,
            is_deposit_order,
            deposit_amount_vnd,
            deposit_due_at,
            deposit_received_at,
            remaining_amount,
            payment_method,
            subtotal,
            shipping_fee,
            tax,
            discount,
            total,
            customer_email,
            customer_phone,
            order_items (
                id,
                product_name,
                product_slug,
                product_image_url,
                unit_price,
                quantity,
                subtotal
            ),
            order_status_history (
                id,
                from_status,
                to_status,
                note,
                changed_by,
                created_at
            )
        `
        )
        .eq('order_number', orderCode)
        .single();

    if (error || !order) {
        // Return null for not found (generic error to prevent enumeration)
        return null;
    }

    // Validate contact matches (email or phone)
    const normalizedEmail = order.customer_email ? normalizeContact(order.customer_email) : '';
    const normalizedPhone = order.customer_phone ? normalizeContact(order.customer_phone) : '';

    if (normalizedContact !== normalizedEmail && normalizedContact !== normalizedPhone) {
        // Return null for mismatch (generic error to prevent enumeration)
        return null;
    }

    // Map to DTO (sanitized - no PII beyond what user provided)
    return {
        orderCode: order.order_number,
        createdAt: order.created_at,
        status: order.status as OrderStatus,
        paymentStatus: order.payment_status as PaymentStatus,
        orderType: (order.order_type || (order.is_deposit_order ? 'deposit_reservation' : 'standard')) as 'standard' | 'deposit_reservation',
        depositAmountVnd: order.deposit_amount_vnd ? Number(order.deposit_amount_vnd) : undefined,
        depositDueAt: order.deposit_due_at || undefined,
        depositReceivedAt: order.deposit_received_at || undefined,
        remainingAmount: order.remaining_amount ? Number(order.remaining_amount) : undefined,
        paymentMethod: order.payment_method,
        orderItems: (order.order_items || []).map((item: any) => ({
            id: item.id,
            productName: item.product_name,
            productSlug: item.product_slug || undefined,
            productImageUrl: item.product_image_url || undefined,
            unitPrice: Number(item.unit_price),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
        })),
        statusHistory: (order.order_status_history || [])
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((history: any) => ({
                id: history.id,
                fromStatus: history.from_status as OrderStatus | null,
                toStatus: history.to_status as OrderStatus,
                note: history.note || undefined,
                changedBy: history.changed_by || undefined,
                createdAt: history.created_at,
            })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shipping_fee),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
    };
}

/**
 * Get order by code for tracking (used internally)
 */
async function getOrderByCodeForTracking(orderCode: string): Promise<{
    id: string;
    order_number: string;
} | null> {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('order_number', orderCode)
        .maybeSingle();
    
    if (error || !data) {
        return null;
    }
    
    return data;
}

/**
 * Track order by token
 * Validates token and returns order data
 */
export async function trackOrderByToken(
    orderCode: string,
    token: string
): Promise<TrackedOrderDTO | null> {
    // First, get order ID from order code
    const orderData = await getOrderByCodeForTracking(orderCode);
    
    if (!orderData) {
        return null; // Order not found
    }
    
    // Verify token for this order
    const isValid = await verifyTokenForOrder(orderData.id, token);
    
    if (!isValid) {
        return null; // Invalid or expired token
    }

    const supabase = createServiceClient();

    // Fetch order with items and status history
    const { data: order, error } = await supabase
        .from('orders')
        .select(
            `
            id,
            order_number,
            created_at,
            status,
            payment_status,
            order_type,
            is_deposit_order,
            deposit_amount_vnd,
            deposit_due_at,
            deposit_received_at,
            remaining_amount,
            payment_method,
            subtotal,
            shipping_fee,
            tax,
            discount,
            total,
            order_items (
                id,
                product_name,
                product_slug,
                product_image_url,
                unit_price,
                quantity,
                subtotal
            ),
            order_status_history (
                id,
                from_status,
                to_status,
                note,
                changed_by,
                created_at
            )
        `
        )
        .eq('id', orderData.id)
        .single();

    if (error || !order) {
        return null;
    }

    // Verify order code matches
    if (order.order_number !== orderCode) {
        return null;
    }

    // Map to DTO
    return {
        orderCode: order.order_number,
        createdAt: order.created_at,
        status: order.status as OrderStatus,
        paymentStatus: order.payment_status as PaymentStatus,
        orderType: (order.order_type || (order.is_deposit_order ? 'deposit_reservation' : 'standard')) as 'standard' | 'deposit_reservation',
        depositAmountVnd: order.deposit_amount_vnd ? Number(order.deposit_amount_vnd) : undefined,
        depositDueAt: order.deposit_due_at || undefined,
        depositReceivedAt: order.deposit_received_at || undefined,
        remainingAmount: order.remaining_amount ? Number(order.remaining_amount) : undefined,
        paymentMethod: order.payment_method,
        orderItems: (order.order_items || []).map((item: any) => ({
            id: item.id,
            productName: item.product_name,
            productSlug: item.product_slug || undefined,
            productImageUrl: item.product_image_url || undefined,
            unitPrice: Number(item.unit_price),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
        })),
        statusHistory: (order.order_status_history || [])
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((history: any) => ({
                id: history.id,
                fromStatus: history.from_status as OrderStatus | null,
                toStatus: history.to_status as OrderStatus,
                note: history.note || undefined,
                changedBy: history.changed_by || undefined,
                createdAt: history.created_at,
            })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shipping_fee),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
    };
}

/**
 * Get trackable order by token (alias for trackOrderByToken)
 * Used for consistency with the requirement
 */
export async function getTrackableOrderByToken(
    orderCode: string,
    tokenPlain: string
): Promise<TrackedOrderDTO | null> {
    return trackOrderByToken(orderCode, tokenPlain);
}

