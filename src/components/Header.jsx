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
        <>
            <a href="#contenido-principal" className="skip-link">Ir al contenido principal</a>
            <header>
                <button className="logo boton-logo" type="button" onClick={() => navegarInicio('inicio')} aria-label="Gaudi Mates — ir al inicio">
                    <img
                        src="/logo-gaudi.png"
                        alt="Gaudi Mates"
                        style={{ height: '60px', width: 'auto', display: 'block' }}
                    />
                </button>

                <button
                    className={`hamburger${menuAbierto ? ' activo' : ''}`}
                    type="button"
                    aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuAbierto}
                    aria-controls="navegacion-principal"
                    onClick={() => setMenuAbierto(prev => !prev)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav id="navegacion-principal" aria-label="Navegación principal" className={menuAbierto ? 'nav-abierta' : ''}>
                    <button type="button" className="nav-link" onClick={() => navegarInicio('inicio')}>
                        Inicio
                    </button>
                    <div className="dropdown">
                        <button
                            type="button"
                            className="dropbtn"
                            aria-haspopup="true"
                            aria-expanded={dropdownAbierto}
                            onClick={() => setDropdownAbierto(prev => !prev)}
                        >
                            Productos ▾
                        </button>
                        <div className={`dropdown-content${dropdownAbierto ? ' abierto' : ''}`} role="menu">
                            <button type="button" role="menuitem" onClick={() => navegarInicio('mates')}>Mates</button>
                            <button type="button" role="menuitem" onClick={() => navegarInicio('bombillas')}>Bombillas</button>
                            <button type="button" role="menuitem" onClick={() => navegarInicio('termos')}>Termos</button>
                            <button type="button" role="menuitem" onClick={() => navegarInicio('yerbas')}>Yerbas</button>
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
                    <button
                        type="button"
                        className="btn-carrito-nav"
                        aria-label={`Ver carrito, ${cantidadTotal} ${cantidadTotal === 1 ? 'producto' : 'productos'}`}
                        onClick={() => { verCarrito(); cerrarMenu(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '5px' }}>
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span aria-hidden="true">Carrito ({cantidadTotal})</span>
                    </button>
                </nav>
            </header>
        </>
    );
}
