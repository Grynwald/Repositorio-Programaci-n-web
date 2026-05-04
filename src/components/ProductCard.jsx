import { formatoPesos } from '../utils/formato.js';

export default function ProductCard({ producto, agregarAlCarrito, verProducto, feedbackId }) {
    const agregado = feedbackId === producto.id;

    return (
        <div className="tarjeta">
            <div className="img-wrapper">
                <img src={producto.imagen} alt={producto.alt} className="img-producto" />
            </div>
            <h4>{producto.nombre}</h4>
            <p>{producto.descripcion}</p>
            <p className="precio">{formatoPesos.format(producto.precio)}</p>
            <button
                className={`btn-comprar ${agregado ? 'agregado' : ''}`}
                type="button"
                onClick={() => agregarAlCarrito(producto)}
            >
                {agregado ? 'Agregado' : 'Agregar al carrito'}
            </button>
            <button className="btn-detalle" type="button" onClick={() => verProducto(producto)}>
                Ver producto
            </button>
        </div>
    );
}
