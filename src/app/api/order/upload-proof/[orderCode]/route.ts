import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyTokenForOrder } from '@/lib/orderTrackingTokens';
import { canUploadProof, createDepositProof } from '@/lib/repositories/deposit-proofs';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Max files per upload
const MAX_FILES = 3;

interface RouteParams {
    params: Promise<{ orderCode: string }>;
}

/**
 * POST /api/order/upload-proof/[orderCode]
 * Upload proof of bank transfer for deposit reservation
 * 
 * Requires:
 * - Valid tracking token (in Authorization header or ?t= query param)
 * - Order must be deposit_reservation with bank_transfer payment
 * - Order must be in deposit_pending status
 * - Must not be expired
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { orderCode } = await params;
        
        // Get token from Authorization header or query param
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '') || 
                      request.nextUrl.searchParams.get('t');
        
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }
        
        const supabase = createServiceClient();
        
        // Get order by code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number')
            .eq('order_number', orderCode)
            .single();
        
        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
                { status: 404 }
            );
        }
        
        // Verify token
        const isValidToken = await verifyTokenForOrder(order.id, token);
        if (!isValidToken) {
            return NextResponse.json(
                { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }
        
        // Check if order can accept proof uploads
        const { canUpload, reason } = await canUploadProof(order.id);
        if (!canUpload) {
            return NextResponse.json(
                { error: reason || 'Cannot upload proof for this order', code: 'CANNOT_UPLOAD' },
                { status: 400 }
            );
        }
        
        // Parse form data
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const customerNote = formData.get('note') as string | null;
        
        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided', code: 'NO_FILES' },
                { status: 400 }
            );
        }
        
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `Maximum ${MAX_FILES} files allowed`, code: 'TOO_MANY_FILES' },
                { status: 400 }
            );
        }
        
        // Validate files
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`, code: 'INVALID_TYPE' },
                    { status: 400 }
                );
            }
            
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: 'File too large. Maximum 5MB per file', code: 'FILE_TOO_LARGE' },
                    { status: 400 }
                );
            }
        }
        
        // Upload files to Supabase Storage
        const uploadedFiles: { url: string; path: string }[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
            const fileName = `${order.id}/${Date.now()}-${i}.${extension}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('deposit-proofs')
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false,
                });
            
            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                // Clean up already uploaded files
                if (uploadedFiles.length > 0) {
                    await supabase.storage
                        .from('deposit-proofs')
                        .remove(uploadedFiles.map(f => f.path));
                }
                return NextResponse.json(
                    { error: 'Failed to upload file', code: 'UPLOAD_FAILED' },
                    { status: 500 }
                );
            }
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('deposit-proofs')
                .getPublicUrl(fileName);
            
            uploadedFiles.push({
                url: urlData.publicUrl,
                path: fileName,
            });
        }
        
        // Create deposit proof record
        try {
            const proof = await createDepositProof({
                orderId: order.id,
                imageUrls: uploadedFiles.map(f => f.url),
                storagePaths: uploadedFiles.map(f => f.path),
                customerNote: customerNote || undefined,
            });
            
            return NextResponse.json({
                success: true,
                proofId: proof?.id,
                message: 'Proof uploaded successfully. Our team will review it shortly.',
            });
        } catch (proofError) {
            // Clean up uploaded files
            await supabase.storage
                .from('deposit-proofs')
                .remove(uploadedFiles.map(f => f.path));
            
            throw proofError;
        }
    } catch (error) {
        console.error('Error uploading deposit proof:', error);
        return NextResponse.json(
            { 
                error: 'Failed to upload proof', 
                details: error instanceof Error ? error.message : 'Unknown error',
                code: 'INTERNAL_ERROR',
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/order/upload-proof/[orderCode]
 * Get current proof status for an order
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { orderCode } = await params;
        
        // Get token from query param
        const token = request.nextUrl.searchParams.get('t');
        
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }
        
        const supabase = createServiceClient();
        
        // Get order by code
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id')
            .eq('order_number', orderCode)
            .single();
        
        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
                { status: 404 }
            );
        }
        
        // Verify token
        const isValidToken = await verifyTokenForOrder(order.id, token);
        if (!isValidToken) {
            return NextResponse.json(
                { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }
        
        // Get latest proof for the order
        const { data: proof } = await supabase
            .from('deposit_transfer_proofs')
            .select('id, status, submitted_at, review_note, image_urls')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        // Check if can upload
        const { canUpload, reason } = await canUploadProof(order.id);
        
        return NextResponse.json({
            proof: proof ? {
                id: proof.id,
                status: proof.status,
                submittedAt: proof.submitted_at,
                reviewNote: proof.review_note,
                imageCount: proof.image_urls?.length || 0,
            } : null,
            canUpload,
            cannotUploadReason: canUpload ? undefined : reason,
        });
    } catch (error) {
        console.error('Error getting proof status:', error);
        return NextResponse.json(
            { error: 'Failed to get proof status', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}

