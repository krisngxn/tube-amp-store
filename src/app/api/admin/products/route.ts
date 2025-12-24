import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { adminCreateProduct } from '@/lib/repositories/admin/products';
import { createServiceClient } from '@/lib/supabase/service';
import { validateImageFile, generateStoragePath } from '@/lib/utils/images';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_BUCKET = 'product-images';

/**
 * POST /api/admin/products
 * Create a new product with optional images
 * Accepts multipart/form-data with product data and images
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        
        // Extract product data from form
        const productDataJson = formData.get('productData') as string;
        if (!productDataJson) {
            return NextResponse.json({ error: 'Product data is required' }, { status: 400 });
        }

        const productData = JSON.parse(productDataJson);
        
        // Create product first (we need the ID to upload images)
        const productId = await adminCreateProduct(productData);

        // Handle image uploads
        const imageFiles: File[] = [];
        let imageIndex = 0;
        while (formData.has(`images[${imageIndex}]`)) {
            const file = formData.get(`images[${imageIndex}]`) as File;
            if (file && file.size > 0) {
                imageFiles.push(file);
            }
            imageIndex++;
        }

        // Upload images if provided
        const uploadedImages = [];
        if (imageFiles.length > 0) {
            const supabase = createServiceClient();

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                
                // Validate file
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    console.warn(`Skipping invalid image ${i + 1}: ${validation.error}`);
                    continue;
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
                    console.error(`Failed to upload image ${i + 1}:`, uploadError);
                    continue; // Skip this image but continue with others
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(storagePath);

                // Insert database record
                // First image should be primary
                const isPrimary = i === 0;
                const { data: imageRecord, error: dbError } = await supabase
                    .from('product_images')
                    .insert({
                        product_id: productId,
                        storage_path: storagePath,
                        url: urlData.publicUrl,
                        alt_text: null,
                        sort_order: i,
                        is_primary: isPrimary,
                    })
                    .select()
                    .single();

                if (dbError) {
                    console.error(`Failed to save image ${i + 1} record:`, dbError);
                    // Cleanup: delete uploaded file if DB insert fails
                    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
                    continue;
                }

                uploadedImages.push(imageRecord);
            }
        }

        return NextResponse.json({ 
            success: true, 
            id: productId,
            imagesUploaded: uploadedImages.length 
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to create product',
            },
            { status: 500 }
        );
    }
}

