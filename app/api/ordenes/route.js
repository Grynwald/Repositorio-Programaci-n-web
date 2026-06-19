import { errorResponse, successResponse } from '../_utils/responses.js';
import { sanitizar, validarEmail } from '../_utils/validation.js';
import { requireUser } from '../_utils/auth.js';

export async function GET(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const { data, error: ordenesError } = await supabaseServer
            .from('pedidos')
            .select('id, nombre, email, entrega, pago, total, productos, creado_en, estado')
            .eq('usuario_id', user.id)
            .order('creado_en', { ascending: false });

        if (ordenesError) {
            return errorResponse(ordenesError.message, 'ORDERS_ERROR', 500);
        }

        return successResponse(data);
    } catch {
        return errorResponse('Error al obtener ordenes', 'ORDERS_ERROR', 500);
    }
}

export async function POST(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const body = await request.json();
        const nombre = sanitizar(body.nombre);
        const telefono = sanitizar(body.telefono);
        const email = sanitizar(body.email);
        const direccion = sanitizar(body.direccion);
        const entrega = sanitizar(body.entrega);
        const pago = sanitizar(body.pago);
        const comentarios = sanitizar(body.comentarios || '', 500) || null;

        if (!nombre || !telefono || !validarEmail(email) || !direccion || !entrega || !pago) {
            return errorResponse('Datos de compra invalidos o incompletos', 'INVALID_ORDER_DATA', 400);
        }

        // Stored procedure: valida stock, crea pedido, descuenta stock y vacía carrito en una sola transacción
        const { data, error: rpcError } = await supabaseServer.rpc('crear_pedido_completo', {
            p_usuario_id:  user.id,
            p_nombre:      nombre,
            p_telefono:    telefono,
            p_email:       email,
            p_direccion:   direccion,
            p_entrega:     entrega,
            p_pago:        pago,
            p_comentarios: comentarios
        });

        if (rpcError) {
            return errorResponse(rpcError.message || 'No se pudo crear el pedido', 'ORDER_CREATE_ERROR', 500);
        }

        const resultado = Array.isArray(data) ? data[0] : data;

        if (!resultado?.ok) {
            const mensaje = resultado?.mensaje || 'No se pudo crear el pedido';
            const esCarritoVacio = mensaje.toLowerCase().includes('vacío') || mensaje.toLowerCase().includes('vacio');
            return errorResponse(mensaje, esCarritoVacio ? 'EMPTY_CART' : 'ORDER_CREATE_ERROR', 400);
        }

        return successResponse({ id: resultado.pedido_id, total: resultado.total_calculado, estado: 'pendiente' }, 201);
    } catch {
        return errorResponse('Error al crear la orden', 'ORDER_CREATE_ERROR', 500);
    }
}
