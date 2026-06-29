import { formatoPesos } from '../utils/formato.js';

export default function ProductDetail({ producto, agregarAlCarrito, feedbackId, feedbackError, irAInicio }) {
    const agregado = feedbackId === producto.id;
    const sinStock = typeof producto.stock === 'number' && producto.stock === 0;
    const errorLocal = feedbackError?.id === producto.id ? feedbackError.mensaje : null;

    return (
        <main id="contenido-principal" className="pagina-producto">
            <section className="detalle-producto">
                <img src={producto.imagen} alt={producto.nombre} />
                <div>
                    <h1>{producto.nombre}</h1>
                    <p>{producto.descripcion}</p>
                    <p className="precio">{formatoPesos.format(producto.precio)}</p>
                    <button
                        className={`btn-comprar btn-comprar-detalle ${agregado ? 'agregado' : ''} ${sinStock ? 'sin-stock' : ''}`}
                        type="button"
                        onClick={() => !sinStock && agregarAlCarrito(producto)}
                        disabled={sinStock}
                        aria-disabled={sinStock}
                    >
                        {sinStock ? 'Sin stock' : agregado ? 'Agregado' : 'Agregar al carrito'}
                    </button>
                    {errorLocal && <p className="producto-error-feedback">{errorLocal}</p>}
                    <button className="btn btn-volver-catalogo" type="button" onClick={() => irAInicio('productos')}>
                        Volver al catalogo
                    </button>
                </div>
            </section>
        </main>
    );
}
