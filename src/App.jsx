'use client';

import { useEffect, useMemo, useState } from 'react';
import CartPage from './components/CartPage.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import { productos as productosLocales } from './data/productos.js';
import { supabase, supabaseConfigurado } from './lib/supabase.js';
import { formatoPesos } from './utils/formato.js';
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
            alt: producto.alt
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
    const [mostrarCheckout, setMostrarCheckout] = useState(false);
    const [mensajeCompra, setMensajeCompra] = useState('');
    const [mensajeError, setMensajeError] = useState(false);

    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const totalCarrito = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);

    const productosPlanos = useMemo(() => productos.flatMap(categoria => categoria.items), []);

    useEffect(() => {
        async function cargarProductos() {
            if (!supabaseConfigurado) {
                return;
            }

            const { data, error } = await supabase
                .from('productos')
                .select('id, categoria, titulo_categoria, nombre, descripcion, precio, imagen, alt');

            if (!error && data?.length) {
                setProductos(agruparProductos(data));
            }
        }

        cargarProductos();
    }, []);

    useEffect(() => {
        setCarrito(leerCarritoGuardado());
        setCarritoCargado(true);
    }, []);

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

    function agregarAlCarrito(producto) {
        setCarrito(carritoActual => {
            const existe = carritoActual.find(item => item.id === producto.id);

            if (existe) {
                return carritoActual.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }

            return [...carritoActual, { ...producto, cantidad: 1 }];
        });

        setFeedbackId(producto.id);
        setTimeout(() => setFeedbackId(null), 1200);
    }

    function actualizarCantidad(id, accion) {
        setCarrito(carritoActual =>
            carritoActual
                .map(producto => {
                    if (producto.id !== id) {
                        return producto;
                    }

                    return {
                        ...producto,
                        cantidad: accion === 'sumar' ? producto.cantidad + 1 : producto.cantidad - 1
                    };
                })
                .filter(producto => producto.cantidad > 0)
        );
    }

    function eliminarProducto(id) {
        setCarrito(carritoActual => carritoActual.filter(producto => producto.id !== id));
    }

    function vaciarCarrito() {
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

        if (!supabaseConfigurado) {
            setMensajeCompra('No se pudo conectar con Supabase. Revisa las variables de entorno.');
            setMensajeError(true);
            return;
        }

        const { error } = await supabase.from('pedidos').insert({
            nombre,
            telefono,
            email,
            direccion,
            entrega,
            pago,
            comentarios,
            total: totalCarrito,
            productos: carrito.map(producto => ({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad
            }))
        });

        if (error) {
            setMensajeCompra('No pudimos registrar el pedido. Intentalo nuevamente.');
            setMensajeError(true);
            return;
        }

        setMensajeCompra(
            `Gracias, ${nombre}. Recibimos tu pedido: ${resumen}. Total: ${formatoPesos.format(totalCarrito)}. Entrega: ${entrega}. Pago: ${pago}.`
        );
        setMensajeError(false);
        event.currentTarget.reset();
        setCarrito([]);
        setMostrarCheckout(false);
    }

    return (
        <>
            <Header
                cantidadTotal={cantidadTotal}
                irAInicio={irAInicio}
                verCarrito={verCarrito}
            />

            {vista.nombre === 'inicio' && (
                <Home
                    productos={productos}
                    agregarAlCarrito={agregarAlCarrito}
                    verProducto={verProducto}
                    feedbackId={feedbackId}
                />
            )}

            {vista.nombre === 'producto' && productoActual && (
                <ProductDetail
                    producto={productoActual}
                    agregarAlCarrito={agregarAlCarrito}
                    feedbackId={feedbackId}
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
