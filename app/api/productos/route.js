import { createSupabaseServerClient, supabaseServerConfigurado } from '../../../src/lib/supabaseServer.js';
import { errorResponse, successResponse } from '../_utils/responses.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!supabaseServerConfigurado) {
        return errorResponse('Supabase no esta configurado', 'SUPABASE_NOT_CONFIGURED', 500);
    }

    const supabase = createSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('productos')
            .select('id, categoria, titulo_categoria, nombre, descripcion, precio, imagen, alt, stock');

        if (error) {
            return errorResponse(error.message, 'PRODUCTS_ERROR', 500);
        }

        return successResponse(data ?? []);
    } catch {
        return errorResponse('Error al obtener productos', 'PRODUCTS_ERROR', 500);
    }
}
