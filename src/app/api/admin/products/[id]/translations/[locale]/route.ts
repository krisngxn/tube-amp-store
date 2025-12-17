import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/admin/products/[id]/translations/[locale]
 * Get product translation for a specific locale
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; locale: string }> }
) {
    try {
        const user = await getAdminUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, locale } = await params;
        const supabase = createServiceClient();

        const { data, error } = await supabase
            .from('product_translations')
            .select('*')
            .eq('product_id', id)
            .eq('locale', locale)
            .single();

        if (error || !data) {
            return NextResponse.json({});
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching translation:', error);
        return NextResponse.json({});
    }
}

