import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin/auth';
import { adminGetProductById } from '@/lib/repositories/admin/products';
import ProductForm from '../ProductForm';

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    await requireAdmin();
    const t = await getTranslations({ locale: 'vi', namespace: 'admin' });

    const product = await adminGetProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <div>
            <h1>{t('products.edit')}: {product.name}</h1>
            <ProductForm product={product} />
        </div>
    );
}
