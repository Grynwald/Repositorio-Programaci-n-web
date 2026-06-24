import { requireUser } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';
import { client, Preference } from '../../../../src/lib/mercadopago.js';

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

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

        const preference = new Preference(client);
        const resultado = await preference.create({
            body: {
                items: pedido.productos.map(item => ({
                    id:          String(item.id),
                    title:       item.nombre,
                    description: `Cantidad: ${item.cantidad}`,
                    quantity:    Number(item.cantidad),
                    unit_price:  Math.round(Number(item.precio)),
                    currency_id: 'ARS'
                })),
                external_reference: String(pedido.id),
                back_urls: {
                    success: `${siteUrl}/pago-completado`,
                    failure: `${siteUrl}/pago-fallido`,
                    pending: `${siteUrl}/pago-pendiente`
                },
                auto_return: 'approved'
            }
        });

        const initPoint = resultado.init_point;

        return successResponse({ init_point: initPoint, pedido_id: pedido.id });
    } catch (err) {
        return errorResponse(err?.message || 'Error al crear la preferencia de pago', 'PAYMENT_ERROR', 500);
    }
}
