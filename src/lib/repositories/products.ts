import { createClient } from '@/lib/supabase/server';
import { getPublicImageUrl } from '@/lib/utils/images';
import type {
    ProductCardDTO,
    ProductDetailDTO,
    ProductListResponse,
    ListProductsParams,
    ProductImage,
    ProductSpecs,
} from '@/lib/types/catalog';

// Types for Supabase response objects
interface ProductTranslationRow {
    name: string;
    short_description?: string;
    locale: string;
}

interface ProductImageRow {
    storage_path?: string; // New schema
    url?: string; // Old schema (backward compatibility)
    alt_text?: string;
    sort_order?: number; // New schema
    position?: number; // Old schema (backward compatibility)
    is_primary?: boolean; // Old schema (backward compatibility)
}

interface ProductRow {
    id: string;
    slug: string;
    price: number;
    compare_at_price?: number;
    stock_quantity: number;
    low_stock_threshold?: number;
    condition: string;
    topology: string;
    tube_type: string;
    power_watts: number;
    min_speaker_sensitivity: number;
    is_featured: boolean;
    is_vintage: boolean;
    product_translations?: ProductTranslationRow[];
    product_images?: ProductImageRow[];
}

interface ProductDetailRow extends ProductRow {
    sku?: string;
    taps?: string[];
    specifications?: ProductSpecs;
    allow_deposit: boolean;
    deposit_type?: 'percent' | 'fixed';
    deposit_amount?: number;
    deposit_percentage?: number;
    deposit_due_hours?: number;
    reservation_days?: number;
    reservation_policy_note?: string;
    meta_title?: string;
    meta_description?: string;
    created_at: string;
    published_at?: string;
    product_translations?: Array<ProductTranslationRow & {
        description?: string;
        sound_character?: string;
        recommended_genres?: string[];
        matching_notes?: string;
        condition_notes?: string;
        origin_story?: string;
    }>;
    product_images?: Array<ProductImageRow & {
        id: string;
        sort_order: number;
    }>;
}

/**
 * Products Repository
 * Single source of truth for product data access
 */

/**
 * List products with filters, sorting, and pagination
 */
export async function listProducts(
    params: ListProductsParams
): Promise<ProductListResponse> {
    const {
        locale,
        filters = {},
        sort = 'newest',
        pagination = { page: 1, pageSize: 12 },
    } = params;

    try {
        const supabase = await createClient();

        // Start building the query
        let query = supabase
            .from('products')
            .select(
                `
        id,
        slug,
        price,
        compare_at_price,
        stock_quantity,
        low_stock_threshold,
        condition,
        topology,
        tube_type,
        power_watts,
        min_speaker_sensitivity,
        is_featured,
        is_vintage,
        is_published,
        product_translations!inner(
          name,
          short_description,
          locale
        ),
        product_images!left(
          id,
          storage_path,
          url,
          alt_text,
          sort_order,
          position,
          is_primary
        )
      `,
                { count: 'exact' }
            )
            .eq('is_published', true)
            .eq('product_translations.locale', 'en'); // Always use English for product names

        // Apply filters
        if (filters.topology) {
            const topologies = Array.isArray(filters.topology)
                ? filters.topology
                : [filters.topology];
            query = query.in('topology', topologies);
        }

        if (filters.tubeType) {
            const tubeTypes = Array.isArray(filters.tubeType)
                ? filters.tubeType
                : [filters.tubeType];
            query = query.in('tube_type', tubeTypes);
        }

        if (filters.condition) {
            const conditions = Array.isArray(filters.condition)
                ? filters.condition
                : [filters.condition];
            query = query.in('condition', conditions);
        }

        if (filters.powerMin !== undefined) {
            query = query.gte('power_watts', filters.powerMin);
        }

        if (filters.powerMax !== undefined) {
            query = query.lte('power_watts', filters.powerMax);
        }

        if (filters.priceMin !== undefined) {
            query = query.gte('price', filters.priceMin);
        }

        if (filters.priceMax !== undefined) {
            query = query.lte('price', filters.priceMax);
        }

        if (filters.isVintage !== undefined) {
            query = query.eq('is_vintage', filters.isVintage);
        }

        if (filters.isFeatured !== undefined) {
            query = query.eq('is_featured', filters.isFeatured);
        }

        // Search by name (simple text search)
        if (filters.search) {
            query = query.ilike('product_translations.name', `%${filters.search}%`);
        }

        // Apply sorting
        switch (sort) {
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'featured':
                query = query.order('is_featured', { ascending: false });
                break;
            case 'best_sellers':
                // For MVP, fallback to newest
                // TODO: Implement order count tracking
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Apply pagination
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }

        // Map to DTOs
        const items: ProductCardDTO[] = (data || []).map((product: ProductRow) => {
            const translation = product.product_translations?.[0];
            // Handle both old and new schema
            const primaryImage = product.product_images?.find(
                (img: ProductImageRow) => 
                    (img.sort_order !== undefined && img.sort_order === 0) || 
                    (img.is_primary === true)
            ) || product.product_images?.[0]; // Fallback to first image

            // Determine image URL - prefer storage_path first (most reliable), then url
            // This matches the admin ProductImageManager logic
            let imageUrl = '/images/placeholder-product.jpg';
            if (primaryImage?.storage_path) {
                // Always prefer storage_path - construct URL from it
                imageUrl = getPublicImageUrl(primaryImage.storage_path);
            } else if (primaryImage?.url && primaryImage.url !== '' && (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://'))) {
                // Use url only if it's a valid full URL
                imageUrl = primaryImage.url;
            }

            return {
                id: product.id,
                slug: product.slug,
                name: translation?.name || 'Untitled Product',
                priceVnd: product.price,
                compareAtPriceVnd: product.compare_at_price || undefined,
                imageUrl,
                topology: product.topology as ProductCardDTO['topology'],
                tubeType: product.tube_type as ProductCardDTO['tubeType'],
                powerWatts: product.power_watts,
                recommendedSensitivityMin: product.min_speaker_sensitivity,
                condition: product.condition as ProductCardDTO['condition'],
                isInStock: product.stock_quantity > 0,
                isVintage: product.is_vintage,
                isFeatured: product.is_featured,
            };
        });

        const totalPages = count ? Math.ceil(count / pagination.pageSize) : 0;

        return {
            items,
            total: count || 0,
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages,
        };
    } catch (error) {
        console.error('Repository error in listProducts:', error);
        // Return empty result on error
        return {
            items: [],
            total: 0,
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: 0,
        };
    }
}

/**
 * Get a single product by slug with full details
 */
export async function getProductBySlug(
    slug: string,
    locale: string
): Promise<ProductDetailDTO | null> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('products')
            .select(
                `
        id,
        slug,
        sku,
        price,
        compare_at_price,
        stock_quantity,
        low_stock_threshold,
        condition,
        topology,
        tube_type,
        power_watts,
        taps,
        min_speaker_sensitivity,
        specifications,
        allow_deposit,
        deposit_type,
        deposit_amount,
        deposit_percentage,
        deposit_due_hours,
        reservation_days,
        reservation_policy_note,
        is_featured,
        is_published,
        is_vintage,
        meta_title,
        meta_description,
        created_at,
        published_at,
        product_translations!inner(
          name,
          short_description,
          description,
          sound_character,
          recommended_genres,
          matching_notes,
          condition_notes,
          origin_story,
          locale
        ),
        product_images(
          id,
          storage_path,
          url,
          alt_text,
          sort_order,
          position,
          is_primary
        )
      `
            )
            .eq('slug', slug)
            .eq('is_published', true)
            .eq('product_translations.locale', locale)
            .single();

        if (error || !data) {
            console.error('Error fetching product:', error);
            return null;
        }

        const productData = data as ProductDetailRow;
        const translation = productData.product_translations?.[0];
        
        // Fetch English name separately for product title
        const { data: englishData } = await supabase
            .from('product_translations')
            .select('name')
            .eq('product_id', productData.id)
            .eq('locale', 'en')
            .single();
        
        const englishName = englishData?.name;

        // Map images - handle both old and new schema
        const images: ProductImage[] = (productData.product_images || [])
            .sort((a, b) => {
                // Use sort_order if available, otherwise use position, otherwise use 0
                const aOrder = a.sort_order ?? a.position ?? 0;
                const bOrder = b.sort_order ?? b.position ?? 0;
                return aOrder - bOrder;
            })
            .map((img) => {
                const sortOrder = img.sort_order ?? img.position ?? 0;
                const isPrimary = img.sort_order === 0 || img.is_primary === true;
                
                // Prefer storage_path first (most reliable), then url, then placeholder
                // This matches the admin ProductImageManager logic
                let imageUrl = '';
                if (img.storage_path) {
                    // Always prefer storage_path - construct URL from it
                    imageUrl = getPublicImageUrl(img.storage_path);
                } else if (img.url && img.url !== '' && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
                    // Use url only if it's a valid full URL
                    imageUrl = img.url;
                } else {
                    // Fallback to placeholder
                    imageUrl = '/images/placeholder-product.jpg';
                }
                
                // Debug logging (remove in production)
                if (process.env.NODE_ENV === 'development' && !imageUrl.includes('placeholder')) {
                    console.log(`[Product Image] ID: ${img.id}, URL: ${imageUrl}, Storage Path: ${img.storage_path}, DB URL: ${img.url}`);
                }
                
                return {
                    id: img.id,
                    url: imageUrl,
                    altText: img.alt_text,
                    position: sortOrder,
                    isPrimary,
                };
            });

        // Parse specifications
        const specs: ProductSpecs = productData.specifications || {};

        // Map to DTO
        const product: ProductDetailDTO = {
            id: productData.id,
            slug: productData.slug,
            name: englishName || translation?.name || 'Untitled Product', // Always use English name
            priceVnd: productData.price,
            compareAtPriceVnd: productData.compare_at_price || undefined,
            imageUrl: (() => {
                const primaryImg = images.find((img) => img.isPrimary) || images[0];
                return primaryImg?.url || '/images/placeholder-product.jpg';
            })(),
            topology: productData.topology as ProductCardDTO['topology'],
            tubeType: productData.tube_type as ProductCardDTO['tubeType'],
            powerWatts: productData.power_watts,
            recommendedSensitivityMin: productData.min_speaker_sensitivity,
            condition: productData.condition as ProductCardDTO['condition'],
            isInStock: productData.stock_quantity > 0,
            isVintage: productData.is_vintage,
            isFeatured: productData.is_featured,

            // Detail-specific fields
            shortDescription: translation?.short_description,
            description: translation?.description,
            soundCharacter: translation?.sound_character,
            recommendedGenres: translation?.recommended_genres || [],
            matchingNotes: translation?.matching_notes,
            conditionNotes: translation?.condition_notes,
            originStory: translation?.origin_story,

            images,
            specs,
            taps: productData.taps || [],

            stockQuantity: productData.stock_quantity,
            lowStockThreshold: productData.low_stock_threshold ?? 0,

            allowDeposit: productData.allow_deposit,
            depositType: productData.deposit_type,
            depositAmount: productData.deposit_amount,
            depositPercentage: productData.deposit_percentage,
            depositDueHours: productData.deposit_due_hours,
            reservationPolicyNote: productData.reservation_policy_note,

            metaTitle: productData.meta_title,
            metaDescription: productData.meta_description,

            createdAt: productData.created_at,
            publishedAt: productData.published_at,
        };

        return product;
    } catch (error) {
        console.error('Repository error in getProductBySlug:', error);
        return null;
    }
}

/**
 * Get related products based on topology or tube type
 */
export async function getRelatedProducts(
    productId: string,
    topology: string,
    tubeType: string,
    locale: string,
    limit: number = 3
): Promise<ProductCardDTO[]> {
    try {
        const supabase = await createClient();

        // First, try to get products with matching topology
        const { data: topologyMatches } = await supabase
            .from('products')
            .select(
                `
        id,
        slug,
        price,
        compare_at_price,
        stock_quantity,
        condition,
        topology,
        tube_type,
        power_watts,
        min_speaker_sensitivity,
        is_featured,
        is_vintage,
        product_translations!inner(
          name,
          short_description,
          locale
        ),
        product_images!left(
          id,
          storage_path,
          url,
          alt_text,
          sort_order,
          position,
          is_primary
        )
      `
            )
            .eq('is_published', true)
            .eq('topology', topology)
            .neq('id', productId)
            .eq('product_translations.locale', 'en') // Always use English for product names
            .limit(limit);

        let relatedProducts = topologyMatches || [];

        // If we don't have enough, supplement with tube type matches
        if (relatedProducts.length < limit) {
            const { data: tubeMatches } = await supabase
                .from('products')
                .select(
                    `
          id,
          slug,
          price,
          compare_at_price,
          stock_quantity,
          condition,
          topology,
          tube_type,
          power_watts,
          min_speaker_sensitivity,
          is_featured,
          is_vintage,
          product_translations!inner(
            name,
            short_description,
            locale
          ),
          product_images!left(
            id,
            storage_path,
            url,
            alt_text,
            sort_order,
            position,
            is_primary
          )
        `
                )
                .eq('is_published', true)
                .eq('tube_type', tubeType)
                .neq('id', productId)
                .eq('product_translations.locale', locale)
                .limit(limit - relatedProducts.length);

            // Combine and deduplicate
            const tubeMatchesFiltered = (tubeMatches || []).filter(
                (tm: ProductRow) => !relatedProducts.some((rp: ProductRow) => rp.id === tm.id)
            );
            relatedProducts = [...relatedProducts, ...tubeMatchesFiltered];
        }

        // Map to DTOs
        const items: ProductCardDTO[] = relatedProducts.map((product: ProductRow) => {
            const translation = product.product_translations?.[0];
            // Handle both old and new schema
            const primaryImage = product.product_images?.find(
                (img: ProductImageRow) => 
                    (img.sort_order !== undefined && img.sort_order === 0) || 
                    (img.is_primary === true)
            ) || product.product_images?.[0]; // Fallback to first image

            // Determine image URL - prefer storage_path first (most reliable), then url
            // This matches the admin ProductImageManager logic
            let imageUrl = '/images/placeholder-product.jpg';
            if (primaryImage?.storage_path) {
                // Always prefer storage_path - construct URL from it
                imageUrl = getPublicImageUrl(primaryImage.storage_path);
            } else if (primaryImage?.url && primaryImage.url !== '' && (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://'))) {
                // Use url only if it's a valid full URL
                imageUrl = primaryImage.url;
            }

            return {
                id: product.id,
                slug: product.slug,
                name: translation?.name || 'Untitled Product',
                priceVnd: product.price,
                compareAtPriceVnd: product.compare_at_price || undefined,
                imageUrl,
                topology: product.topology as ProductCardDTO['topology'],
                tubeType: product.tube_type as ProductCardDTO['tubeType'],
                powerWatts: product.power_watts,
                recommendedSensitivityMin: product.min_speaker_sensitivity,
                condition: product.condition as ProductCardDTO['condition'],
                isInStock: product.stock_quantity > 0,
                isVintage: product.is_vintage,
                isFeatured: product.is_featured,
            };
        });

        return items.slice(0, limit);
    } catch (error) {
        console.error('Repository error in getRelatedProducts:', error);
        return [];
    }
}

/**
 * Get unique filter values for UI (optional helper)
 */
export async function getFilterOptions() {
    try {
        const supabase = await createClient();

        const { data: products } = await supabase
            .from('products')
            .select('topology, tube_type, condition')
            .eq('is_published', true);

        if (!products) return null;

        const topologies = [...new Set(products.map((p) => p.topology))];
        const tubeTypes = [...new Set(products.map((p) => p.tube_type))];
        const conditions = [...new Set(products.map((p) => p.condition))];

        return {
            topologies,
            tubeTypes,
            conditions,
        };
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return null;
    }
}
