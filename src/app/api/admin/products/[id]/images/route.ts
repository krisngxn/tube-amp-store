import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { validateImageFile, generateStoragePath } from '@/lib/utils/images';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_BUCKET = 'product-images';

/**
 * POST /api/admin/products/[id]/images
 * Upload a new image for a product
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId } = await params;

        // Verify product exists
        const supabase = createServiceClient();
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const altText = (formData.get('altText') as string) || null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Generate storage path
        const imageId = uuidv4();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const storagePath = generateStoragePath(productId, imageId, fileExtension);

        // Upload to Supabase Storage
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            console.error('Storage path:', storagePath);
            console.error('Bucket:', STORAGE_BUCKET);
            return NextResponse.json(
                { 
                    error: 'Failed to upload image to storage', 
                    details: uploadError.message,
                    code: (uploadError as any).statusCode || 'unknown',
                    storagePath,
                    bucket: STORAGE_BUCKET
                },
                { status: 500 }
            );
        }

        // Get existing images to determine sort_order and is_primary
        const { data: existingImages } = await supabase
            .from('product_images')
            .select('sort_order, is_primary')
            .eq('product_id', productId)
            .order('sort_order', { ascending: false });

        const isFirstImage = !existingImages || existingImages.length === 0;
        const nextSortOrder = existingImages && existingImages.length > 0
            ? existingImages[0].sort_order + 1
            : 0;
        
        // First image should be primary
        const isPrimary = isFirstImage;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath);

        // Insert database record
        const { data: imageRecord, error: dbError } = await supabase
            .from('product_images')
            .insert({
                product_id: productId,
                storage_path: storagePath,
                url: urlData.publicUrl,
                alt_text: altText,
                sort_order: nextSortOrder,
                is_primary: isPrimary,
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup: delete uploaded file if DB insert fails
            await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
            console.error('Database insert error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save image record', details: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            image: {
                id: imageRecord.id,
                storage_path: imageRecord.storage_path,
                url: imageRecord.url,
                alt_text: imageRecord.alt_text,
                sort_order: imageRecord.sort_order,
                is_primary: imageRecord.is_primary,
            },
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload image' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/products/[id]/images
 * Get all images for a product
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId } = await params;
        const supabase = createServiceClient();

        const { data: images, error } = await supabase
            .from('product_images')
            .select('id, storage_path, url, alt_text, sort_order, is_primary, created_at')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ images: images || [] });
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch images' },
            { status: 500 }
        );
    }
}

