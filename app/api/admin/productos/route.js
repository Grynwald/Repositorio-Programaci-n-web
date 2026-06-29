import { requireAdmin } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function GET(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const { data, error: dbError } = await supabase
        .from('productos')
        .select('id, nombre, categoria, titulo_categoria, descripcion, precio, imagen, alt, stock')
        .order('categoria');

    if (dbError) return errorResponse(dbError.message, 'DB_ERROR', 500);
    return successResponse(data);
}

export async function POST(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const { id, categoria, titulo_categoria, nombre, descripcion, precio, imagen, alt, stock } = body;

    if (!id || !categoria || !titulo_categoria || !nombre || !precio) {
        return errorResponse('Faltan campos obligatorios (id, categoría, nombre, precio)', 'INVALID_DATA', 400);
    }

    if (!/^[a-z0-9-]+$/.test(id)) {
        return errorResponse('El ID solo puede tener letras minúsculas, números y guiones', 'INVALID_DATA', 400);
    }

    const { error: dbError } = await supabase
        .from('productos')
        .insert({
            id,
            categoria,
            titulo_categoria,
            nombre,
            descripcion: descripcion || null,
            precio: Number(precio),
            imagen: imagen || null,
            alt: alt || null,
            stock: stock !== '' && stock != null ? Number(stock) : null
        });

    if (dbError) {
        const msg = dbError.code === '23505' ? 'Ya existe un producto con ese ID' : dbError.message;
        return errorResponse(msg, 'DB_ERROR', 500);
    }

    return successResponse({ ok: true }, 201);
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

export async function DELETE(request) {
    const { supabase, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const id = body.id;

    if (!id) return errorResponse('ID requerido', 'INVALID_DATA', 400);

    const { error: dbError } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

    if (dbError) return errorResponse(dbError.message, 'DB_ERROR', 500);
    return successResponse({ ok: true });
}
