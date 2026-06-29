'use client';

import { useEffect, useMemo, useState } from 'react';
import CartPage from './components/CartPage.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import AuthForm from './components/AuthForm.jsx';
import { useAuth } from './hooks/useAuth.js';
import { productos as productosLocales } from './data/productos.js';
import { guardarCarrito, leerCarritoGuardado } from './utils/storage.js';

const ordenCategorias = productosLocales.map(categoria => categoria.categoria);

function agruparProductos(filas) {
    return filas.reduce((categorias, producto) => {
        const categoriaExistente = categorias.find(categoria => categoria.categoria === producto.categoria);
        const item = {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            imagen: producto.imagen,
            alt: producto.alt,
            stock: producto.stock ?? null
        };

        if (categoriaExistente) {
            categoriaExistente.items.push(item);
            return categorias;
        }

        return [
            ...categorias,
            {
                categoria: producto.categoria,
                tituloCategoria: producto.titulo_categoria,
                items: [item]
            }
        ];
    }, []).sort((categoriaA, categoriaB) => {
        const indiceA = ordenCategorias.indexOf(categoriaA.categoria);
        const indiceB = ordenCategorias.indexOf(categoriaB.categoria);

        return indiceA - indiceB;
    });
}

function App() {
    const [carrito, setCarrito] = useState([]);
    const [carritoCargado, setCarritoCargado] = useState(false);
    const [productos, setProductos] = useState(productosLocales);
    const [vista, setVista] = useState({ nombre: 'inicio' });
    const [productoActual, setProductoActual] = useState(null);
    const [feedbackId, setFeedbackId] = useState(null);
    const [feedbackError, setFeedbackError] = useState(null);
    const [mostrarCheckout, setMostrarCheckout] = useState(false);
    const [mensajeCompra, setMensajeCompra] = useState('');
    const [mensajeError, setMensajeError] = useState(false);
    const { usuario, session, rol, signIn, signUp, signOut } = useAuth();
    const [mostrarAuthForm, setMostrarAuthForm] = useState(true);
    const [authMode, setAuthMode] = useState('login');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const totalCarrito = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);

    const productosPlanos = useMemo(() => productos.flatMap(categoria => categoria.items), [productos]);

    useEffect(() => {
        async function cargarProductos() {
            try {
                const response = await fetch('/api/productos');
                const result = await response.json();

                if (response.ok && result.success && result.data?.length) {
                    setProductos(agruparProductos(result.data));
                }
            } catch {
                setProductos(productosLocales);
            }
        }

        cargarProductos();
    }, []);

    useEffect(() => {
        setCarrito(leerCarritoGuardado());
        setCarritoCargado(true);
    }, []);


    useEffect(() => {
        if (session?.access_token) {
            async function cargarCarritoServidor() {
                try {
                    const response = await fetch('/api/carrito', {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`
                        }
                    });
                    const result = await response.json();

                    if (response.ok && result.success) {
                        setCarrito(result.data);
                        return;
                    }
                } catch {
                    // Fallback a carrito local si falla
                }
            }

            cargarCarritoServidor();
        }
    }, [session]);

    useEffect(() => {
        if (carritoCargado) {
            guardarCarrito(carrito);
        }
    }, [carrito, carritoCargado]);

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
                const producto = productosPlanos.find(item => item.id === id);

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
        setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
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

        if (error) {
            setAuthMessage(error.message);
            return;
        }

        setAuthEmail('');
        setAuthPassword('');
        setAuthMode('login');
        setAuthMessage('¡Conectado!');
        setMostrarAuthForm(false);
        setMensajeCompra('');
        setMensajeError(false);
    }

    async function handleSignOut() {
        await signOut();
        setCarrito([]);
        setMensajeCompra('Sesión cerrada.');
        setMensajeError(false);
    }

    function obtenerHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
        }

        return headers;
    }

    async function agregarAlCarrito(producto) {
        if (!session?.access_token) {
            setMostrarAuthForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        let productoValidado = producto;

        try {
            const response = await fetch('/api/carrito', {
                method: 'POST',
                headers: obtenerHeaders(),
                body: JSON.stringify({
                    producto_id: producto.id,
                    cantidad: 1
                })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                productoValidado = result.data;
                setCarrito(carritoActual => {
                    const existe = carritoActual.find(item => item.id === productoValidado.id);

                    if (existe) {
                        return carritoActual.map(item =>
                            item.id === productoValidado.id ? { ...item, cantidad: productoValidado.cantidad } : item
                        );
                    }

                    return [...carritoActual, productoValidado];
                });
            } else {
                const msg = result.error || 'No se pudo agregar el producto al carrito.';
                setFeedbackError({ id: producto.id, mensaje: msg });
                setTimeout(() => setFeedbackError(null), 3000);
                return;
            }
        } catch {
            setFeedbackError({ id: producto.id, mensaje: 'No se pudo conectar con el servidor.' });
            setTimeout(() => setFeedbackError(null), 3000);
            return;
        }

        setFeedbackId(productoValidado.id);
        setTimeout(() => setFeedbackId(null), 1200);
    }

    async function actualizarCantidad(id, accion) {
        const producto = carrito.find(item => item.id === id);

        if (!producto) {
            return;
        }

        const nuevaCantidad = accion === 'sumar' ? producto.cantidad + 1 : producto.cantidad - 1;

        if (nuevaCantidad <= 0) {
            await eliminarProducto(id);
            return;
        }

        try {
            const response = await fetch('/api/carrito', {
                method: 'PUT',
                headers: obtenerHeaders(),
                body: JSON.stringify({
                    producto_id: id,
                    cantidad: nuevaCantidad
                })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                setCarrito(carritoActual =>
                    carritoActual.map(item =>
                        item.id === id ? { ...item, cantidad: result.data.cantidad } : item
                    )
                );
                return;
            }

            setMensajeCompra(result.error || 'No se pudo actualizar la cantidad.');
            setMensajeError(true);
        } catch {
            setMensajeCompra('No se pudo conectar con el servidor.');
            setMensajeError(true);
        }
    }

    async function eliminarProducto(id) {
        try {
            const response = await fetch('/api/carrito', {
                method: 'DELETE',
                headers: obtenerHeaders(),
                body: JSON.stringify({ producto_id: id })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setMensajeCompra(result.error || 'No se pudo eliminar el producto.');
                setMensajeError(true);
                return;
            }

            setCarrito(carritoActual => carritoActual.filter(producto => producto.id !== id));
        } catch {
            setMensajeCompra('No se pudo conectar con el servidor.');
            setMensajeError(true);
        }
    }

    async function vaciarCarrito() {
        try {
            const response = await fetch('/api/carrito', {
                method: 'DELETE',
                headers: obtenerHeaders()
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setMensajeCompra(result.error || 'No se pudo vaciar el carrito.');
                setMensajeError(true);
                return;
            }
        } catch {
            setMensajeCompra('No se pudo conectar con el servidor.');
            setMensajeError(true);
        }

        setCarrito([]);
        setMostrarCheckout(false);
        setMensajeCompra('');
        setMensajeError(false);
    }

    function abrirCheckout() {
        if (carrito.length === 0) {
            setMensajeCompra('Agrega al menos un producto antes de finalizar la compra.');
            setMensajeError(true);
            return;
        }

        setMostrarCheckout(true);
        setMensajeCompra('');
        setMensajeError(false);
        setTimeout(() => {
            document.getElementById('form-finalizar-compra')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 0);
    }

    async function finalizarCompra(event) {
        event.preventDefault();
        setMensajeCompra('');
        setMensajeError(false);

        if (!session?.access_token) {
            setMensajeCompra('Debes iniciar sesión para finalizar la compra.');
            setMensajeError(true);
            return;
        }

        if (carrito.length === 0) {
            setMensajeCompra('Agrega al menos un producto antes de finalizar la compra.');
            setMensajeError(true);
            return;
        }

        const datos = new FormData(event.currentTarget);
        const nombre = datos.get('nombre').trim();
        const telefono = datos.get('telefono').trim();
        const email = datos.get('email').trim();
        const direccion = datos.get('direccion').trim();
        const entrega = datos.get('entrega');
        const pago = datos.get('pago');
        const comentarios = datos.get('comentarios')?.trim() || null;
        const resumen = carrito.map(producto => `${producto.cantidad} x ${producto.nombre}`).join(', ');

        const response = await fetch('/api/ordenes', {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify({
                nombre,
                telefono,
                email,
                direccion,
                entrega,
                pago,
                comentarios,
                items: carrito.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: p.cantidad }))
            })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            setMensajeCompra(result.error || 'No pudimos registrar el pedido. Intentalo nuevamente.');
            setMensajeError(true);
            return;
        }

        setCarrito([]);
        setMostrarCheckout(false);
        setMensajeCompra('¡Pedido confirmado!');
        setMensajeError(false);
        setTimeout(() => {
            window.location.href = `/checkout?orden_id=${result.data.id}`;
        }, 2500);
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
                    agregarAlCarrito={agregarAlCarrito}
                    verProducto={verProducto}
                    feedbackId={feedbackId}
                    feedbackError={feedbackError}
                    carrito={carrito}
                />
            )}

            {vista.nombre === 'producto' && productoActual && (
                <ProductDetail
                    producto={productoActual}
                    agregarAlCarrito={agregarAlCarrito}
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
