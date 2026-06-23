import { requireUser } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function POST(request) {
    const { user, supabaseServer, error } = await requireUser(request);
    if (error) return error;

    try {
        const body = await request.json();
        const ordenId  = Number(body.orden_id);
        const paymentId = String(body.payment_id || '');

        if (!ordenId || isNaN(ordenId)) {
            return errorResponse('ID de orden inválido', 'INVALID_ORDER_ID', 400);
        }

        const { data: pedido, error: pedidoError } = await supabaseServer
            .from('pedidos')
            .select('id, estado, usuario_id')
            .eq('id', ordenId)
            .eq('usuario_id', user.id)
            .single();

        if (pedidoError || !pedido) {
            return errorResponse('Orden no encontrada', 'ORDER_NOT_FOUND', 404);
        }

        if (pedido.estado !== 'pendiente') {
            return successResponse({ estado: pedido.estado });
        }

        const { error: updateError } = await supabaseServer
            .from('pedidos')
            .update({ estado: 'pagada', referencia_pago: paymentId })
            .eq('id', ordenId)
            .eq('usuario_id', user.id);

        if (updateError) {
            return errorResponse('No se pudo actualizar la orden', 'UPDATE_ERROR', 500);
        }

        return successResponse({ estado: 'pagada' });
    } catch (err) {
        return errorResponse(err?.message || 'Error al confirmar el pago', 'CONFIRM_ERROR', 500);
    }
}
