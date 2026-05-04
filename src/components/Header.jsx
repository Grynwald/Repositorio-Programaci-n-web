export default function Header({ cantidadTotal, irAInicio, verCarrito }) {
    return (
        <header>
            <button className="logo boton-logo" type="button" onClick={() => irAInicio('inicio')}>
                <img
                    src="/logo-gaudi.png"
                    alt="Gaudi Mates"
                    style={{ height: '60px', width: 'auto', display: 'block' }}
                />
            </button>
            <nav>
                <button type="button" className="nav-link" onClick={() => irAInicio('inicio')}>
                    Inicio
                </button>
                <div className="dropdown">
                    <span className="dropbtn">Productos ▾</span>
                    <div className="dropdown-content">
                        <button type="button" onClick={() => irAInicio('mates')}>Mates</button>
                        <button type="button" onClick={() => irAInicio('bombillas')}>Bombillas</button>
                        <button type="button" onClick={() => irAInicio('termos')}>Termos</button>
                        <button type="button" onClick={() => irAInicio('yerbas')}>Yerbas</button>
                    </div>
                </div>
                <button type="button" className="nav-link" onClick={() => irAInicio('contacto')}>
                    Contacto
                </button>
                <button type="button" className="btn-carrito-nav" onClick={verCarrito}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Carrito ({cantidadTotal})
                </button>
            </nav>
        </header>
    );
}
