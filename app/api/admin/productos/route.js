import { requireAdmin } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function GET(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const { data, error: dbError } = await supabase
        .from('productos')
        .select('id, nombre, categoria, precio, stock')
        .order('categoria');

    if (dbError) return errorResponse(dbError.message, 'DB_ERROR', 500);
    return successResponse(data);
}

export async function PATCH(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const id    = body.id;
    const stock = Number(body.stock);

    if (!id || isNaN(stock) || stock < 0) {
        return errorResponse('Datos inválidos', 'INVALID_DATA', 400);
    }

    const { error: dbError } = await supabase
        .from('productos')
        .update({ stock })
        .eq('id', id);

    if (dbError) return errorResponse(dbError.message, 'DB_ERROR', 500);
    return successResponse({ ok: true });
}
