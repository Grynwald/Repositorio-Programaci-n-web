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
│   │   │   ├── auth.js             # Middleware: verifica JWT y retorna usuario
│   │   │   ├── responses.js        # Helpers successResponse / errorResponse
│   │   │   └── validation.js       # Sanitización y validaciones reutilizables
│   │   ├── carrito/                # GET / POST / PUT / DELETE — carrito
│   │   ├── ordenes/                # GET / POST — pedidos del usuario
│   │   │   └── [id]/               # GET — detalle de un pedido
│   │   └── pagos/
│   │       ├── crear-preferencia/  # POST — genera preferencia en Mercado Pago
│   │       ├── confirmar/          # POST — confirma pago al regresar al sitio
│   │       └── webhook/            # POST — notificaciones IPN de Mercado Pago
│   ├── checkout/                   # Página de resumen y pago
│   ├── ordenes/                    # Página "Mis órdenes"
│   ├── pago-completado/            # Página de éxito post-pago
│   ├── pago-fallido/               # Página de pago rechazado
│   └── pago-pendiente/             # Página de pago pendiente
├── src/
│   ├── App.jsx                     # Componente raíz: routing SPA, carrito, auth
│   ├── components/
│   │   ├── Header.jsx              # Navegación con menú responsive
│   │   ├── NavPublica.jsx          # Header simplificado para páginas secundarias
│   │   ├── Footer.jsx              # Pie de página
│   │   ├── Home.jsx                # Página principal con hero y catálogo
│   │   ├── ProductCard.jsx         # Tarjeta de producto
│   │   ├── ProductDetail.jsx       # Vista detalle de un producto
│   │   ├── CartPage.jsx            # Página del carrito
│   │   ├── CheckoutForm.jsx        # Formulario de datos de envío
│   │   ├── CheckoutPage.jsx        # Página de checkout con resumen y pago MP
│   │   ├── OrdersPage.jsx          # Historial de órdenes del usuario
│   │   └── AuthForm.jsx            # Formulario de login / registro
│   ├── hooks/
│   │   └── useAuth.js              # Hook: sesión, signIn, signUp, signOut
│   ├── lib/
│   │   ├── supabaseClient.js       # Cliente Supabase para el navegador
│   │   ├── supabaseServer.js       # Cliente Supabase para el servidor
│   │   └── mercadopago.js          # Instancia del SDK de Mercado Pago
│   └── utils/
│       ├── formato.js              # Formato de precios en ARS
│       └── storage.js              # Persistencia del carrito en localStorage
└── supabase/
    └── tablas.sql                  # DDL: tablas, RLS y stored procedure
```

---

## Endpoints de la API

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/carrito` | Obtiene el carrito del usuario | ✅ |
| POST | `/api/carrito` | Agrega o actualiza un ítem | ✅ |
| DELETE | `/api/carrito` | Elimina un ítem del carrito | ✅ |
| GET | `/api/ordenes` | Lista todos los pedidos del usuario | ✅ |
| POST | `/api/ordenes` | Crea un nuevo pedido | ✅ |
| GET | `/api/ordenes/[id]` | Detalle de un pedido | ✅ |
| GET | `/api/productos` | Lista todos los productos del catálogo | ❌ |
| POST | `/api/pagos/crear-preferencia` | Genera un link de pago en Mercado Pago | ✅ |
| POST | `/api/pagos/confirmar` | Marca la orden como pagada al regresar al sitio | ✅ |
| POST | `/api/pagos/webhook` | Recibe notificaciones IPN de Mercado Pago | ❌ |

---

## Base de datos (Supabase)

### Tabla `productos`
Catálogo de productos. Datos precargados via `INSERT` en `supabase/tablas.sql`.

| Columna | Tipo | Descripción |
|---|---|---|
| id | TEXT (PK) | Slug único del producto |
| nombre | TEXT | Nombre del producto |
| precio | NUMERIC | Precio en ARS |
| categoria | TEXT | mates / bombillas / termos / yerbas |
| imagen | TEXT | Ruta de la imagen en `/public` |

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

Las políticas de Row Level Security (RLS) garantizan que cada usuario solo acceda a sus propios datos.

### Stored procedure `crear_pedido_completo`

La creación de un pedido se ejecuta en una sola transacción en Supabase que:
1. Valida que el carrito del usuario no esté vacío
2. Calcula el total en base a los precios actuales de la tabla `productos`
3. Inserta el registro en `pedidos` con el snapshot de los ítems
4. Vacía el carrito del usuario

Esto garantiza consistencia: no puede crearse un pedido con carrito vacío ni quedar el carrito lleno después de confirmar.

---

## Flujo de pago con Mercado Pago

```
1. Usuario completa el formulario de checkout
2. POST /api/ordenes → crea el pedido en estado "pendiente"
3. POST /api/pagos/crear-preferencia → genera la preferencia con los ítems del pedido
4. El frontend redirige al usuario a init_point (Mercado Pago Checkout Pro)
5. El usuario paga en Mercado Pago
6. Mercado Pago notifica el resultado via webhook → POST /api/pagos/webhook
   - El webhook actualiza el estado del pedido a "pagada" o "cancelada"
7. Mercado Pago redirige al usuario a /pago-completado
   - La página llama a POST /api/pagos/confirmar como respaldo
```

El campo `external_reference` de la preferencia contiene el ID del pedido, lo que permite vincular la notificación del webhook con la orden en Supabase.

---

## Autenticación

La autenticación se maneja con **Supabase Auth** (email + contraseña). El middleware `app/api/_utils/auth.js` verifica el JWT en el header `Authorization: Bearer <token>` de cada request a la API y devuelve el usuario autenticado y un cliente de Supabase con su contexto de sesión.

---

## Deploy

El proyecto se despliega automáticamente en **Vercel** al hacer push a `main`. Las variables de entorno deben configurarse manualmente en el panel de Vercel.

El webhook de Mercado Pago apunta a:
```
https://repositorio-programaci-n-web.vercel.app/api/pagos/webhook/
```
