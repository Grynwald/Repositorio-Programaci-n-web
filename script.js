const botonesComprar = document.querySelectorAll('.btn-comprar');
const contadorCarrito = document.getElementById('contador-carrito');
const linkCarrito = document.getElementById('link-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const botonVaciarCarrito = document.getElementById('vaciar-carrito');
const detalleProducto = document.getElementById('detalle-producto');
const formFinalizarCompra = document.getElementById('form-finalizar-compra');
const botonMostrarFinalizarCompra = document.getElementById('mostrar-finalizar-compra');
const mensajeCompra = document.getElementById('mensaje-compra');

const formatoPesos = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
});

let carrito = obtenerCarritoDesdeUrl();

function codificarDatos(datos) {
    return encodeURIComponent(JSON.stringify(datos));
}

function decodificarDatos(valor) {
    try {
        return JSON.parse(decodeURIComponent(valor));
    } catch {
        return null;
    }
}

function obtenerCarritoDesdeUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const carritoUrl = parametros.get('carrito');

    if (!carritoUrl) {
        return [];
    }

    const carritoDecodificado = decodificarDatos(carritoUrl);
    parametros.delete('carrito');

    const urlLimpia = parametros.toString()
        ? `${window.location.pathname}?${parametros.toString()}`
        : window.location.pathname;

    window.history.replaceState({}, document.title, urlLimpia);

    return Array.isArray(carritoDecodificado) ? carritoDecodificado : [];
}

function obtenerProductoDesdeTarjeta(tarjeta) {
    const nombre = tarjeta.querySelector('h4').textContent;
    const descripcion = tarjeta.querySelector('h4 + p').textContent;
    const imagen = tarjeta.querySelector('.img-producto').getAttribute('src');
    const precioTexto = tarjeta.querySelector('.precio').textContent;
    const precio = Number(precioTexto.replace(/[^0-9]/g, ''));

    return {
        id: nombre.toLowerCase().replaceAll(' ', '-'),
        nombre,
        descripcion,
        imagen,
        precio
    };
}

function actualizarLinkCarrito() {
    if (!linkCarrito) {
        return;
    }

    linkCarrito.href = agregarCarritoAUrl('carrito.html');
}

function agregarCarritoAUrl(url) {
    if (carrito.length === 0) {
        return url;
    }

    const [ruta, hash = ''] = url.split('#');
    const separador = ruta.includes('?') ? '&' : '?';
    const urlConCarrito = `${ruta}${separador}carrito=${codificarDatos(carrito)}`;

    return hash ? `${urlConCarrito}#${hash}` : urlConCarrito;
}

function crearUrlProducto(producto) {
    const parametros = new URLSearchParams();

    parametros.set('producto', codificarDatos(producto));

    if (carrito.length > 0) {
        parametros.set('carrito', codificarDatos(carrito));
    }

    return `producto.html?${parametros.toString()}`;
}

function actualizarLinksProductos() {
    document.querySelectorAll('.btn-detalle').forEach(link => {
        const producto = decodificarDatos(link.dataset.producto);

        if (producto) {
            link.href = crearUrlProducto(producto);
        }
    });
}

function actualizarLinksConCarrito() {
    document.querySelectorAll('[data-conservar-carrito]').forEach(link => {
        link.href = agregarCarritoAUrl(link.dataset.conservarCarrito);
    });
}

function calcularCantidadTotal() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function calcularTotal() {
    return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
}

function renderizarCarrito() {
    if (contadorCarrito) {
        contadorCarrito.textContent = calcularCantidadTotal();
    }

    actualizarLinkCarrito();
    actualizarLinksProductos();
    actualizarLinksConCarrito();

    if (!listaCarrito || !totalCarrito) {
        return;
    }

    totalCarrito.textContent = formatoPesos.format(calcularTotal());

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="carrito-vacio">Todavía no agregaste productos al carrito.</p>';
        return;
    }

    listaCarrito.innerHTML = carrito.map(producto => `
        <article class="item-carrito">
            <div>
                <h4>${producto.nombre}</h4>
                <p>${formatoPesos.format(producto.precio)} c/u</p>
            </div>
            <div class="cantidad-controles">
                <button class="btn-cantidad" type="button" data-accion="restar" data-id="${producto.id}">-</button>
                <strong>${producto.cantidad}</strong>
                <button class="btn-cantidad" type="button" data-accion="sumar" data-id="${producto.id}">+</button>
            </div>
            <button class="btn-eliminar" type="button" data-accion="eliminar" data-id="${producto.id}">Eliminar</button>
        </article>
    `).join('');
}

function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    renderizarCarrito();
}

function actualizarCantidad(id, accion) {
    const producto = carrito.find(item => item.id === id);

    if (!producto) {
        return;
    }

    if (accion === 'sumar') {
        producto.cantidad++;
    }

    if (accion === 'restar') {
        producto.cantidad--;
    }

    carrito = carrito.filter(item => item.cantidad > 0);
    renderizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    renderizarCarrito();
}

function mostrarMensajeCompra(mensaje, esError = false) {
    if (!mensajeCompra) {
        return;
    }

    mensajeCompra.textContent = mensaje;
    mensajeCompra.classList.toggle('error', esError);
}

function mostrarFormularioCompra() {
    if (carrito.length === 0) {
        mostrarMensajeCompra('Agregá al menos un producto antes de finalizar la compra.', true);
        return;
    }

    formFinalizarCompra.classList.remove('oculto');
    mostrarMensajeCompra('');
    formFinalizarCompra.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function armarResumenPedido() {
    return carrito
        .map(producto => `${producto.cantidad} x ${producto.nombre}`)
        .join(', ');
}

function finalizarCompra(event) {
    event.preventDefault();

    if (carrito.length === 0) {
        mostrarMensajeCompra('Agregá al menos un producto antes de finalizar la compra.', true);
        return;
    }

    const datos = new FormData(formFinalizarCompra);
    const nombre = datos.get('nombre').trim();
    const entrega = datos.get('entrega');
    const pago = datos.get('pago');

    if (!formFinalizarCompra.checkValidity()) {
        formFinalizarCompra.reportValidity();
        return;
    }

    mostrarMensajeCompra(
        `Gracias, ${nombre}. Recibimos tu pedido: ${armarResumenPedido()}. Total: ${formatoPesos.format(calcularTotal())}. Entrega: ${entrega}. Pago: ${pago}.`
    );

    formFinalizarCompra.reset();
    carrito = [];
    renderizarCarrito();
}

function mostrarFeedbackBoton(boton) {
    const textoOriginal = boton.textContent;

    boton.textContent = 'Agregado';
    boton.classList.add('agregado');

    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.classList.remove('agregado');
    }, 1200);
}

function crearLinksDeProductos() {
    document.querySelectorAll('.tarjeta').forEach(tarjeta => {
        const producto = obtenerProductoDesdeTarjeta(tarjeta);
        const link = document.createElement('a');

        link.href = crearUrlProducto(producto);
        link.dataset.producto = codificarDatos(producto);
        link.className = 'btn-detalle';
        link.textContent = 'Ver producto';

        tarjeta.appendChild(link);
    });
}

function renderizarDetalleProducto() {
    if (!detalleProducto) {
        return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const producto = decodificarDatos(parametros.get('producto'));

    if (!producto) {
        detalleProducto.innerHTML = `
            <div>
                <h1>Producto no encontrado</h1>
                <p>Volvé al catálogo para elegir un producto.</p>
                <a href="index.html#productos" class="btn">Ver catálogo</a>
            </div>
        `;
        return;
    }

    document.title = `${producto.nombre} | Gaudí Mates`;
    detalleProducto.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div>
            <h1>${producto.nombre}</h1>
            <p>${producto.descripcion}</p>
            <p class="precio">${formatoPesos.format(producto.precio)}</p>
            <button class="btn-comprar btn-comprar-detalle" type="button">Agregar al carrito</button>
            <a href="index.html#productos" class="btn btn-volver-catalogo" data-conservar-carrito="index.html#productos">Volver al catálogo</a>
        </div>
    `;

    const botonDetalle = detalleProducto.querySelector('.btn-comprar-detalle');

    botonDetalle.addEventListener('click', () => {
        agregarAlCarrito(producto);
        mostrarFeedbackBoton(botonDetalle);
    });
}

botonesComprar.forEach(boton => {
    boton.addEventListener('click', () => {
        const tarjeta = boton.closest('.tarjeta');
        const producto = obtenerProductoDesdeTarjeta(tarjeta);

        agregarAlCarrito(producto);
        mostrarFeedbackBoton(boton);
    });
});

if (listaCarrito) {
    listaCarrito.addEventListener('click', event => {
        const boton = event.target.closest('button[data-accion]');

        if (!boton) {
            return;
        }

        const { accion, id } = boton.dataset;

        if (accion === 'eliminar') {
            eliminarProducto(id);
        } else {
            actualizarCantidad(id, accion);
        }
    });
}

if (botonVaciarCarrito) {
    botonVaciarCarrito.addEventListener('click', () => {
        carrito = [];
        renderizarCarrito();
        formFinalizarCompra?.classList.add('oculto');
        mostrarMensajeCompra('');
    });
}

if (botonMostrarFinalizarCompra && formFinalizarCompra) {
    botonMostrarFinalizarCompra.addEventListener('click', mostrarFormularioCompra);
}

if (formFinalizarCompra) {
    formFinalizarCompra.addEventListener('submit', finalizarCompra);
}

crearLinksDeProductos();
renderizarDetalleProducto();
renderizarCarrito();
