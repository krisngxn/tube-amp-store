'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/lib/types/catalog';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
    images: ProductImage[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());


    // If no images, show placeholder
    if (!images || images.length === 0) {
        console.log('[ProductGallery] No images, showing placeholder');
        return (
            <div className={styles.productGallery}>
                <div className={`${styles.galleryMain} skeleton`} style={{ aspectRatio: '4/3' }} />
            </div>
        );
    }

    // Filter out images with empty URLs
    const validImages = images.filter(img => {
        const isValid = img.url && img.url !== '' && img.url !== '/images/placeholder-product.jpg';
        if (!isValid) {
            console.log('[ProductGallery] Filtered out invalid image:', img);
        }
        return isValid;
    });
    
    console.log('[ProductGallery] Valid images count:', validImages.length);
    
    if (validImages.length === 0) {
        console.log('[ProductGallery] No valid images, showing placeholder');
        return (
            <div className={styles.productGallery}>
                <div className={`${styles.galleryMain} skeleton`} style={{ aspectRatio: '4/3' }} />
            </div>
        );
    }

    const activeImage = validImages[activeIndex] || validImages[0];
    
    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set(prev).add(index));
    };

    return (
        <div className={styles.productGallery}>
            {/* Main Image */}
            <div className={styles.galleryMain}>
                {!imageErrors.has(activeIndex) ? (
                    <>
                        {/* Try Next.js Image first */}
                        <Image
                            src={activeImage.url}
                            alt={activeImage.altText || `${productName} - Image ${activeIndex + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority={activeIndex === 0}
                            onError={() => handleImageError(activeIndex)}
                            unoptimized={true}
                        />
                    </>
                ) : (
                    <div className="skeleton w-full h-full" />
                )}
            </div>

            {/* Thumbnails */}
            {validImages.length > 1 && (
                <div className={styles.galleryThumbs}>
                    {validImages.map((image, index) => (
                        <button
                            key={image.id}
                            className={`${styles.galleryThumb} ${index === activeIndex ? styles.galleryThumbActive : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`View image ${index + 1}`}
                        >
                            {!imageErrors.has(index) ? (
                                <Image
                                    src={image.url}
                                    alt={image.altText || `${productName} - Thumbnail ${index + 1}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={() => handleImageError(index)}
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="skeleton w-full h-full" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
