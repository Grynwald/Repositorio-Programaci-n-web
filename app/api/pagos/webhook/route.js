import { createClient } from '@supabase/supabase-js';

export async function GET() {
    return Response.json({ ok: true });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));

        if (body.type !== 'payment' || !body.data?.id) {
            return Response.json({ ok: true }, { status: 200 });
        }

        const paymentId = String(body.data.id);

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
        });

        if (!mpRes.ok) return Response.json({ ok: true }, { status: 200 });

        const pago = await mpRes.json();
        const ordenId = Number(pago.external_reference);
        const status  = pago.status;

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
