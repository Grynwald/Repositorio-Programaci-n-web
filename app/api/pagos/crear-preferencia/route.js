import { requireUser } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function POST(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    try {
        const body = await request.json();
        const ordenId = Number(body.orden_id);

        if (!ordenId || isNaN(ordenId)) {
            return errorResponse('ID de orden invalido', 'INVALID_ORDER_ID', 400);
        }

        const { data: pedido, error: pedidoError } = await supabaseServer
            .from('pedidos')
            .select('id, total, estado, productos, email')
            .eq('id', ordenId)
            .eq('usuario_id', user.id)
            .single();

        if (pedidoError || !pedido) {
            return errorResponse('Orden no encontrada', 'ORDER_NOT_FOUND', 404);
        }

        if (pedido.estado !== 'pendiente') {
            return errorResponse('La orden ya fue procesada', 'ORDER_ALREADY_PROCESSED', 400);
        }

        if (!pedido.productos || pedido.productos.length === 0) {
            return errorResponse('La orden no tiene productos', 'EMPTY_ORDER', 400);
        }

        // Estructura de preferencia para Mercado Pago
        // Semana 13: se pasará al SDK de MP para obtener el init_point real
        const preferencia = {
            items: pedido.productos.map(item => ({
                title:      item.nombre,
                quantity:   item.cantidad,
                unit_price: item.precio,
                currency_id: 'ARS'
            })),
            payer: {
                email: user.email
            },
            external_reference: String(pedido.id),
            notification_url:   `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/pagos/webhook`,
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/ordenes`,
                failure: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/checkout?orden_id=${pedido.id}`,
                pending: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/ordenes`
            }
        };

        return successResponse({ preferencia, pedido_id: pedido.id });
    } catch {
        return errorResponse('Error al crear la preferencia de pago', 'PAYMENT_ERROR', 500);
    }
}
