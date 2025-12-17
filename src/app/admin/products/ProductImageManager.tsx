'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getPublicImageUrl } from '@/lib/utils/images';
import Image from 'next/image';
import styles from './ProductImageManager.module.css';

interface ProductImage {
    id: string;
    storage_path: string;
    url: string;
    alt_text?: string;
    sort_order: number;
}

interface ProductImageManagerProps {
    productId: string;
}

export default function ProductImageManager({ productId }: ProductImageManagerProps) {
    const t = useTranslations('admin.products.images');
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingAlt, setEditingAlt] = useState<string | null>(null);
    const [altText, setAltText] = useState('');

    useEffect(() => {
        loadImages();
    }, [productId]);

    const loadImages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${productId}/images`);
            const data = await response.json();
            if (response.ok) {
                setImages(data.images || []);
            } else {
                setError(data.error || 'Failed to load images');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`/api/admin/products/${productId}/images`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (!response.ok) {
                    const errorMsg = data.details 
                        ? `${data.error}: ${data.details}` 
                        : data.error || 'Upload failed';
                    throw new Error(errorMsg);
                }
            }

            // Reload images
            await loadImages();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            console.error('Upload error:', err);
            setError(errorMessage);
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleSetCover = async (imageId: string) => {
        try {
            const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setAsCover: true }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to set cover');
            }

            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set cover');
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm(t('deleteConfirm'))) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleMoveUp = async (imageId: string, currentSort: number) => {
        if (currentSort === 0) return; // Already at top

        try {
            const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sortOrder: currentSort - 1 }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reorder');
            }

            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder');
        }
    };

    const handleMoveDown = async (imageId: string, currentSort: number) => {
        const maxSort = Math.max(...images.map((img) => img.sort_order));
        if (currentSort >= maxSort) return; // Already at bottom

        try {
            const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sortOrder: currentSort + 1 }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reorder');
            }

            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder');
        }
    };

    const startEditAlt = (image: ProductImage) => {
        setEditingAlt(image.id);
        setAltText(image.alt_text || '');
    };

    const saveAltText = async (imageId: string) => {
        try {
            const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ altText }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update alt text');
            }

            setEditingAlt(null);
            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update alt text');
        }
    };

    const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className={styles.imageManager}>
            <div className={styles.header}>
                <h3>{t('title')}</h3>
                <label className="btn btn-primary">
                    {uploading ? t('uploading') : t('upload')}
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>{t('loading')}</div>
            ) : sortedImages.length === 0 ? (
                <div className={styles.empty}>{t('empty')}</div>
            ) : (
                <div className={styles.gallery}>
                    {sortedImages.map((image, index) => {
                        const imageUrl = getPublicImageUrl(image.storage_path || image.url);
                        const isCover = image.sort_order === 0;

                        return (
                            <div key={image.id} className={styles.imageCard}>
                                {isCover && <div className={styles.coverBadge}>{t('cover')}</div>}
                                <div className={styles.imagePreview}>
                                    <Image
                                        src={imageUrl}
                                        alt={image.alt_text || `Product image ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.imageActions}>
                                    <div className={styles.controls}>
                                        <button
                                            onClick={() => handleMoveUp(image.id, image.sort_order)}
                                            disabled={image.sort_order === 0}
                                            className="btn btn-ghost btn-sm"
                                            title={t('moveUp')}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(image.id, image.sort_order)}
                                            disabled={image.sort_order >= sortedImages.length - 1}
                                            className="btn btn-ghost btn-sm"
                                            title={t('moveDown')}
                                        >
                                            ↓
                                        </button>
                                        {!isCover && (
                                            <button
                                                onClick={() => handleSetCover(image.id)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                {t('setCover')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            {t('delete')}
                                        </button>
                                    </div>
                                    <div className={styles.altText}>
                                        {editingAlt === image.id ? (
                                            <div className={styles.altEdit}>
                                                <input
                                                    type="text"
                                                    className="input input-sm"
                                                    value={altText}
                                                    onChange={(e) => setAltText(e.target.value)}
                                                    placeholder={t('altPlaceholder')}
                                                />
                                                <button
                                                    onClick={() => saveAltText(image.id)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    {t('save')}
                                                </button>
                                                <button
                                                    onClick={() => setEditingAlt(null)}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    {t('cancel')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.altDisplay}>
                                                <span>{image.alt_text || t('noAlt')}</span>
                                                <button
                                                    onClick={() => startEditAlt(image)}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    {t('editAlt')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
