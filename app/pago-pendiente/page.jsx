'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavPublica from '../../src/components/NavPublica.jsx';
import Footer from '../../src/components/Footer.jsx';

function PagoPendienteContenido() {
    const searchParams = useSearchParams();
    const externalRef  = searchParams.get('external_reference');

    return (
        <main id="contenido-principal" className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido resultado-pago resultado-pago-borde-top pendiente">
                    <p className="resultado-pago-icono">⏳</p>
                    <h1 className="resultado-pago-titulo pendiente">Pago pendiente</h1>
                    <p>Tu pago está siendo procesado. Las transferencias bancarias pueden demorar 1-2 días hábiles.</p>
                    {externalRef && <p><strong>Orden #:</strong> {externalRef}</p>}
                    <p>Te notificaremos cuando el pago sea confirmado.</p>

                    <div className="resultado-pago-acciones">
                        <a className="btn-finalizar btn-pago-accion" href="/ordenes">Ver mis órdenes</a>
                        <a className="btn-secundario" href="/">Volver al catálogo</a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PagoPendiente() {
    return (
        <>
            <NavPublica />
            <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando...</div>}>
                <PagoPendienteContenido />
            </Suspense>
            <Footer />
        </>
    );
}
