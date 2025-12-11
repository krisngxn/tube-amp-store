import { createClient } from '@/lib/supabase/server';
import type {
    ProductCardDTO,
    ProductDetailDTO,
    ProductListResponse,
    ListProductsParams,
    ProductImage,
    ProductSpecs,
} from '@/lib/types/catalog';

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
          url,
          alt_text,
          is_primary
        )
      `,
                { count: 'exact' }
            )
            .eq('is_published', true)
            .eq('product_translations.locale', locale);

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
        const items: ProductCardDTO[] = (data || []).map((product: any) => {
            const translation = product.product_translations?.[0];
            const primaryImage = product.product_images?.find(
                (img: any) => img.is_primary
            );

            return {
                id: product.id,
                slug: product.slug,
                name: translation?.name || 'Untitled Product',
                priceVnd: product.price,
                compareAtPriceVnd: product.compare_at_price || undefined,
                imageUrl: primaryImage?.url || '/images/placeholder-product.jpg',
                topology: product.topology,
                tubeType: product.tube_type,
                powerWatts: product.power_watts,
                recommendedSensitivityMin: product.min_speaker_sensitivity,
                condition: product.condition,
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
        deposit_amount,
        deposit_percentage,
        reservation_days,
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
          url,
          alt_text,
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

        const translation = data.product_translations?.[0];

        // Map images
        const images: ProductImage[] = (data.product_images || [])
            .sort((a: any, b: any) => a.position - b.position)
            .map((img: any) => ({
                id: img.id,
                url: img.url,
                altText: img.alt_text,
                position: img.position,
                isPrimary: img.is_primary,
            }));

        // Parse specifications
        const specs: ProductSpecs = data.specifications || {};

        // Map to DTO
        const product: ProductDetailDTO = {
            id: data.id,
            slug: data.slug,
            name: translation?.name || 'Untitled Product',
            priceVnd: data.price,
            compareAtPriceVnd: data.compare_at_price || undefined,
            imageUrl: images.find((img) => img.isPrimary)?.url || images[0]?.url || '/images/placeholder-product.jpg',
            topology: data.topology,
            tubeType: data.tube_type,
            powerWatts: data.power_watts,
            recommendedSensitivityMin: data.min_speaker_sensitivity,
            condition: data.condition,
            isInStock: data.stock_quantity > 0,
            isVintage: data.is_vintage,
            isFeatured: data.is_featured,

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
            taps: data.taps || [],

            stockQuantity: data.stock_quantity,
            lowStockThreshold: data.low_stock_threshold,

            allowDeposit: data.allow_deposit,
            depositAmount: data.deposit_amount,
            depositPercentage: data.deposit_percentage,
            reservationDays: data.reservation_days,

            metaTitle: data.meta_title,
            metaDescription: data.meta_description,

            createdAt: data.created_at,
            publishedAt: data.published_at,
        };

        return product;
    } catch (error) {
        console.error('Repository error in getProductBySlug:', error);
        return null;
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
