import { formatoPesos } from '../utils/formato.js';

export default function ProductCard({ producto, agregarAlCarrito, verProducto, feedbackId, feedbackError }) {
    const agregado = feedbackId === producto.id;
    const sinStock = typeof producto.stock === 'number' && producto.stock === 0;
    const errorLocal = feedbackError?.id === producto.id ? feedbackError.mensaje : null;

    return (
        <div className="tarjeta">
            <div className="img-wrapper">
                <img src={producto.imagen} alt={producto.alt} className="img-producto" />
            </div>
            <h4>{producto.nombre}</h4>
            <p>{producto.descripcion}</p>
            <p className="precio">{formatoPesos.format(producto.precio)}</p>
            <button
                className={`btn-comprar ${agregado ? 'agregado' : ''} ${sinStock ? 'sin-stock' : ''}`}
                type="button"
                onClick={() => !sinStock && agregarAlCarrito(producto)}
                disabled={sinStock}
                aria-disabled={sinStock}
            >
                {sinStock ? 'Sin stock' : agregado ? 'Agregado' : 'Agregar al carrito'}
            </button>
            {errorLocal && <p className="producto-error-feedback">{errorLocal}</p>}
            <button className="btn-detalle" type="button" onClick={() => verProducto(producto)}>
                Ver producto
            </button>
        </div>
    );
}
