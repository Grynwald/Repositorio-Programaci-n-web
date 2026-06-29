'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabaseClient.js';
import { formatoPesos } from '../utils/formato.js';
import NavPublica from './NavPublica.jsx';
import Footer from './Footer.jsx';

async function getToken() {
    const { data } = await supabaseBrowser.auth.getSession();
    return data.session?.access_token ?? null;
}

export default function AdminDashboard() {
    const [seccion, setSeccion]     = useState('ordenes');
    const [ordenes, setOrdenes]     = useState([]);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando]   = useState(true);
    const [error, setError]         = useState('');
    const [stockEdits, setStockEdits] = useState({});
    const [guardando, setGuardando]   = useState({});
    const [mensajeGuardado, setMensajeGuardado] = useState({});

    useEffect(() => {
        cargar();
    }, [seccion]);

    async function cargar() {
        setCargando(true);
        setError('');
        const token = await getToken();

        if (!token) {
            setError('Debés iniciar sesión para acceder al panel.');
            setCargando(false);
            return;
        }

        const url = seccion === 'ordenes' ? '/api/admin/ordenes' : '/api/admin/productos';
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();

        if (!res.ok || !result.success) {
            setError(result.error || 'No tenés permiso para acceder a esta sección.');
            setCargando(false);
            return;
        }

        if (seccion === 'ordenes') {
            setOrdenes(result.data);
        } else {
            setProductos(result.data);
            const edits = {};
            result.data.forEach(p => { edits[p.id] = p.stock ?? 0; });
            setStockEdits(edits);
        }
        setCargando(false);
    }

    async function guardarStock(productoId) {
        setGuardando(prev => ({ ...prev, [productoId]: true }));
        setMensajeGuardado(prev => ({ ...prev, [productoId]: '' }));

        const token = await getToken();
        const res = await fetch('/api/admin/productos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: productoId, stock: Number(stockEdits[productoId]) })
        });
        const result = await res.json();

        setMensajeGuardado(prev => ({
            ...prev,
            [productoId]: res.ok && result.success ? 'Guardado' : 'Error al guardar'
        }));
        setGuardando(prev => ({ ...prev, [productoId]: false }));

        setTimeout(() => {
            setMensajeGuardado(prev => ({ ...prev, [productoId]: '' }));
        }, 2000);
    }

    return (
        <>
            <NavPublica />
            <main id="contenido-principal" className="pagina-carrito">
                <section className="carrito">
                    <div className="carrito-contenido">
                        <div className="header-seccion">
                            <h1>Panel de administración</h1>
                            <p>Gestión de órdenes y stock de productos</p>
                        </div>

                        <div className="admin-tabs">
                            <button
                                type="button"
                                className={seccion === 'ordenes' ? 'btn-finalizar' : 'btn-secundario'}
                                onClick={() => setSeccion('ordenes')}
                            >
                                Órdenes
                            </button>
                            <button
                                type="button"
                                className={seccion === 'productos' ? 'btn-finalizar' : 'btn-secundario'}
                                onClick={() => setSeccion('productos')}
                            >
                                Stock de productos
                            </button>
                        </div>

                        {cargando && <p className="carrito-vacio">Cargando...</p>}
                        {error   && <p className="mensaje-compra error">{error}</p>}

                        {!cargando && !error && seccion === 'ordenes' && (
                            <div className="lista-carrito">
                                {ordenes.length === 0 && (
                                    <p className="carrito-vacio">No hay órdenes registradas.</p>
                                )}
                                {ordenes.map(orden => (
                                    <article className="item-carrito" key={orden.id}>
                                        <div>
                                            <h4>Orden #{orden.id} — {orden.nombre}</h4>
                                            <p>{orden.email} · {orden.telefono}</p>
                                            <p>{orden.direccion}</p>
                                            <p>{new Date(orden.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="orden-detalle">
                                            <strong>{formatoPesos.format(orden.total)}</strong>
                                            <span className={`estado-badge estado-${orden.estado ?? 'pendiente'}`}>
                                                {orden.estado ?? 'pendiente'}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {!cargando && !error && seccion === 'productos' && (
                            <div className="lista-carrito">
                                {productos.map(producto => (
                                    <div className="item-carrito" key={producto.id}>
                                        <div>
                                            <h4>{producto.nombre}</h4>
                                            <p>{producto.categoria} — {formatoPesos.format(producto.precio)}</p>
                                        </div>
                                        <div className="admin-stock-control">
                                            <label className="admin-stock-label" htmlFor={`stock-${producto.id}`}>
                                                Stock
                                            </label>
                                            <input
                                                id={`stock-${producto.id}`}
                                                type="number"
                                                min="0"
                                                className="admin-stock-input"
                                                value={stockEdits[producto.id] ?? 0}
                                                onChange={e => setStockEdits(prev => ({ ...prev, [producto.id]: e.target.value }))}
                                            />
                                            <button
                                                type="button"
                                                className="btn-finalizar admin-stock-btn"
                                                onClick={() => guardarStock(producto.id)}
                                                disabled={guardando[producto.id]}
                                            >
                                                {guardando[producto.id] ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            {mensajeGuardado[producto.id] && (
                                                <span className="admin-stock-mensaje">
                                                    {mensajeGuardado[producto.id]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
