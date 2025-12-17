import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin/auth';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
    await requireAdmin();
    const t = await getTranslations({ locale: 'vi', namespace: 'admin' });

    return (
        <div>
            <h1>{t('products.add')}</h1>
            <ProductForm />
        </div>
    );
}
