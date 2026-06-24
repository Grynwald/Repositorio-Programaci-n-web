'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '../../src/lib/supabaseClient.js';
import NavPublica from '../../src/components/NavPublica.jsx';
import Footer from '../../src/components/Footer.jsx';

function PagoCompletadoContenido() {
    const searchParams = useSearchParams();
    const paymentId   = searchParams.get('payment_id');
    const externalRef = searchParams.get('external_reference');
    const [confirmado, setConfirmado] = useState(false);

    useEffect(() => {
        if (!paymentId || !externalRef) return;

        async function confirmarPago() {
            const { data } = await supabaseBrowser.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            await fetch('/api/pagos/confirmar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ payment_id: paymentId, orden_id: Number(externalRef) })
            });
            setConfirmado(true);
        }

        confirmarPago();
    }, [paymentId, externalRef]);

    return (
        <main id="contenido-principal" className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido resultado-pago resultado-pago-borde-top exitoso">
                    <p className="resultado-pago-icono">✓</p>
                    <h1 className="resultado-pago-titulo exitoso">¡Pago completado!</h1>
                    <p>Tu pago fue aprobado exitosamente.</p>

                    {paymentId && (
                        <div className="resultado-pago-info">
                            <p><strong>ID de pago:</strong> {paymentId}</p>
                            {externalRef && <p><strong>Orden #:</strong> {externalRef}</p>}
                        </div>
                    )}

                    <div className="resultado-pago-acciones">
                        <a className="btn-finalizar btn-pago-accion" href="/ordenes">Ver mis órdenes</a>
                        <a className="btn-secundario" href="/">Seguir comprando</a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PagoCompletado() {
    return (
        <>
            <NavPublica />
            <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando...</div>}>
                <PagoCompletadoContenido />
            </Suspense>
            <Footer />
        </>
    );
}
