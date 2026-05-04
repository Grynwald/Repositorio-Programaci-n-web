const CLAVE_CARRITO = 'gaudi-carrito';

export function leerCarritoGuardado() {
    try {
        const carritoGuardado = window.localStorage.getItem(CLAVE_CARRITO);
        const carritoParseado = carritoGuardado ? JSON.parse(carritoGuardado) : [];

        return Array.isArray(carritoParseado) ? carritoParseado : [];
    } catch {
        return [];
    }
}

export function guardarCarrito(carrito) {
    try {
        window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        // Si el navegador bloquea localStorage, la app sigue funcionando sin persistencia.
    }
}
