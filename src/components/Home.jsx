import ProductCard from './ProductCard.jsx';

export default function Home({ productos, agregarAlCarrito, verProducto, feedbackId }) {
    return (
        <main id="contenido-principal">
            <section id="inicio" className="hero">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1>El ritual del mate,<br />en su mejor version</h1>
                        <p>Descubri nuestros mates artesanales, bombillas premium y accesorios disenados para acompanarte todos los dias.</p>
                        <a href="#productos" className="btn">Explorar Catalogo</a>
                    </div>
                </div>
            </section>

            <section id="productos" className="productos">
                <div className="header-seccion">
                    <h2>Coleccion Exclusiva</h2>
                    <p>Piezas unicas creadas por artesanos argentinos</p>
                </div>

                {productos.map(categoria => (
                    <div id={categoria.categoria} className="categoria" key={categoria.categoria}>
                        <h3 className="titulo-categoria">{categoria.tituloCategoria}</h3>
                        <div className="grilla-productos">
                            {categoria.items.map(producto => (
                                <ProductCard
                                    key={producto.id}
                                    producto={producto}
                                    agregarAlCarrito={agregarAlCarrito}
                                    verProducto={verProducto}
                                    feedbackId={feedbackId}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <section id="contacto" className="contacto">
                <div className="contacto-contenido">
                    <h2>Hablemos</h2>
                    <p>Tenes dudas sobre como curar tu mate o que producto elegir? Dejanos tu mensaje y te asesoramos de forma personalizada.</p>
                    <a href="mailto:hola@gaudi.com" className="btn-contacto">Escribinos un mail</a>
                </div>
            </section>
        </main>
    );
}
