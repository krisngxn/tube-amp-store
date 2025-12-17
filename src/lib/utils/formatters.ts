/**
 * Utility functions for formatting product data
 */

import type { ProductDetailDTO } from '@/lib/types/catalog';

/**
 * Format price with locale-specific currency symbol
 * Note: All prices are stored in VND, we just change the symbol
 */
export function formatPrice(amount: number, locale: string): string {
    const symbol = locale === 'vi' ? '₫' : '$';

    // Format with thousands separators
    const formatted = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount);

    return `${formatted}${symbol}`;
}

/**
 * Determine stock status based on quantity and threshold
 */
export function formatStockStatus(
    quantity: number,
    threshold: number
): 'in_stock' | 'limited' | 'out_of_stock' {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= threshold) return 'limited';
    return 'in_stock';
}

/**
 * Generate summary bullets from product data
 * Creates 3-4 key selling points
 */
export function generateSummaryBullets(product: ProductDetailDTO, locale: string): string[] {
    const bullets: string[] = [];

    // Use short description if available
    if (product.shortDescription) {
        return product.shortDescription.split('\n').filter(Boolean).slice(0, 4);
    }

    // Otherwise generate from product specs
    if (product.topology && product.tubeType) {
        const topologyLabel = product.topology === 'se' ? 'Single-Ended' : 'Push-Pull';
        bullets.push(
            locale === 'vi'
                ? `Topology ${topologyLabel} ${product.tubeType} cho âm thanh tinh khiết`
                : `${topologyLabel} ${product.tubeType} topology for pure sound`
        );
    }

    if (product.powerWatts) {
        bullets.push(
            locale === 'vi'
                ? `Công suất ${product.powerWatts}W, phù hợp với loa độ nhạy cao`
                : `${product.powerWatts}W output power, perfect for high-sensitivity speakers`
        );
    }

    if (product.condition === 'vintage') {
        bullets.push(
            locale === 'vi'
                ? 'Vintage chính hãng, đã kiểm tra kỹ lưỡng'
                : 'Authentic vintage, thoroughly tested'
        );
    } else if (product.condition === 'new') {
        bullets.push(
            locale === 'vi'
                ? 'Sản phẩm mới 100%, chưa qua sử dụng'
                : 'Brand new, never used'
        );
    }

    if (product.taps && product.taps.length > 0) {
        bullets.push(
            locale === 'vi'
                ? `Đa dạng cổng loa: ${product.taps.join(', ')}`
                : `Multiple speaker taps: ${product.taps.join(', ')}`
        );
    }

    return bullets.slice(0, 4);
}

/**
 * Format warranty period
 */
export function formatWarranty(months: number | null | undefined, locale: string): string {
    if (!months) return locale === 'vi' ? 'Không có bảo hành' : 'No warranty';

    if (months === 12) {
        return locale === 'vi' ? '1 năm' : '1 year';
    }

    if (months % 12 === 0) {
        const years = months / 12;
        return locale === 'vi' ? `${years} năm` : `${years} year${years > 1 ? 's' : ''}`;
    }

    return locale === 'vi' ? `${months} tháng` : `${months} month${months > 1 ? 's' : ''}`;
}

/**
 * Format return period
 */
export function formatReturnPeriod(days: number | null | undefined, locale: string): string {
    if (!days) return locale === 'vi' ? 'Không đổi trả' : 'No returns';

    return locale === 'vi' ? `${days} ngày` : `${days} day${days > 1 ? 's' : ''}`;
}
