'use client';

import { useEffect, useState } from 'react';
import { formatoPesos } from '../utils/formato.js';
import { supabaseBrowser } from '../lib/supabaseClient.js';
import NavPublica from './NavPublica.jsx';
import Footer from './Footer.jsx';

export default function OrdersPage() {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function cargarOrdenes() {
            try {
                const { data } = await supabaseBrowser.auth.getSession();
                const token = data.session?.access_token;

                if (!token) {
                    setError('Debes iniciar sesión para ver tus órdenes.');
                    setCargando(false);
                    return;
                }

                const response = await fetch('/api/ordenes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    setError(result.error || 'No se pudieron cargar las ordenes.');
                    return;
                }

                setOrdenes(result.data);
            } catch {
                setError('No se pudieron cargar las ordenes.');
            } finally {
                setCargando(false);
            }
        }

        cargarOrdenes();
    }, []);

    return (
        <>
            <NavPublica />
            <main id="contenido-principal" className="pagina-carrito">
                <section className="carrito">
                    <div className="carrito-contenido">
                        <div className="header-seccion">
                            <h1>Ordenes</h1>
                            <p>Historial de compras registradas desde tu cuenta</p>
                        </div>

                        {cargando && <p className="carrito-vacio">Cargando ordenes...</p>}

                        {!cargando && error && (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <p className="mensaje-compra error">{error}</p>
                                <a className="btn-finalizar" href="/" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                                    Iniciar sesión
                                </a>
                            </div>
                        )}

                        {!cargando && !error && ordenes.length === 0 && (
                            <p className="carrito-vacio">Todavia no hay ordenes registradas.</p>
                        )}

                        <div className="lista-carrito">
                            {ordenes.map(orden => (
                                <article className="item-carrito" key={orden.id}>
                                    <div>
                                        <h4>Orden #{orden.id}</h4>
                                        <p>{orden.email}</p>
                                        <p>{new Date(orden.creado_en).toLocaleDateString('es-AR')}</p>
                                        <p>
                                            <span className={`estado-badge estado-${orden.estado ?? 'pendiente'}`}>
                                                {orden.estado ?? 'pendiente'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="orden-detalle">
                                        <strong>{formatoPesos.format(orden.total)}</strong>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {(orden.estado === 'pendiente' || !orden.estado) && (
                                                <a className="btn-finalizar" href={`/checkout?orden_id=${orden.id}`}
                                                   style={{ padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                                    Pagar
                                                </a>
                                            )}
                                            <a className="btn-secundario" href={`/checkout?orden_id=${orden.id}`}>
                                                Ver detalle
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {!cargando && !error && (
                            <a className="btn-secundario" href="/" style={{ marginTop: '24px', display: 'inline-block' }}>Volver al catalogo</a>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
