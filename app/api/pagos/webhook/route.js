import { createClient } from '@supabase/supabase-js';

export async function GET() {
    return Response.json({ ok: true });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));

        console.log('[Webhook] body:', JSON.stringify(body));

        const paymentId = body.data?.id
            ? String(body.data.id)
            : body.resource
            ? String(body.resource).split('/').pop()
            : null;

        if (!paymentId || (body.type !== 'payment' && body.topic !== 'payment')) {
            console.log('[Webhook] ignorado - type:', body.type, 'topic:', body.topic);
            return Response.json({ ok: true }, { status: 200 });
        }

        console.log('[Webhook] procesando payment_id:', paymentId);

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
        });

        if (!mpRes.ok) {
            console.log('[Webhook] error al consultar MP:', mpRes.status);
            return Response.json({ ok: true }, { status: 200 });
        }

        const pago = await mpRes.json();
        const ordenId = Number(pago.external_reference);
        const status  = pago.status;

        console.log('[Webhook] pago status:', status, 'orden_id:', ordenId);

        if (!ordenId || isNaN(ordenId)) return Response.json({ ok: true }, { status: 200 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        let nuevoEstado = null;
        if (status === 'approved')                          nuevoEstado = 'pagada';
        else if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'cancelada';

        if (nuevoEstado) {
            await supabase
                .from('pedidos')
                .update({ estado: nuevoEstado, referencia_pago: paymentId })
                .eq('id', ordenId)
                .eq('estado', 'pendiente');
        }

        return Response.json({ ok: true }, { status: 200 });
    } catch {
        return Response.json({ ok: false }, { status: 200 });
    }
}
