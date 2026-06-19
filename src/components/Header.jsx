import { useState } from 'react';

export default function Header({ cantidadTotal, irAInicio, verCarrito, user, onAuthToggle }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);

    function cerrarMenu() {
        setMenuAbierto(false);
        setDropdownAbierto(false);
    }

    function navegarInicio(hash) {
        irAInicio(hash);
        cerrarMenu();
    }

    return (
        <header>
            <button className="logo boton-logo" type="button" onClick={() => navegarInicio('inicio')}>
                <img
                    src="/logo-gaudi.png"
                    alt="Gaudi Mates"
                    style={{ height: '60px', width: 'auto', display: 'block' }}
                />
            </button>

            <button
                className={`hamburger${menuAbierto ? ' activo' : ''}`}
                type="button"
                aria-label="Abrir menú"
                onClick={() => setMenuAbierto(prev => !prev)}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <nav className={menuAbierto ? 'nav-abierta' : ''}>
                <button type="button" className="nav-link" onClick={() => navegarInicio('inicio')}>
                    Inicio
                </button>
                <div className="dropdown">
                    <span
                        className="dropbtn"
                        onClick={() => setDropdownAbierto(prev => !prev)}
                    >
                        Productos ▾
                    </span>
                    <div className={`dropdown-content${dropdownAbierto ? ' abierto' : ''}`}>
                        <button type="button" onClick={() => navegarInicio('mates')}>Mates</button>
                        <button type="button" onClick={() => navegarInicio('bombillas')}>Bombillas</button>
                        <button type="button" onClick={() => navegarInicio('termos')}>Termos</button>
                        <button type="button" onClick={() => navegarInicio('yerbas')}>Yerbas</button>
                    </div>
                </div>
                <button type="button" className="nav-link" onClick={() => navegarInicio('contacto')}>
                    Contacto
                </button>
                <a className="nav-link" href="/ordenes" onClick={cerrarMenu}>
                    Mis órdenes
                </a>
                <button type="button" className="nav-link" onClick={() => { onAuthToggle(); cerrarMenu(); }}>
                    {user ? 'Cuenta' : 'Iniciar sesión'}
                </button>
                <button type="button" className="btn-carrito-nav" onClick={() => { verCarrito(); cerrarMenu(); }}>
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
