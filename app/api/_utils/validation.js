export function sanitizar(valor, maxLength = 255) {
    return String(valor ?? '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim()
        .substring(0, maxLength);
}

export function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarCantidad(cantidad) {
    return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= 100;
}
