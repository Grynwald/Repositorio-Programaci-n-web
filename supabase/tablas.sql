-- =============================================
-- TABLAS BASE: productos, carrito, pedidos
-- Ejecutar en Supabase > SQL Editor
-- =============================================


-- =============================================
-- 1. PRODUCTOS
-- =============================================

CREATE TABLE IF NOT EXISTS productos (
    id              TEXT PRIMARY KEY,
    categoria       TEXT NOT NULL,
    titulo_categoria TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2) NOT NULL,
    imagen          TEXT,
    alt             TEXT,
    stock           INTEGER,
    creado_en       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cargar los productos del catálogo
INSERT INTO productos (id, categoria, titulo_categoria, nombre, descripcion, precio, imagen, alt) VALUES
    ('mate-imperial',        'mates',     'Mates',     'Mate Imperial',          'Virola de alpaca cincelada y cuero premium.',              45000, '/mate-imperial.jpg',   'Mate Imperial'),
    ('mate-torpedo',         'mates',     'Mates',     'Mate Torpedo',           'Ideal para mates largos. Base firme y boca ancha.',        38000, '/mate-torpedo.jpg',    'Mate Torpedo'),
    ('mate-camionero',       'mates',     'Mates',     'Mate Camionero',         'El clasico de ruta. Resistente y muy comodo.',             35000, '/mate-camionero.jpg',  'Mate Camionero'),
    ('bombilla-pico-de-loro','bombillas', 'Bombillas', 'Bombilla Pico de Loro',  'Acero inoxidable de alta resistencia. Companera perfecta.',25000, '/bombilla-loro.jpg',   'Bombilla pico de loro'),
    ('bombilla-chata',       'bombillas', 'Bombillas', 'Bombilla Chata',         'Fabricada en acero, estetica limpia para el uso diario.',  20000, '/bombilla-chata.jpg',  'Bombilla chata'),
    ('termo-negro-mate',     'termos',    'Termos',    'Termo Negro Mate',       'Acero inoxidable 1L. 24hs de temperatura.',                39999, '/termo-negro.jpg',     'Termo Negro'),
    ('termo-acero-clasico',  'termos',    'Termos',    'Termo Acero Clasico',    'Acero inoxidable 1L. Diseno minimalista.',                 39999, '/termo-gris.jpg',      'Termo Gris'),
    ('termo-blanco-nieve',   'termos',    'Termos',    'Termo Blanco Nieve',     'Acero inoxidable 1L. Pintura texturizada.',                39999, '/termo-blanco.jpg',    'Termo Blanco'),
    ('medio-kilo-de-yerba',  'yerbas',    'Yerbas',    'Medio kilo de yerba',    'Yerba bien Argentina, molienda equilibrada.',              4500,  '/yerba-medio.jpg',     'Yerba Medio Kilo'),
    ('kilo-de-yerba',        'yerbas',    'Yerbas',    'Kilo de yerba',          'Nuestra yerba estrella para que nunca te falte.',          8000,  '/yerba-kilo.jpg',      'Yerba Kilo')
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 2. CARRITO
-- =============================================

CREATE TABLE IF NOT EXISTS carrito (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad    INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    creado_en   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (usuario_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito(usuario_id);

ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_maneja_su_carrito" ON carrito;
CREATE POLICY "usuario_maneja_su_carrito"
ON carrito FOR ALL
USING (auth.uid() = usuario_id);


-- =============================================
-- 3. PEDIDOS
-- =============================================

CREATE TABLE IF NOT EXISTS pedidos (
    id               BIGSERIAL PRIMARY KEY,
    usuario_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre           TEXT NOT NULL,
    telefono         TEXT NOT NULL,
    email            TEXT NOT NULL,
    direccion        TEXT NOT NULL,
    entrega          TEXT NOT NULL,
    pago             TEXT NOT NULL,
    comentarios      TEXT,
    total            NUMERIC(10,2) NOT NULL,
    productos        JSONB NOT NULL DEFAULT '[]',
    estado           TEXT NOT NULL DEFAULT 'pendiente',
    metodo_pago      VARCHAR(50),
    referencia_pago  VARCHAR(255),
    pagado_en        TIMESTAMP WITH TIME ZONE,
    creado_en        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_ve_sus_pedidos" ON pedidos;
CREATE POLICY "usuario_ve_sus_pedidos"
ON pedidos FOR SELECT
USING (auth.uid() = usuario_id);
