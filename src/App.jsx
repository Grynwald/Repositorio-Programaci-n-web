'use client';

import { useEffect, useMemo, useState } from 'react';
import CartPage from './components/CartPage.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import AuthForm from './components/AuthForm.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useCarrito } from './hooks/useCarrito.js';
import { productos as productosLocales } from './data/productos.js';

const ordenCategorias = productosLocales.map(c => c.categoria);

function agruparProductos(filas) {
    return filas.reduce((cats, producto) => {
        const existente = cats.find(c => c.categoria === producto.categoria);
        const item = {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            imagen: producto.imagen,
            alt: producto.alt,
            stock: producto.stock ?? null
        };

        if (existente) {
            existente.items.push(item);
            return cats;
        }

        return [...cats, { categoria: producto.categoria, tituloCategoria: producto.titulo_categoria, items: [item] }];
    }, []).sort((a, b) => {
        const iA = ordenCategorias.indexOf(a.categoria);
        const iB = ordenCategorias.indexOf(b.categoria);
        return (iA === -1 ? Infinity : iA) - (iB === -1 ? Infinity : iB);
    });
}

function App() {
    const [productos, setProductos] = useState(productosLocales);
    const [vista, setVista] = useState({ nombre: 'inicio' });
    const [productoActual, setProductoActual] = useState(null);
    const [mostrarAuthForm, setMostrarAuthForm] = useState(true);
    const [authMode, setAuthMode] = useState('login');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    const { usuario, session, rol, signIn, signUp, signOut } = useAuth();
    const {
        carrito, cantidadTotal, totalCarrito,
        feedbackId, feedbackError,
        mensajeCompra, mensajeError, mostrarCheckout,
        agregarAlCarrito, actualizarCantidad, eliminarProducto,
        vaciarCarrito, abrirCheckout, finalizarCompra,
        limpiarMensajes, limpiarAlCerrarSesion
    } = useCarrito(session);

    const productosPlanos = useMemo(() => productos.flatMap(c => c.items), [productos]);

    useEffect(() => {
        async function cargarProductos() {
            try {
                const res = await fetch('/api/productos');
                const result = await res.json();
                if (res.ok && result.success && result.data?.length) {
                    setProductos(agruparProductos(result.data));
                }
            } catch {
                // mantiene el fallback local
            }
        }
        cargarProductos();
    }, []);

    useEffect(() => {
        function aplicarRuta() {
            const rutaHash = window.location.hash.replace('#/', '');
            const rutaPath = window.location.pathname.replace(/^\/+/, '');
            const ruta = rutaHash || rutaPath;

            if (ruta === 'carrito') {
                setVista({ nombre: 'carrito' });
                setProductoActual(null);
                return;
            }

            if (ruta.startsWith('producto/')) {
                const id = ruta.replace('producto/', '');
                const producto = productosPlanos.find(p => p.id === id);
                if (producto) {
                    setProductoActual(producto);
                    setVista({ nombre: 'producto' });
                    return;
                }
            }

            setVista({ nombre: 'inicio' });
            setProductoActual(null);
        }

        aplicarRuta();
        window.addEventListener('hashchange', aplicarRuta);
        window.addEventListener('popstate', aplicarRuta);
        return () => {
            window.removeEventListener('hashchange', aplicarRuta);
            window.removeEventListener('popstate', aplicarRuta);
        };
    }, [productosPlanos]);

    function irAInicio(hash = 'inicio') {
        window.history.pushState(null, '', '/');
        setVista({ nombre: 'inicio' });
        setProductoActual(null);
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    }

    function verProducto(producto) {
        window.history.pushState(null, '', `/producto/${producto.id}`);
        setProductoActual(producto);
        setVista({ nombre: 'producto' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function verCarrito() {
        window.history.pushState(null, '', '/carrito');
        setVista({ nombre: 'carrito' });
        setProductoActual(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleAuthSubmit(event) {
        event.preventDefault();
        setAuthMessage('');

        if (!authEmail || !authPassword) {
            setAuthMessage('Completa email y contraseña.');
            return;
        }

        const accion = authMode === 'login'
            ? signIn(authEmail, authPassword)
            : signUp(authEmail, authPassword);
        const { error } = await accion;

        if (error) { setAuthMessage(error.message); return; }

        setAuthEmail('');
        setAuthPassword('');
        setAuthMode('login');
        setAuthMessage('¡Conectado!');
        setMostrarAuthForm(false);
        limpiarMensajes();
    }

    async function handleSignOut() {
        await signOut();
        limpiarAlCerrarSesion();
    }

    function handleAgregarAlCarrito(producto) {
        if (!session?.access_token) {
            setMostrarAuthForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        agregarAlCarrito(producto);
    }

    return (
        <>
            {(mostrarAuthForm || !usuario) && (
                <AuthForm
                    user={usuario}
                    email={authEmail}
                    password={authPassword}
                    onEmailChange={setAuthEmail}
                    onPasswordChange={setAuthPassword}
                    onSubmit={handleAuthSubmit}
                    onSignOut={handleSignOut}
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    message={authMessage}
                />
            )}

            <Header
                cantidadTotal={cantidadTotal}
                irAInicio={irAInicio}
                verCarrito={verCarrito}
                user={usuario}
                rol={rol}
                onAuthToggle={() => setMostrarAuthForm(prev => !prev)}
            />

            {vista.nombre === 'inicio' && (
                <Home
                    productos={productos}
                    agregarAlCarrito={handleAgregarAlCarrito}
                    verProducto={verProducto}
                    feedbackId={feedbackId}
                    feedbackError={feedbackError}
                    carrito={carrito}
                />
            )}

            {vista.nombre === 'producto' && productoActual && (
                <ProductDetail
                    producto={productoActual}
                    agregarAlCarrito={handleAgregarAlCarrito}
                    feedbackId={feedbackId}
                    feedbackError={feedbackError}
                    carrito={carrito}
                    irAInicio={irAInicio}
                />
            )}

            {vista.nombre === 'carrito' && (
                <CartPage
                    carrito={carrito}
                    totalCarrito={totalCarrito}
                    actualizarCantidad={actualizarCantidad}
                    eliminarProducto={eliminarProducto}
                    vaciarCarrito={vaciarCarrito}
                    abrirCheckout={abrirCheckout}
                    mostrarCheckout={mostrarCheckout}
                    finalizarCompra={finalizarCompra}
                    mensajeCompra={mensajeCompra}
                    mensajeError={mensajeError}
                />
            )}

            <Footer />
        </>
    );
}

export default App;
