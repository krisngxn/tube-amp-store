import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * PATCH /api/admin/products/[id]/images/reorder
 * Bulk reorder images for a product
 * Body: { imageIds: string[] } - Array of image IDs in desired order
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId } = await params;
        const body = await request.json();
        const { imageIds } = body;

        if (!Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json(
                { error: 'imageIds must be a non-empty array' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Verify all images belong to this product
        const { data: allImages, error: fetchError } = await supabase
            .from('product_images')
            .select('id, is_primary')
            .eq('product_id', productId);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const existingIds = new Set(allImages?.map(img => img.id) || []);
        const invalidIds = imageIds.filter(id => !existingIds.has(id));

        if (invalidIds.length > 0) {
            return NextResponse.json(
                { error: `Invalid image IDs: ${invalidIds.join(', ')}` },
                { status: 400 }
            );
        }

        // Ensure all images are included (no missing images)
        if (imageIds.length !== existingIds.size) {
            return NextResponse.json(
                { error: 'Must include all images in reorder' },
                { status: 400 }
            );
        }

        // Find the primary image (if any)
        const primaryImage = allImages?.find(img => img.is_primary);
        
        // Determine which image should be primary:
        // 1. If there's an existing primary image, keep it as primary (even if reordered)
        // 2. Otherwise, make the first image (index 0) primary
        const primaryImageId = primaryImage ? primaryImage.id : imageIds[0];

        // Update sort_order for each image
        // Only one image should be primary (the one determined above)
        const updates = imageIds.map((imageId, index) => ({
            id: imageId,
            sort_order: index,
            is_primary: imageId === primaryImageId,
        }));

        // Apply updates in a transaction-like manner
        for (const update of updates) {
            const { error: updateError } = await supabase
                .from('product_images')
                .update({
                    sort_order: update.sort_order,
                    is_primary: update.is_primary,
                })
                .eq('id', update.id)
                .eq('product_id', productId);

            if (updateError) {
                console.error(`Error updating image ${update.id}:`, updateError);
                return NextResponse.json(
                    { error: `Failed to update image ${update.id}: ${updateError.message}` },
                    { status: 500 }
                );
            }
        }

        // Fetch updated images
        const { data: updatedImages, error: finalFetchError } = await supabase
            .from('product_images')
            .select('id, storage_path, url, alt_text, sort_order, is_primary, created_at')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (finalFetchError) {
            return NextResponse.json({ error: finalFetchError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            images: updatedImages || [],
        });
    } catch (error) {
        console.error('Error reordering images:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to reorder images' },
            { status: 500 }
        );
    }
}

