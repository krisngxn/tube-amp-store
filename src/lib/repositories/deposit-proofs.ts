/**
 * Deposit Transfer Proofs Repository
 * 
 * Handles CRUD operations for bank transfer deposit proofs.
 */

import { createServiceClient } from '@/lib/supabase/service';

export interface DepositProof {
    id: string;
    orderId: string;
    imageUrls: string[];
    storagePaths: string[];
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNote?: string;
    submittedAt: string;
    customerNote?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProofInput {
    orderId: string;
    imageUrls: string[];
    storagePaths: string[];
    customerNote?: string;
}

export interface ReviewProofInput {
    proofId: string;
    status: 'approved' | 'rejected';
    reviewedBy?: string;
    reviewNote?: string;
}

/**
 * Get deposit proof for an order
 */
export async function getDepositProofByOrderId(orderId: string): Promise<DepositProof | null> {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
        .from('deposit_transfer_proofs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    
    if (error) {
        console.error('Error fetching deposit proof:', error);
        return null;
    }
    
    if (!data) {
        return null;
    }
    
    return mapToDepositProof(data);
}

/**
 * Get all deposit proofs for an order (including rejected ones)
 */
export async function getAllDepositProofsForOrder(orderId: string): Promise<DepositProof[]> {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
        .from('deposit_transfer_proofs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching deposit proofs:', error);
        return [];
    }
    
    return (data || []).map(mapToDepositProof);
}

/**
 * Get pending deposit proofs (for admin review)
 */
export async function getPendingDepositProofs(): Promise<DepositProof[]> {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
        .from('deposit_transfer_proofs')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching pending deposit proofs:', error);
        return [];
    }
    
    return (data || []).map(mapToDepositProof);
}

/**
 * Create a new deposit proof submission
 */
export async function createDepositProof(input: CreateProofInput): Promise<DepositProof | null> {
    const supabase = createServiceClient();
    
    // Check if there's already a pending proof for this order
    const { data: existing } = await supabase
        .from('deposit_transfer_proofs')
        .select('id')
        .eq('order_id', input.orderId)
        .eq('status', 'pending')
        .maybeSingle();
    
    if (existing) {
        throw new Error('A pending proof already exists for this order');
    }
    
    const { data, error } = await supabase
        .from('deposit_transfer_proofs')
        .insert({
            order_id: input.orderId,
            image_urls: input.imageUrls,
            storage_paths: input.storagePaths,
            status: 'pending',
            customer_note: input.customerNote || null,
            submitted_at: new Date().toISOString(),
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error creating deposit proof:', error);
        throw new Error(`Failed to create deposit proof: ${error.message}`);
    }
    
    return mapToDepositProof(data);
}

/**
 * Review (approve/reject) a deposit proof
 */
export async function reviewDepositProof(input: ReviewProofInput): Promise<DepositProof | null> {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
        .from('deposit_transfer_proofs')
        .update({
            status: input.status,
            reviewed_by: input.reviewedBy || null,
            reviewed_at: new Date().toISOString(),
            review_note: input.reviewNote || null,
        })
        .eq('id', input.proofId)
        .select()
        .single();
    
    if (error) {
        console.error('Error reviewing deposit proof:', error);
        throw new Error(`Failed to review deposit proof: ${error.message}`);
    }
    
    return mapToDepositProof(data);
}

/**
 * Check if an order can accept proof uploads
 */
export async function canUploadProof(orderId: string): Promise<{ canUpload: boolean; reason?: string }> {
    const supabase = createServiceClient();
    
    // Get order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_type, payment_method, payment_status, status, deposit_due_at')
        .eq('id', orderId)
        .single();
    
    if (orderError || !order) {
        return { canUpload: false, reason: 'Order not found' };
    }
    
    // Must be a deposit reservation with bank transfer
    if (order.order_type !== 'deposit_reservation') {
        return { canUpload: false, reason: 'Not a deposit reservation order' };
    }
    
    if (order.payment_method !== 'bank_transfer') {
        return { canUpload: false, reason: 'Not a bank transfer order' };
    }
    
    // Must be in deposit_pending status
    if (order.payment_status !== 'deposit_pending') {
        return { canUpload: false, reason: 'Deposit already processed or order cancelled' };
    }
    
    // Check if expired
    if (order.deposit_due_at) {
        const dueAt = new Date(order.deposit_due_at);
        if (dueAt < new Date()) {
            return { canUpload: false, reason: 'Deposit deadline has passed' };
        }
    }
    
    // Check if order is cancelled/expired
    if (order.status === 'cancelled' || order.status === 'expired') {
        return { canUpload: false, reason: 'Order is cancelled or expired' };
    }
    
    // Check if there's already a pending proof
    const { data: existingProof } = await supabase
        .from('deposit_transfer_proofs')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .maybeSingle();
    
    if (existingProof) {
        return { canUpload: false, reason: 'Proof already submitted and pending review' };
    }
    
    return { canUpload: true };
}

/**
 * Delete storage files for a proof (used when cleaning up rejected proofs)
 */
export async function deleteProofStorageFiles(storagePaths: string[]): Promise<void> {
    const supabase = createServiceClient();
    
    if (storagePaths.length === 0) return;
    
    const { error } = await supabase.storage
        .from('deposit_proofs')
        .remove(storagePaths);
    
    if (error) {
        console.error('Error deleting proof storage files:', error);
        // Don't throw - this is a cleanup operation
    }
}

/**
 * Map database row to DepositProof type
 */
function mapToDepositProof(row: Record<string, unknown>): DepositProof {
    return {
        id: row.id as string,
        orderId: row.order_id as string,
        imageUrls: (row.image_urls as string[]) || [],
        storagePaths: (row.storage_paths as string[]) || [],
        status: row.status as 'pending' | 'approved' | 'rejected',
        reviewedBy: row.reviewed_by as string | undefined,
        reviewedAt: row.reviewed_at as string | undefined,
        reviewNote: row.review_note as string | undefined,
        submittedAt: row.submitted_at as string,
        customerNote: row.customer_note as string | undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

