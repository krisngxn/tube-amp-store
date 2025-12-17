import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { adminUpdateProduct } from '@/lib/repositories/admin/products';

/**
 * PUT /api/admin/products/[id]
 * Update an existing product
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        await adminUpdateProduct({ ...body, id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to update product',
            },
            { status: 500 }
        );
    }
}

