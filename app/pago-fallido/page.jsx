'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavPublica from '../../src/components/NavPublica.jsx';
import Footer from '../../src/components/Footer.jsx';

function PagoFallidoContenido() {
    const searchParams = useSearchParams();
    const externalRef  = searchParams.get('external_reference');

    return (
        <main className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '6px solid #e74c3c' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✕</p>
                    <h1 style={{ color: '#e74c3c', marginBottom: '12px' }}>Pago rechazado</h1>
                    <p style={{ color: 'var(--color-texto-suave)', marginBottom: '16px' }}>
                        No pudimos procesar tu pago. Posibles razones:
                    </p>
                    <ul style={{ textAlign: 'left', maxWidth: '360px', margin: '0 auto 24px', color: 'var(--color-texto-suave)' }}>
                        <li>Fondos insuficientes</li>
                        <li>Tarjeta rechazada por el banco</li>
                        <li>Cancelación del pago</li>
                    </ul>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {externalRef && (
                            <a className="btn-finalizar" href={`/checkout?orden_id=${externalRef}`}
                               style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                                Reintentar pago
                            </a>
                        )}
                        <a className="btn-secundario" href="/ordenes">
                            Ver mis órdenes
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PagoFallido() {
    return (
        <>
            <NavPublica />
            <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando...</div>}>
                <PagoFallidoContenido />
            </Suspense>
            <Footer />
        </>
    );
}
