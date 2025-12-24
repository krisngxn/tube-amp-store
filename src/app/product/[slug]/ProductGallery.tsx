'use client';

import { useState, useEffect } from 'react';
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
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Filter out images with empty URLs
    const validImages = images.filter(img => {
        const isValid = img.url && img.url !== '' && img.url !== '/images/placeholder-product.jpg';
        return isValid;
    });

    // Handle keyboard navigation in lightbox
    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxOpen(false);
            } else if (e.key === 'ArrowLeft') {
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
            } else if (e.key === 'ArrowRight') {
                setLightboxIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, validImages.length]);


    // If no images, show placeholder
    if (!images || images.length === 0) {
        console.log('[ProductGallery] No images, showing placeholder');
        return (
            <div className={styles.productGallery}>
                <div className={`${styles.galleryMain} skeleton`} style={{ aspectRatio: '4/3' }} />
            </div>
        );
    }

    if (validImages.length === 0) {
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

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateLightbox = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setLightboxIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
        } else {
            setLightboxIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
        }
    };

    return (
        <>
            <div className={styles.productGallery}>
                {/* Main Image */}
                <div 
                    className={styles.galleryMain}
                    onClick={() => openLightbox(activeIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label="Click to view full size image"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openLightbox(activeIndex);
                        }
                    }}
                >
                    {!imageErrors.has(activeIndex) ? (
                        <>
                            <Image
                                src={activeImage.url}
                                alt={activeImage.altText || `${productName} - Image ${activeIndex + 1}`}
                                fill
                                style={{ objectFit: 'cover', cursor: 'pointer' }}
                                priority={activeIndex === 0}
                                onError={() => handleImageError(activeIndex)}
                                unoptimized={true}
                            />
                            {validImages.length > 1 && (
                                <div className={styles.zoomHint}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            )}
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

            {/* Lightbox Modal */}
            {lightboxOpen && validImages.length > 0 && (
                <div 
                    className={styles.lightbox}
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image gallery lightbox"
                >
                    <button
                        className={styles.lightboxClose}
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                    >
                        ×
                    </button>
                    <button
                        className={styles.lightboxPrev}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateLightbox('prev');
                        }}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                    <div 
                        className={styles.lightboxContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={validImages[lightboxIndex].url}
                            alt={validImages[lightboxIndex].altText || `${productName} - Image ${lightboxIndex + 1}`}
                            fill
                            style={{ objectFit: 'contain' }}
                            priority={false}
                            unoptimized={true}
                        />
                        {validImages.length > 1 && (
                            <div className={styles.lightboxCounter}>
                                {lightboxIndex + 1} / {validImages.length}
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.lightboxNext}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateLightbox('next');
                        }}
                        aria-label="Next image"
                    >
                        ›
                    </button>
                </div>
            )}
        </>
    );
}
