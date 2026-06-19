import { errorResponse, successResponse } from '../_utils/responses.js';
import { sanitizar, validarCantidad } from '../_utils/validation.js';
import { requireUser } from '../_utils/auth.js';
import { productos as productosLocales } from '../../../src/data/productos.js';

const productosPlanos = productosLocales.flatMap(cat => cat.items);

function buscarProductoLocal(id) {
    return productosPlanos.find(p => String(p.id) === String(id)) ?? null;
}

export async function GET(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const { data, error: carritoError } = await supabaseServer
            .from('carrito')
            .select('producto_id, cantidad')
            .eq('usuario_id', user.id);

        if (carritoError) {
            return errorResponse(carritoError.message, 'CART_ERROR', 500);
        }

        const carrito = data
            .map(item => {
                const producto = buscarProductoLocal(item.producto_id);
                if (!producto) return null;
                return { ...producto, cantidad: item.cantidad };
            })
            .filter(Boolean);

        return successResponse(carrito);
    } catch {
        return errorResponse('Error al obtener el carrito', 'CART_ERROR', 500);
    }
}

export async function POST(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const body = await request.json();
        const productoId = sanitizar(body.producto_id);
        const cantidad = Number(body.cantidad);

        if (!productoId || !validarCantidad(cantidad)) {
            return errorResponse('Producto o cantidad invalida', 'INVALID_CART_ITEM', 400);
        }

        const producto = buscarProductoLocal(productoId);

        if (!producto) {
            return errorResponse('Producto no encontrado', 'PRODUCT_NOT_FOUND', 404);
        }

        const { data: existente } = await supabaseServer
            .from('carrito')
            .select('cantidad')
            .eq('usuario_id', user.id)
            .eq('producto_id', productoId)
            .maybeSingle();

        const cantidadFinal = existente ? existente.cantidad + cantidad : cantidad;

        const { error: upsertError } = await supabaseServer
            .from('carrito')
            .upsert(
                { usuario_id: user.id, producto_id: productoId, cantidad: cantidadFinal },
                { onConflict: 'usuario_id,producto_id' }
            );

        if (upsertError) {
            return errorResponse(upsertError.message, 'CART_UPDATE_ERROR', 500);
        }

        return successResponse({ ...producto, cantidad: cantidadFinal }, 201);
    } catch {
        return errorResponse('Error al agregar al carrito', 'CART_ERROR', 500);
    }
}

export async function PUT(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const body = await request.json();
        const productoId = sanitizar(body.producto_id);
        const cantidad = Number(body.cantidad);

        if (!productoId || !validarCantidad(cantidad)) {
            return errorResponse('Producto o cantidad invalida', 'INVALID_CART_ITEM', 400);
        }

        const producto = buscarProductoLocal(productoId);

        if (!producto) {
            return errorResponse('Producto no encontrado', 'PRODUCT_NOT_FOUND', 404);
        }

        const { error: updateError } = await supabaseServer
            .from('carrito')
            .update({ cantidad })
            .eq('usuario_id', user.id)
            .eq('producto_id', productoId);

        if (updateError) {
            return errorResponse(updateError.message, 'CART_UPDATE_ERROR', 500);
        }

        return successResponse({ ...producto, cantidad });
    } catch {
        return errorResponse('Error al actualizar el carrito', 'CART_ERROR', 500);
    }
}

export async function DELETE(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const body = await request.json().catch(() => ({}));
        const productoId = sanitizar(body.producto_id);

        if (productoId) {
            const { error: deleteError } = await supabaseServer
                .from('carrito')
                .delete()
                .eq('usuario_id', user.id)
                .eq('producto_id', productoId);

            if (deleteError) {
                return errorResponse(deleteError.message, 'CART_DELETE_ERROR', 500);
            }

            return successResponse(null);
        }

        const { error: clearError } = await supabaseServer
            .from('carrito')
            .delete()
            .eq('usuario_id', user.id);

        if (clearError) {
            return errorResponse(clearError.message, 'CART_DELETE_ERROR', 500);
        }

        return successResponse(null);
    } catch {
        return errorResponse('Error al vaciar el carrito', 'CART_ERROR', 500);
    }
}
