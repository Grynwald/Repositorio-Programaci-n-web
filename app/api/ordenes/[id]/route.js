import { requireUser } from '../../_utils/auth.js';
import { errorResponse, successResponse } from '../../_utils/responses.js';

export async function GET(request, { params }) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return error;
    }

    const { id } = await params;

    try {
        const { data, error: pedidoError } = await supabaseServer
            .from('pedidos')
            .select('id, nombre, email, entrega, pago, total, productos, creado_en, estado, metodo_pago, referencia_pago, pagado_en')
            .eq('id', id)
            .eq('usuario_id', user.id)
            .single();

        if (pedidoError || !data) {
            return errorResponse('Orden no encontrada', 'ORDER_NOT_FOUND', 404);
        }

        return successResponse(data);
    } catch {
        return errorResponse('Error al obtener la orden', 'ORDERS_ERROR', 500);
    }
}
