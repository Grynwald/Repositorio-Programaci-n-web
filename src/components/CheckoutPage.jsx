'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatoPesos } from '../utils/formato.js';
import { supabaseBrowser } from '../lib/supabaseClient.js';

function CheckoutContenido() {
    const searchParams = useSearchParams();
    const ordenId = searchParams.get('orden_id');

    const [pedido, setPedido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (!ordenId) {
            setError('No se especificó una orden.');
            setCargando(false);
            return;
        }

        async function cargarPedido() {
            const { data } = await supabaseBrowser.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                setError('Debes iniciar sesión para continuar.');
                setCargando(false);
                return;
            }

            try {
                const res = await fetch(`/api/ordenes/${ordenId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await res.json();

                if (!res.ok || !result.success) {
                    setError(result.error || 'No se pudo cargar la orden.');
                } else {
                    setPedido(result.data);
                }
            } catch {
                setError('No se pudo conectar con el servidor.');
            } finally {
                setCargando(false);
            }
        }

        cargarPedido();
    }, [ordenId]);

    async function handlePagar() {
        setProcesando(true);
        setMensaje('');

        const { data } = await supabaseBrowser.auth.getSession();
        const token = data.session?.access_token;

        try {
            const res = await fetch('/api/pagos/crear-preferencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orden_id: Number(ordenId) })
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                setMensaje(result.error || 'No se pudo procesar el pago.');
                return;
            }

            // Semana 13: window.location.href = result.data.preferencia.init_point
            setMensaje('Preferencia de pago creada. La integración real con Mercado Pago llega la próxima semana.');
        } catch {
            setMensaje('No se pudo conectar con el servidor.');
        } finally {
            setProcesando(false);
        }
    }

    const etiquetaEstado = {
        pendiente:  'Pendiente de pago',
        pagada:     'Pagada',
        confirmada: 'Confirmada',
        enviada:    'En camino',
        entregada:  'Entregada',
        cancelada:  'Cancelada'
    };

    return (
        <main className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido">
                    <div className="header-seccion">
                        <h1>Checkout</h1>
                        <p>Revisá tu pedido y elegí el método de pago</p>
                    </div>

                    {cargando && <p className="carrito-vacio">Cargando pedido...</p>}
                    {error && <p className="mensaje-compra error">{error}</p>}

                    {pedido && (
                        <>
                            <div className="checkout-resumen">
                                <div className="checkout-orden-info">
                                    <h2>Orden #{pedido.id}</h2>
                                    <p>
                                        <strong>Estado:</strong>{' '}
                                        <span className={`estado-badge estado-${pedido.estado}`}>
                                            {etiquetaEstado[pedido.estado] ?? pedido.estado}
                                        </span>
                                    </p>
                                    <p><strong>Entrega:</strong> {pedido.entrega}</p>
                                    <p><strong>Fecha:</strong> {new Date(pedido.creado_en).toLocaleDateString('es-AR')}</p>
                                </div>

                                <div className="checkout-total">
                                    <span className="checkout-total-label">Total a pagar</span>
                                    <strong className="checkout-total-monto">{formatoPesos.format(pedido.total)}</strong>
                                </div>
                            </div>

                            {pedido.productos?.length > 0 && (
                                <div className="lista-carrito" style={{ marginTop: '24px' }}>
                                    {pedido.productos.map((item, i) => (
                                        <div className="item-carrito" key={i}>
                                            <div>
                                                <h4>{item.nombre}</h4>
                                                <p>Cantidad: {item.cantidad}</p>
                                            </div>
                                            <strong style={{ color: 'var(--color-secundario)' }}>
                                                {formatoPesos.format(item.precio * item.cantidad)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pedido.estado === 'pendiente' && (
                                <div className="finalizar-compra" style={{ marginTop: '32px' }}>
                                    <h2>Método de pago</h2>
                                    <p style={{ color: 'var(--color-texto-suave)', marginBottom: '20px' }}>
                                        Elegí cómo querés abonar tu pedido.
                                    </p>

                                    <button
                                        className="btn-finalizar"
                                        type="button"
                                        onClick={handlePagar}
                                        disabled={procesando}
                                        style={{ width: '100%', fontSize: '1.05rem', padding: '16px' }}
                                    >
                                        {procesando ? 'Procesando...' : 'Pagar con Mercado Pago'}
                                    </button>

                                    {mensaje && (
                                        <p className={`mensaje-compra${mensaje.includes('próxima') ? '' : ' error'}`} style={{ marginTop: '16px' }}>
                                            {mensaje}
                                        </p>
                                    )}
                                </div>
                            )}

                            {pedido.estado !== 'pendiente' && (
                                <p className="mensaje-compra" style={{ marginTop: '24px' }}>
                                    Este pedido ya fue procesado ({etiquetaEstado[pedido.estado]}).
                                </p>
                            )}
                        </>
                    )}

                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <a className="btn-secundario" href="/ordenes">Ver mis órdenes</a>
                        <a className="btn-secundario" href="/">Volver al catálogo</a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="carrito-vacio" style={{ padding: '80px 5%' }}>Cargando...</div>}>
            <CheckoutContenido />
        </Suspense>
    );
}
