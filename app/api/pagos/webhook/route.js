// Semana 14: implementación completa con verificación de firma y actualización de orden

export async function GET() {
    return Response.json({ ok: true });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        console.log('[Webhook MP]', body);
        // Semana 14: verificar firma, consultar pago y actualizar estado de orden
        return Response.json({ ok: true }, { status: 200 });
    } catch {
        return Response.json({ ok: false }, { status: 200 });
    }
}
