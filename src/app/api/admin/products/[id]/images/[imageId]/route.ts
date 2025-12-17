import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';

const STORAGE_BUCKET = 'product-images';

/**
 * PATCH /api/admin/products/[id]/images/[imageId]
 * Update image metadata (alt_text, sort_order, or set as cover)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId, imageId } = await params;
        const body = await request.json();
        const supabase = createServiceClient();

        // Get current image
        const { data: currentImage, error: fetchError } = await supabase
            .from('product_images')
            .select('*')
            .eq('id', imageId)
            .eq('product_id', productId)
            .single();

        if (fetchError || !currentImage) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Handle setting as cover (sort_order = 0)
        if (body.setAsCover === true) {
            // Get all images for this product
            const { data: allImages } = await supabase
                .from('product_images')
                .select('id, sort_order')
                .eq('product_id', productId)
                .order('sort_order', { ascending: true });

            if (allImages) {
                // Reorder: move current cover to position 1, set this one to 0
                const updates: Array<{ id: string; sort_order: number }> = [];
                
                // Set this image to 0
                updates.push({ id: imageId, sort_order: 0 });

                // Reorder others (skip the one we're moving to cover)
                let newSortOrder = 1;
                for (const img of allImages) {
                    if (img.id !== imageId) {
                        updates.push({ id: img.id, sort_order: newSortOrder });
                        newSortOrder++;
                    }
                }

                // Apply all updates
                for (const update of updates) {
                    await supabase
                        .from('product_images')
                        .update({ sort_order: update.sort_order })
                        .eq('id', update.id);
                }
            }
        }

        // Update other fields
        const updateData: {
            alt_text?: string;
            sort_order?: number;
        } = {};

        if (body.altText !== undefined) {
            updateData.alt_text = body.altText || null;
        }

        if (body.sortOrder !== undefined && body.setAsCover !== true) {
            updateData.sort_order = body.sortOrder;
        }

        if (Object.keys(updateData).length > 0) {
            const { data: updatedImage, error: updateError } = await supabase
                .from('product_images')
                .update(updateData)
                .eq('id', imageId)
                .select()
                .single();

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, image: updatedImage });
        }

        // If setAsCover was true, fetch updated image
        const { data: updatedImage } = await supabase
            .from('product_images')
            .select('*')
            .eq('id', imageId)
            .single();

        return NextResponse.json({ success: true, image: updatedImage });
    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update image' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/products/[id]/images/[imageId]
 * Delete an image (removes from storage and database)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId, imageId } = await params;
        const supabase = createServiceClient();

        // Get image record to get storage_path
        const { data: image, error: fetchError } = await supabase
            .from('product_images')
            .select('storage_path, sort_order')
            .eq('id', imageId)
            .eq('product_id', productId)
            .single();

        if (fetchError || !image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Delete from storage
        if (image.storage_path) {
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([image.storage_path]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue with DB deletion even if storage delete fails
            }
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // Re-normalize sort_order (0..n-1) for remaining images
        const { data: remainingImages } = await supabase
            .from('product_images')
            .select('id, sort_order')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (remainingImages && remainingImages.length > 0) {
            for (let i = 0; i < remainingImages.length; i++) {
                await supabase
                    .from('product_images')
                    .update({ sort_order: i })
                    .eq('id', remainingImages[i].id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete image' },
            { status: 500 }
        );
    }
}

