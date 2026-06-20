'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PagoPendienteContenido() {
    const searchParams = useSearchParams();
    const externalRef  = searchParams.get('external_reference');

    return (
        <main className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '6px solid #e67e22' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</p>
                    <h1 style={{ color: '#e67e22', marginBottom: '12px' }}>Pago pendiente</h1>
                    <p style={{ color: 'var(--color-texto-suave)', marginBottom: '16px' }}>
                        Tu pago está siendo procesado. Las transferencias bancarias pueden demorar 1-2 días hábiles.
                    </p>
                    {externalRef && (
                        <p style={{ color: 'var(--color-texto-suave)', marginBottom: '24px' }}>
                            <strong>Orden #:</strong> {externalRef}
                        </p>
                    )}
                    <p style={{ color: 'var(--color-texto-suave)', marginBottom: '24px' }}>
                        Te notificaremos cuando el pago sea confirmado.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a className="btn-finalizar" href="/ordenes" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                            Ver mis órdenes
                        </a>
                        <a className="btn-secundario" href="/">
                            Volver al catálogo
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PagoPendiente() {
    return (
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando...</div>}>
            <PagoPendienteContenido />
        </Suspense>
    );
}
