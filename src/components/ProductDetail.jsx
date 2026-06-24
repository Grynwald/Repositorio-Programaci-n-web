import { formatoPesos } from '../utils/formato.js';

export default function ProductDetail({ producto, agregarAlCarrito, feedbackId, irAInicio }) {
    const agregado = feedbackId === producto.id;

    return (
        <main id="contenido-principal" className="pagina-producto">
            <section className="detalle-producto">
                <img src={producto.imagen} alt={producto.nombre} />
                <div>
                    <h1>{producto.nombre}</h1>
                    <p>{producto.descripcion}</p>
                    <p className="precio">{formatoPesos.format(producto.precio)}</p>
                    <button
                        className={`btn-comprar btn-comprar-detalle ${agregado ? 'agregado' : ''}`}
                        type="button"
                        onClick={() => agregarAlCarrito(producto)}
                    >
                        {agregado ? 'Agregado' : 'Agregar al carrito'}
                    </button>
                    <button className="btn btn-volver-catalogo" type="button" onClick={() => irAInicio('productos')}>
                        Volver al catalogo
                    </button>
                </div>
            </section>
        </main>
    );
}
