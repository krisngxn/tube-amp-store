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

        // Handle setting as primary/cover
        if (body.setAsPrimary === true || body.setAsCover === true) {
            // First, unset all other primary images for this product
            await supabase
                .from('product_images')
                .update({ is_primary: false })
                .eq('product_id', productId)
                .neq('id', imageId);

            // Get all images for this product to handle sort_order
            const { data: allImages } = await supabase
                .from('product_images')
                .select('id, sort_order, is_primary')
                .eq('product_id', productId)
                .order('sort_order', { ascending: true });

            if (allImages) {
                // Find current primary image (if any)
                const currentPrimary = allImages.find(img => img.is_primary && img.id !== imageId);
                
                // Set this image as primary with sort_order = 0
                await supabase
                    .from('product_images')
                    .update({ 
                        is_primary: true,
                        sort_order: 0 
                    })
                    .eq('id', imageId);

                // Reorder others: move old primary to position 1, then continue
                let newSortOrder = 1;
                for (const img of allImages) {
                    if (img.id !== imageId) {
                        await supabase
                            .from('product_images')
                            .update({ sort_order: newSortOrder })
                            .eq('id', img.id);
                        newSortOrder++;
                    }
                }
            } else {
                // No other images, just set this one as primary
                await supabase
                    .from('product_images')
                    .update({ 
                        is_primary: true,
                        sort_order: 0 
                    })
                    .eq('id', imageId);
            }
        }

        // Update other fields (only if not setting as primary)
        const updateData: {
            alt_text?: string;
            sort_order?: number;
            is_primary?: boolean;
        } = {};

        if (body.altText !== undefined) {
            updateData.alt_text = body.altText || null;
        }

        if (body.sortOrder !== undefined && body.setAsPrimary !== true && body.setAsCover !== true) {
            updateData.sort_order = body.sortOrder;
        }

        // Handle is_primary field directly (if set without setAsPrimary)
        if (body.isPrimary !== undefined && body.setAsPrimary !== true && body.setAsCover !== true) {
            if (body.isPrimary === true) {
                // Unset other primary images first
                await supabase
                    .from('product_images')
                    .update({ is_primary: false })
                    .eq('product_id', productId)
                    .neq('id', imageId);
            }
            updateData.is_primary = body.isPrimary;
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

        // Get image record to get storage_path and check if it's primary
        const { data: image, error: fetchError } = await supabase
            .from('product_images')
            .select('storage_path, sort_order, is_primary')
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
        // If deleted image was primary, set first remaining image as primary
        const { data: remainingImages } = await supabase
            .from('product_images')
            .select('id, sort_order, is_primary')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (remainingImages && remainingImages.length > 0) {
            const wasPrimary = image.is_primary;
            
            for (let i = 0; i < remainingImages.length; i++) {
                const updateData: { sort_order: number; is_primary?: boolean } = { sort_order: i };
                
                // If deleted image was primary and this is the first image, make it primary
                if (wasPrimary && i === 0 && !remainingImages[i].is_primary) {
                    // Unset any other primary images first
                    await supabase
                        .from('product_images')
                        .update({ is_primary: false })
                        .eq('product_id', productId);
                    
                    updateData.is_primary = true;
                }
                
                await supabase
                    .from('product_images')
                    .update(updateData)
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

