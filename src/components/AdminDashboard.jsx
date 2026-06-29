'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabaseClient.js';
import { formatoPesos } from '../utils/formato.js';
import NavPublica from './NavPublica.jsx';
import Footer from './Footer.jsx';

const PRODUCTO_VACIO = {
    id: '', categoria: '', titulo_categoria: '', nombre: '',
    descripcion: '', precio: '', imagen: '', alt: '', stock: ''
};

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
    const [stockEdits, setStockEdits]       = useState({});
    const [guardando, setGuardando]         = useState({});
    const [mensajeGuardado, setMensajeGuardado] = useState({});

    const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState(PRODUCTO_VACIO);
    const [creando, setCreando]     = useState(false);
    const [errorCreacion, setErrorCreacion] = useState('');

    const [eliminando, setEliminando] = useState(null);

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
        setTimeout(() => setMensajeGuardado(prev => ({ ...prev, [productoId]: '' })), 2000);
    }

    async function crearProducto(e) {
        e.preventDefault();
        setCreando(true);
        setErrorCreacion('');

        const token = await getToken();
        const res = await fetch('/api/admin/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                ...nuevoProducto,
                precio: Number(nuevoProducto.precio),
                stock: nuevoProducto.stock !== '' ? Number(nuevoProducto.stock) : null
            })
        });
        const result = await res.json();

        if (res.ok && result.success) {
            setNuevoProducto(PRODUCTO_VACIO);
            setMostrarFormNuevo(false);
            cargar();
        } else {
            setErrorCreacion(result.error || 'Error al crear el producto');
        }
        setCreando(false);
    }

    async function eliminarProducto(productoId, nombre) {
        if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

        setEliminando(productoId);
        const token = await getToken();
        const res = await fetch('/api/admin/productos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: productoId })
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
            setError(result.error || 'No se pudo eliminar el producto.');
        }
        setEliminando(null);
        cargar();
    }

    function cambiarNuevo(campo, valor) {
        setNuevoProducto(prev => ({ ...prev, [campo]: valor }));
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
                                Productos
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
                            <>
                                <div className="admin-acciones-top">
                                    <button
                                        type="button"
                                        className="btn-finalizar"
                                        onClick={() => { setMostrarFormNuevo(v => !v); setErrorCreacion(''); }}
                                    >
                                        {mostrarFormNuevo ? 'Cancelar' : '+ Nuevo producto'}
                                    </button>
                                </div>

                                {mostrarFormNuevo && (
                                    <form className="admin-form" onSubmit={crearProducto}>
                                        <h3 className="admin-form-titulo">Nuevo producto</h3>
                                        <div className="admin-form-grid">
                                            <div className="admin-form-field">
                                                <label htmlFor="np-id">ID <span className="campo-requerido">*</span></label>
                                                <input id="np-id" type="text" required placeholder="mate-nuevo"
                                                    value={nuevoProducto.id}
                                                    onChange={e => cambiarNuevo('id', e.target.value)} />
                                                <small>Solo minúsculas, números y guiones</small>
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-nombre">Nombre <span className="campo-requerido">*</span></label>
                                                <input id="np-nombre" type="text" required placeholder="Mate Nuevo"
                                                    value={nuevoProducto.nombre}
                                                    onChange={e => cambiarNuevo('nombre', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-categoria">Categoría <span className="campo-requerido">*</span></label>
                                                <input id="np-categoria" type="text" required placeholder="mates / bombillas / termos / yerbas"
                                                    value={nuevoProducto.categoria}
                                                    onChange={e => cambiarNuevo('categoria', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-titulo">Título categoría <span className="campo-requerido">*</span></label>
                                                <input id="np-titulo" type="text" required placeholder="Mates"
                                                    value={nuevoProducto.titulo_categoria}
                                                    onChange={e => cambiarNuevo('titulo_categoria', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field admin-form-full">
                                                <label htmlFor="np-descripcion">Descripción</label>
                                                <textarea id="np-descripcion" rows="2" placeholder="Descripción del producto..."
                                                    value={nuevoProducto.descripcion}
                                                    onChange={e => cambiarNuevo('descripcion', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-precio">Precio <span className="campo-requerido">*</span></label>
                                                <input id="np-precio" type="number" required min="0" step="1" placeholder="45000"
                                                    value={nuevoProducto.precio}
                                                    onChange={e => cambiarNuevo('precio', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-stock">Stock inicial</label>
                                                <input id="np-stock" type="number" min="0" step="1" placeholder="10"
                                                    value={nuevoProducto.stock}
                                                    onChange={e => cambiarNuevo('stock', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-imagen">Imagen (URL o ruta)</label>
                                                <input id="np-imagen" type="text" placeholder="/imagen.jpg"
                                                    value={nuevoProducto.imagen}
                                                    onChange={e => cambiarNuevo('imagen', e.target.value)} />
                                            </div>
                                            <div className="admin-form-field">
                                                <label htmlFor="np-alt">Texto alternativo</label>
                                                <input id="np-alt" type="text" placeholder="Descripción de la imagen"
                                                    value={nuevoProducto.alt}
                                                    onChange={e => cambiarNuevo('alt', e.target.value)} />
                                            </div>
                                        </div>
                                        {errorCreacion && <p className="admin-stock-mensaje" style={{ color: '#e74c3c' }}>{errorCreacion}</p>}
                                        <button type="submit" className="btn-finalizar" disabled={creando}>
                                            {creando ? 'Creando...' : 'Crear producto'}
                                        </button>
                                    </form>
                                )}

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
                                                <button
                                                    type="button"
                                                    className="btn-eliminar-admin"
                                                    onClick={() => eliminarProducto(producto.id, producto.nombre)}
                                                    disabled={eliminando === producto.id}
                                                    aria-label={`Eliminar ${producto.nombre}`}
                                                >
                                                    {eliminando === producto.id ? '...' : 'Eliminar'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
