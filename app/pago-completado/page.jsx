'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PagoCompletadoContenido() {
    const searchParams = useSearchParams();
    const paymentId       = searchParams.get('payment_id');
    const externalRef     = searchParams.get('external_reference');

    return (
        <main className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '6px solid #27ae60' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</p>
                    <h1 style={{ color: '#27ae60', marginBottom: '12px' }}>¡Pago completado!</h1>
                    <p style={{ color: 'var(--color-texto-suave)', marginBottom: '24px' }}>
                        Tu pago fue aprobado exitosamente.
                    </p>

                    {paymentId && (
                        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                            <p><strong>ID de pago:</strong> {paymentId}</p>
                            {externalRef && <p><strong>Orden #:</strong> {externalRef}</p>}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a className="btn-finalizar" href="/ordenes" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                            Ver mis órdenes
                        </a>
                        <a className="btn-secundario" href="/">
                            Seguir comprando
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PagoCompletado() {
    return (
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando...</div>}>
            <PagoCompletadoContenido />
        </Suspense>
    );
}
