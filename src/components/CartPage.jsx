import CheckoutForm from './CheckoutForm.jsx';
import { formatoPesos } from '../utils/formato.js';

export default function CartPage({
    carrito,
    totalCarrito,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    abrirCheckout,
    mostrarCheckout,
    finalizarCompra,
    mensajeCompra,
    mensajeError
}) {
    if (mensajeCompra && !mensajeError) {
        return (
            <main className="pagina-carrito">
                <section className="carrito">
                    <div className="carrito-contenido" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</p>
                        <h2 style={{ color: 'var(--color-primario)', marginBottom: '12px' }}>{mensajeCompra}</h2>
                        <p style={{ color: 'var(--color-texto-suave)' }}>Te redirigimos en un momento...</p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main id="contenido-principal" className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido">
                    <div className="header-seccion">
                        <h1>Tu carrito</h1>
                        <p>Revisa los productos antes de finalizar tu pedido</p>
                    </div>

                    <div className="lista-carrito" aria-label="Productos en el carrito">
                        {carrito.length === 0 ? (
                            <p className="carrito-vacio" role="status">Todavia no agregaste productos al carrito.</p>
                        ) : (
                            carrito.map(producto => (
                                <article className="item-carrito" key={producto.id}>
                                    <div>
                                        <h4>{producto.nombre}</h4>
                                        <p>{formatoPesos.format(producto.precio)} c/u</p>
                                    </div>
                                    <div className="cantidad-controles" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
                                        <button className="btn-cantidad" type="button" aria-label={`Reducir cantidad de ${producto.nombre}`} onClick={() => actualizarCantidad(producto.id, 'restar')}>-</button>
                                        <strong aria-live="polite" aria-atomic="true">{producto.cantidad}</strong>
                                        <button className="btn-cantidad" type="button" aria-label={`Aumentar cantidad de ${producto.nombre}`} onClick={() => actualizarCantidad(producto.id, 'sumar')}>+</button>
                                    </div>
                                    <button className="btn-eliminar" type="button" aria-label={`Eliminar ${producto.nombre} del carrito`} onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
                                </article>
                            ))
                        )}
                    </div>

                    <div className="resumen-carrito">
                        <p>Total: <span>{formatoPesos.format(totalCarrito)}</span></p>
                        <div className="acciones-carrito">
                            <button className="btn-secundario" type="button" onClick={vaciarCarrito}>
                                Vaciar carrito
                            </button>
                            <button className="btn-finalizar" type="button" onClick={abrirCheckout}>
                                Finalizar compra
                            </button>
                        </div>
                    </div>

                    {mostrarCheckout && (
                        <CheckoutForm finalizarCompra={finalizarCompra} />
                    )}

                    {mensajeCompra && mensajeError && (
                        <p className="mensaje-compra error" aria-live="polite">
                            {mensajeCompra}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
