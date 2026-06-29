import { requireAdmin } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function GET(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const { data, error: dbError } = await supabase
        .from('pedidos')
        .select('id, nombre, email, telefono, direccion, total, estado, productos, creado_en')
        .order('creado_en', { ascending: false });

    if (dbError) return errorResponse(dbError.message, 'DB_ERROR', 500);
    return successResponse(data);
}
