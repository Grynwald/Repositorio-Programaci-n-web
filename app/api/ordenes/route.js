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

        // Obtener items del carrito desde la DB
        const { data: carritoItems } = await supabaseServer
            .from('carrito')
            .select('cantidad, producto:productos(id, nombre, precio, stock)')
            .eq('usuario_id', user.id);

        const itemsDB = (carritoItems || []).filter(item => item.producto);

        // Si el carrito en DB está vacío, usar los items enviados desde el frontend
        const itemsBody = Array.isArray(body.items) ? body.items : [];

        const productosJson = itemsDB.length > 0
            ? itemsDB.map(item => ({
                id:       item.producto.id,
                nombre:   item.producto.nombre,
                precio:   item.producto.precio,
                cantidad: item.cantidad
              }))
            : itemsBody.filter(i => i.id && i.nombre && i.precio > 0 && i.cantidad > 0);

        if (productosJson.length === 0) {
            return errorResponse('El carrito está vacío', 'EMPTY_CART', 400);
        }

        // Validar stock contra la DB para los items que vinieron de DB
        for (const item of itemsDB) {
            if (typeof item.producto.stock === 'number' && item.producto.stock < item.cantidad) {
                return errorResponse(`Stock insuficiente para ${item.producto.nombre}`, 'INSUFFICIENT_STOCK', 400);
            }
        }

        const total = productosJson.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

        // Crear el pedido
        const { data: pedido, error: pedidoError } = await supabaseServer
            .from('pedidos')
            .insert({
                usuario_id: user.id,
                nombre, telefono, email, direccion, entrega, pago,
                comentarios,
                total,
                productos: productosJson,
                estado: 'pendiente'
            })
            .select('id')
            .single();

        if (pedidoError || !pedido) {
            return errorResponse(pedidoError?.message || 'No se pudo crear el pedido', 'ORDER_CREATE_ERROR', 500);
        }

        // Vaciar el carrito
        await supabaseServer.from('carrito').delete().eq('usuario_id', user.id);

        return successResponse({ id: pedido.id, total, estado: 'pendiente' }, 201);
    } catch {
        return errorResponse('Error al crear la orden', 'ORDER_CREATE_ERROR', 500);
    }
}
