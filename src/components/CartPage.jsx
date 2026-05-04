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
    return (
        <main className="pagina-carrito">
            <section className="carrito">
                <div className="carrito-contenido">
                    <div className="header-seccion">
                        <h1>Tu carrito</h1>
                        <p>Revisa los productos antes de finalizar tu pedido</p>
                    </div>

                    <div className="lista-carrito">
                        {carrito.length === 0 ? (
                            <p className="carrito-vacio">Todavia no agregaste productos al carrito.</p>
                        ) : (
                            carrito.map(producto => (
                                <article className="item-carrito" key={producto.id}>
                                    <div>
                                        <h4>{producto.nombre}</h4>
                                        <p>{formatoPesos.format(producto.precio)} c/u</p>
                                    </div>
                                    <div className="cantidad-controles">
                                        <button className="btn-cantidad" type="button" onClick={() => actualizarCantidad(producto.id, 'restar')}>-</button>
                                        <strong>{producto.cantidad}</strong>
                                        <button className="btn-cantidad" type="button" onClick={() => actualizarCantidad(producto.id, 'sumar')}>+</button>
                                    </div>
                                    <button className="btn-eliminar" type="button" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
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

                    {mensajeCompra && (
                        <p className={`mensaje-compra ${mensajeError ? 'error' : ''}`} aria-live="polite">
                            {mensajeCompra}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
