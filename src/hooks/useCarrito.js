'use client';

import { useEffect, useRef, useState } from 'react';
import { guardarCarrito, leerCarritoGuardado } from '../utils/storage.js';

export function useCarrito(session) {
    const [carrito, setCarrito] = useState([]);
    const [carritoCargado, setCarritoCargado] = useState(false);
    const [feedbackId, setFeedbackId] = useState(null);
    const [feedbackError, setFeedbackError] = useState(null);
    const [mensajeCompra, setMensajeCompra] = useState('');
    const [mensajeError, setMensajeError] = useState(false);
    const [mostrarCheckout, setMostrarCheckout] = useState(false);

    const carritoRef = useRef([]);
    useEffect(() => { carritoRef.current = carrito; }, [carrito]);

    const cantidadTotal = carrito.reduce((total, p) => total + p.cantidad, 0);
    const totalCarrito  = carrito.reduce((total, p) => total + p.precio * p.cantidad, 0);

    useEffect(() => {
        setCarrito(leerCarritoGuardado());
        setCarritoCargado(true);
    }, []);

    useEffect(() => {
        if (carritoCargado) guardarCarrito(carrito);
    }, [carrito, carritoCargado]);

    useEffect(() => {
        if (!session?.access_token) return;

        async function cargarCarritoServidor() {
            const carritoLocal = carritoRef.current;
            try {
                const res = await fetch('/api/carrito', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                const result = await res.json();
                if (!res.ok || !result.success) return;

                const carritoServidor = result.data;

                // Sincronizar items locales que no están en el servidor
                const itemsNuevos = carritoLocal.filter(
                    local => !carritoServidor.find(s => s.id === local.id)
                );
                for (const item of itemsNuevos) {
                    await fetch('/api/carrito', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                        body: JSON.stringify({ producto_id: item.id, cantidad: item.cantidad })
                    });
                }

                if (itemsNuevos.length > 0) {
                    const res2 = await fetch('/api/carrito', {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    const result2 = await res2.json();
                    if (res2.ok && result2.success) setCarrito(result2.data);
                } else {
                    setCarrito(carritoServidor);
                }
            } catch {
                // mantiene el carrito local
            }
        }

        cargarCarritoServidor();
    }, [session]);

    function headers() {
        const h = { 'Content-Type': 'application/json' };
        if (session?.access_token) h.Authorization = `Bearer ${session.access_token}`;
        return h;
    }

    function mostrarErrorEnProducto(id, mensaje) {
        setFeedbackError({ id, mensaje });
        setTimeout(() => setFeedbackError(null), 3000);
    }

    function agregarAlCarritoLocal(producto) {
        const cantidadActual = carritoRef.current.find(i => i.id === producto.id)?.cantidad ?? 0;
        const cantidadFinal = cantidadActual + 1;

        if (typeof producto.stock === 'number' && producto.stock < cantidadFinal) {
            mostrarErrorEnProducto(producto.id, `Solo hay ${producto.stock} unidad${producto.stock === 1 ? '' : 'es'} disponible${producto.stock === 1 ? '' : 's'}`);
            return;
        }

        setCarrito(actual => {
            const existe = actual.find(i => i.id === producto.id);
            return existe
                ? actual.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
                : [...actual, { ...producto, cantidad: 1 }];
        });
        setFeedbackId(producto.id);
        setTimeout(() => setFeedbackId(null), 1200);
    }

    async function agregarAlCarrito(producto) {
        if (!session?.access_token) {
            agregarAlCarritoLocal(producto);
            return;
        }
        try {
            const res = await fetch('/api/carrito', {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ producto_id: producto.id, cantidad: 1 })
            });
            const result = await res.json();

            if (res.ok && result.success) {
                const p = result.data;
                setCarrito(actual => {
                    const existe = actual.find(i => i.id === p.id);
                    return existe
                        ? actual.map(i => i.id === p.id ? { ...i, cantidad: p.cantidad } : i)
                        : [...actual, p];
                });
                setFeedbackId(p.id);
                setTimeout(() => setFeedbackId(null), 1200);
            } else {
                mostrarErrorEnProducto(producto.id, result.error || 'No se pudo agregar al carrito.');
            }
        } catch {
            mostrarErrorEnProducto(producto.id, 'No se pudo conectar con el servidor.');
        }
    }

    async function actualizarCantidad(id, accion) {
        const producto = carrito.find(i => i.id === id);
        if (!producto) return;

        const nuevaCantidad = accion === 'sumar' ? producto.cantidad + 1 : producto.cantidad - 1;
        if (nuevaCantidad <= 0) { await eliminarProducto(id); return; }

        if (!session?.access_token) {
            if (accion === 'sumar' && typeof producto.stock === 'number' && producto.stock < nuevaCantidad) {
                mostrarErrorEnProducto(id, `Solo hay ${producto.stock} unidad${producto.stock === 1 ? '' : 'es'} disponible${producto.stock === 1 ? '' : 's'}`);
                return;
            }
            setCarrito(actual => actual.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i));
            return;
        }

        try {
            const res = await fetch('/api/carrito', {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({ producto_id: id, cantidad: nuevaCantidad })
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setCarrito(actual => actual.map(i => i.id === id ? { ...i, cantidad: result.data.cantidad } : i));
            } else {
                setMensajeCompra(result.error || 'No se pudo actualizar la cantidad.');
                setMensajeError(true);
            }
        } catch {
            setMensajeCompra('No se pudo conectar con el servidor.');
            setMensajeError(true);
        }
    }

    async function eliminarProducto(id) {
        if (!session?.access_token) {
            setCarrito(actual => actual.filter(p => p.id !== id));
            return;
        }

        try {
            const res = await fetch('/api/carrito', {
                method: 'DELETE',
                headers: headers(),
                body: JSON.stringify({ producto_id: id })
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                setMensajeCompra(result.error || 'No se pudo eliminar el producto.');
                setMensajeError(true);
                return;
            }
            setCarrito(actual => actual.filter(p => p.id !== id));
        } catch {
            setMensajeCompra('No se pudo conectar con el servidor.');
            setMensajeError(true);
        }
    }

    async function vaciarCarrito() {
        if (!session?.access_token) {
            setCarrito([]);
            setMostrarCheckout(false);
            setMensajeCompra('');
            setMensajeError(false);
            return;
        }

        try {
            const res = await fetch('/api/carrito', { method: 'DELETE', headers: headers() });
            const result = await res.json();

            if (!res.ok || !result.success) {
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
            document.getElementById('form-finalizar-compra')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        const res = await fetch('/api/ordenes', {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                nombre:      datos.get('nombre').trim(),
                telefono:    datos.get('telefono').trim(),
                email:       datos.get('email').trim(),
                direccion:   datos.get('direccion').trim(),
                entrega:     datos.get('entrega'),
                pago:        datos.get('pago'),
                comentarios: datos.get('comentarios')?.trim() || null,
                items: carrito.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: p.cantidad }))
            })
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
            setMensajeCompra(result.error || 'No pudimos registrar el pedido. Intentalo nuevamente.');
            setMensajeError(true);
            return;
        }

        setCarrito([]);
        setMostrarCheckout(false);
        setMensajeCompra('¡Pedido confirmado!');
        setMensajeError(false);
        setTimeout(() => { window.location.href = `/checkout?orden_id=${result.data.id}`; }, 2500);
    }

    function limpiarMensajes() {
        setMensajeCompra('');
        setMensajeError(false);
    }

    function limpiarAlCerrarSesion() {
        setCarrito([]);
        setMostrarCheckout(false);
        setMensajeCompra('');
        setMensajeError(false);
    }

    return {
        carrito, cantidadTotal, totalCarrito,
        feedbackId, feedbackError,
        mensajeCompra, mensajeError, mostrarCheckout,
        agregarAlCarrito, actualizarCantidad, eliminarProducto,
        vaciarCarrito, abrirCheckout, finalizarCompra,
        limpiarMensajes, limpiarAlCerrarSesion
    };
}
