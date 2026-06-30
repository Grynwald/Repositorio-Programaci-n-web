'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavPublica from '../../src/components/NavPublica.jsx';
import Footer from '../../src/components/Footer.jsx';

function PagoFallidoContenido() {
    const searchParams = useSearchParams();
    const externalRef  = searchParams.get('external_reference');

    return (
        <main id="contenido-principal" className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido resultado-pago resultado-pago-borde-top fallido">
                    <p className="resultado-pago-icono">✕</p>
                    <h1 className="resultado-pago-titulo fallido">Pago rechazado</h1>
                    <p>No pudimos procesar tu pago. Posibles razones:</p>
                    <ul>
                        <li>Fondos insuficientes</li>
                        <li>Tarjeta rechazada por el banco</li>
                        <li>Cancelación del pago</li>
                    </ul>

                    <div className="resultado-pago-acciones">
                        <a className="btn-finalizar btn-pago-accion" href="/">
                            Volver al catálogo
                        </a>
                        <a className="btn-secundario" href="/ordenes">Ver mis órdenes</a>
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
