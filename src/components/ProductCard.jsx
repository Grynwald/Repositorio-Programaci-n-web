import { formatoPesos } from '../utils/formato.js';

export default function ProductCard({ producto, agregarAlCarrito, verProducto, feedbackId, feedbackError, cantidadEnCarrito }) {
    const agregado = feedbackId === producto.id;
    const sinStock = typeof producto.stock === 'number' && producto.stock === 0;
    const stockAgotado = typeof producto.stock === 'number' && cantidadEnCarrito >= producto.stock;
    const bloqueado = sinStock || stockAgotado;
    const errorLocal = feedbackError?.id === producto.id ? feedbackError.mensaje : null;

    function textoBoton() {
        if (sinStock) return 'Sin stock';
        if (stockAgotado) return `Máximo (${producto.stock})`;
        if (agregado) return 'Agregado';
        return 'Agregar al carrito';
    }

    return (
        <div className="tarjeta">
            <div className="img-wrapper">
                <img src={producto.imagen} alt={producto.alt} className="img-producto" />
            </div>
            <h4>{producto.nombre}</h4>
            <p>{producto.descripcion}</p>
            <p className="precio">{formatoPesos.format(producto.precio)}</p>
            <button
                className={`btn-comprar ${agregado ? 'agregado' : ''} ${bloqueado ? 'sin-stock' : ''}`}
                type="button"
                onClick={() => !bloqueado && agregarAlCarrito(producto)}
                disabled={bloqueado}
                aria-disabled={bloqueado}
            >
                {textoBoton()}
            </button>
            {errorLocal && <p className="producto-error-feedback">{errorLocal}</p>}
            <button className="btn-detalle" type="button" onClick={() => verProducto(producto)}>
                Ver producto
            </button>
        </div>
    );
}
