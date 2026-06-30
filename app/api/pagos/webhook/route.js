import { createClient } from '@supabase/supabase-js';

export async function GET() {
    return Response.json({ ok: true });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));

        const paymentId = body.data?.id
            ? String(body.data.id)
            : body.resource
            ? String(body.resource).split('/').pop()
            : null;

        if (!paymentId || (body.type !== 'payment' && body.topic !== 'payment')) {
            return Response.json({ ok: true }, { status: 200 });
        }

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
        });

        if (!mpRes.ok) return Response.json({ ok: true }, { status: 200 });

        const pago     = await mpRes.json();
        const ordenId  = Number(pago.external_reference);
        const status   = pago.status;

        if (!ordenId || isNaN(ordenId)) return Response.json({ ok: true }, { status: 200 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        if (status === 'approved') {
            await supabase
                .from('pedidos')
                .update({ estado: 'pagada', referencia_pago: paymentId })
                .eq('id', ordenId)
                .eq('estado', 'pendiente');
        } else if (status === 'rejected' || status === 'cancelled') {
            // Cancela el pedido y restaura el stock en una sola transacción
            await supabase.rpc('cancelar_pedido_y_restaurar_stock', {
                p_pedido_id:  ordenId,
                p_referencia: paymentId
            });
        }

        return Response.json({ ok: true }, { status: 200 });
    } catch {
        return Response.json({ ok: false }, { status: 200 });
    }
}
