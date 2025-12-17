import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { adminCreateProduct } from '@/lib/repositories/admin/products';

/**
 * POST /api/admin/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const productId = await adminCreateProduct(body);

        return NextResponse.json({ success: true, id: productId });
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

