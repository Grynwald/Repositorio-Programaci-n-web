import { formatoPesos } from '../utils/formato.js';

export default function ProductDetail({ producto, agregarAlCarrito, feedbackId, feedbackError, carrito, irAInicio }) {
    const agregado = feedbackId === producto.id;
    const cantidadEnCarrito = carrito?.find(i => i.id === producto.id)?.cantidad ?? 0;
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
        <main id="contenido-principal" className="pagina-producto">
            <section className="detalle-producto">
                <img src={producto.imagen} alt={producto.nombre} />
                <div>
                    <h1>{producto.nombre}</h1>
                    <p>{producto.descripcion}</p>
                    <p className="precio">{formatoPesos.format(producto.precio)}</p>
                    <button
                        className={`btn-comprar btn-comprar-detalle ${agregado ? 'agregado' : ''} ${bloqueado ? 'sin-stock' : ''}`}
                        type="button"
                        onClick={() => !bloqueado && agregarAlCarrito(producto)}
                        disabled={bloqueado}
                        aria-disabled={bloqueado}
                    >
                        {textoBoton()}
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
