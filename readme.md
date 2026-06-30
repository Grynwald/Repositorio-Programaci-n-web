# Gaudi Mates — E-commerce de Mate y Yerba

Proyecto final para la materia **Programación Web (71.38)**. Tienda online de productos relacionados al mate: mates, bombillas, termos y yerbas.

**URL del sitio:** https://repositorio-programaci-n-web.vercel.app

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend / Framework | Next.js 14 (App Router) |
| Backend (API Routes) | Next.js API Routes (Node.js) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Pagos | Mercado Pago Checkout Pro |
| Deploy | Vercel |

---

## Instalación local

### Requisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Mercado Pago Developers](https://developers.mercadopago.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Grynwald/Repositorio-Programaci-n-web.git
cd Repositorio-Programaci-n-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales (ver sección Variables de entorno)

# 4. Ejecutar en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=<access_token>
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=<public_key>

# URL del sitio (sin barra final)
NEXT_PUBLIC_SITE_URL=https://repositorio-programaci-n-web.vercel.app
```

Las mismas variables deben configurarse en el panel de Vercel (Settings → Environment Variables).

---

## Estructura del proyecto

```
├── app/
│   ├── api/
│   │   ├── _utils/
│   │   │   ├── auth.js             # Middleware: requireUser y requireAdmin
│   │   │   ├── responses.js        # Helpers successResponse / errorResponse
│   │   │   └── validation.js       # Sanitización y validaciones reutilizables
│   │   ├── admin/
│   │   │   ├── ordenes/            # GET — lista todas las órdenes (solo admin)
│   │   │   └── productos/          # GET / POST / PATCH / DELETE — gestión de productos (solo admin)
│   │   ├── carrito/                # GET / POST / PUT / DELETE — carrito del usuario
│   │   ├── ordenes/                # GET / POST — pedidos del usuario
│   │   │   └── [id]/               # GET — detalle de un pedido
│   │   ├── productos/              # GET — catálogo público de productos
│   │   └── pagos/
│   │       ├── crear-preferencia/  # POST — genera preferencia en Mercado Pago
│   │       ├── confirmar/          # POST — confirma pago al regresar al sitio
│   │       └── webhook/            # POST — notificaciones IPN de Mercado Pago
│   ├── admin/                      # Panel de administración (protegido por rol)
│   ├── checkout/                   # Página de resumen y pago
│   ├── ordenes/                    # Página "Mis órdenes"
│   ├── pago-completado/            # Página de éxito post-pago
│   ├── pago-fallido/               # Página de pago rechazado
│   └── pago-pendiente/             # Página de pago pendiente
├── src/
│   ├── App.jsx                     # Componente raíz: routing SPA y auth UI
│   ├── components/
│   │   ├── Header.jsx              # Navegación con menú responsive y link Admin
│   │   ├── NavPublica.jsx          # Header simplificado para páginas secundarias
│   │   ├── Footer.jsx              # Pie de página
│   │   ├── Home.jsx                # Página principal con hero y catálogo
│   │   ├── ProductCard.jsx         # Tarjeta de producto con validación de stock
│   │   ├── ProductDetail.jsx       # Vista detalle de un producto
│   │   ├── CartPage.jsx            # Página del carrito
│   │   ├── CheckoutForm.jsx        # Formulario de datos de envío
│   │   ├── CheckoutPage.jsx        # Página de checkout con resumen y pago MP
│   │   ├── OrdersPage.jsx          # Historial de órdenes del usuario
│   │   ├── AdminDashboard.jsx      # Panel admin: órdenes, stock, crear/borrar productos
│   │   └── AuthForm.jsx            # Formulario de login / registro
│   ├── hooks/
│   │   ├── useAuth.js              # Hook: sesión, rol, signIn, signUp, signOut
│   │   └── useCarrito.js           # Hook: estado y operaciones del carrito
│   ├── lib/
│   │   ├── supabaseClient.js       # Cliente Supabase para el navegador
│   │   ├── supabaseServer.js       # Cliente Supabase con service role para el servidor
│   │   └── mercadopago.js          # Instancia del SDK de Mercado Pago
│   └── utils/
│       ├── formato.js              # Formato de precios en ARS
│       └── storage.js              # Persistencia del carrito en localStorage
└── supabase/
    ├── tablas.sql                  # DDL: tablas productos, carrito, pedidos y RLS
    └── semana12.sql                # DDL: tabla perfiles, roles, stored procedure y stock
```

---

## Endpoints de la API

### Públicos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los productos del catálogo |
| POST | `/api/pagos/webhook` | Recibe notificaciones IPN de Mercado Pago |

### Requieren autenticación (JWT en `Authorization: Bearer`)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/carrito` | Obtiene el carrito del usuario |
| POST | `/api/carrito` | Agrega un ítem (valida stock) |
| PUT | `/api/carrito` | Actualiza cantidad de un ítem |
| DELETE | `/api/carrito` | Elimina un ítem o vacía el carrito |
| GET | `/api/ordenes` | Lista los pedidos del usuario |
| POST | `/api/ordenes` | Crea un nuevo pedido |
| GET | `/api/ordenes/[id]` | Detalle de un pedido |
| POST | `/api/pagos/crear-preferencia` | Genera un link de pago en Mercado Pago |
| POST | `/api/pagos/confirmar` | Marca la orden como pagada |

### Solo admin

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/ordenes` | Lista todas las órdenes |
| GET | `/api/admin/productos` | Lista productos con stock |
| POST | `/api/admin/productos` | Crea un nuevo producto |
| PATCH | `/api/admin/productos` | Actualiza el stock de un producto |
| DELETE | `/api/admin/productos` | Elimina un producto |

---

## Base de datos (Supabase)

### Tabla `productos`
Catálogo de productos. Gestionable desde el panel admin.

| Columna | Tipo | Descripción |
|---|---|---|
| id | TEXT (PK) | Slug único (ej: `mate-imperial`) |
| nombre | TEXT | Nombre del producto |
| precio | NUMERIC | Precio en ARS |
| categoria | TEXT | `mates` / `bombillas` / `termos` / `yerbas` |
| titulo_categoria | TEXT | Título visible de la categoría |
| descripcion | TEXT | Descripción del producto |
| imagen | TEXT | Ruta de la imagen |
| stock | INTEGER | Unidades disponibles (`NULL` = sin límite) |

### Tabla `carrito`
Un registro por (usuario, producto). Se elimina en cascada con el usuario.

### Tabla `pedidos`
Almacena cada orden de compra.

| Columna | Tipo | Descripción |
|---|---|---|
| id | BIGSERIAL (PK) | ID autoincremental |
| usuario_id | UUID | FK a `auth.users` |
| productos | JSONB | Snapshot de los ítems al momento de la compra |
| total | NUMERIC | Total en ARS |
| estado | TEXT | `pendiente` → `pagada` / `cancelada` |
| referencia_pago | VARCHAR | ID del pago en Mercado Pago |

### Tabla `perfiles`
Almacena el rol de cada usuario (`cliente` o `admin`). Se crea automáticamente via trigger cuando un usuario se registra.

Las políticas de Row Level Security (RLS) garantizan que cada usuario solo acceda a sus propios datos.

### Stored procedure `crear_pedido_completo`

La creación de un pedido se ejecuta en una sola transacción que:
1. Valida que el carrito no esté vacío
2. Valida stock disponible por producto
3. Calcula el total en base a precios actuales
4. Inserta el registro en `pedidos` con snapshot de los ítems
5. Descuenta el stock de los productos involucrados
6. Vacía el carrito del usuario

Si cualquier paso falla, toda la transacción hace ROLLBACK automáticamente.

---

## Panel de administración

Accesible en `/admin` solo para usuarios con `rol = 'admin'` en la tabla `perfiles`.

**Funcionalidades:**
- **Órdenes**: lista completa de todos los pedidos con estado y total
- **Productos**: edición de stock por producto, creación de nuevos productos y eliminación

Para asignar el rol admin a un usuario:
```sql
INSERT INTO perfiles (id, rol)
VALUES ((SELECT id FROM auth.users WHERE email = 'tu@email.com'), 'admin')
ON CONFLICT (id) DO UPDATE SET rol = 'admin';
```

---

## Validación de stock

El stock se valida en dos niveles:
- **Frontend**: el botón "Agregar al carrito" se deshabilita cuando el producto está sin stock o cuando la cantidad en el carrito ya alcanzó el stock disponible
- **Backend**: la API `/api/carrito` verifica que `cantidad_en_carrito + nueva_cantidad <= stock` antes de insertar

---

## Flujo de pago con Mercado Pago

```
1. Usuario completa el formulario de checkout
2. POST /api/ordenes → crea el pedido en estado "pendiente"
3. POST /api/pagos/crear-preferencia → genera la preferencia con los ítems
4. El frontend redirige al usuario a init_point (Mercado Pago Checkout Pro)
5. El usuario paga en Mercado Pago
6. Mercado Pago notifica el resultado → POST /api/pagos/webhook
   - Actualiza el estado del pedido a "pagada" o "cancelada"
7. Mercado Pago redirige al usuario a /pago-completado
   - La página llama a POST /api/pagos/confirmar como respaldo
```

El campo `external_reference` de la preferencia contiene el ID del pedido, lo que permite vincular la notificación del webhook con la orden en Supabase.

---

## Autenticación

La autenticación se maneja con **Supabase Auth** (email + contraseña).

- `requireUser` — verifica el JWT en `Authorization: Bearer <token>` y devuelve el usuario
- `requireAdmin` — extiende `requireUser` verificando además que el usuario tenga `rol = 'admin'` en la tabla `perfiles`

Los hooks del lado del cliente encapsulan la lógica de sesión:
- `useAuth` — sesión, rol, signIn, signUp, signOut
- `useCarrito` — estado del carrito y todas sus operaciones con la API

---

## Deploy

El proyecto se despliega automáticamente en **Vercel** al hacer push a `main`. Las variables de entorno deben configurarse manualmente en el panel de Vercel.

El webhook de Mercado Pago apunta a:
```
https://repositorio-programaci-n-web.vercel.app/api/pagos/webhook/
```
