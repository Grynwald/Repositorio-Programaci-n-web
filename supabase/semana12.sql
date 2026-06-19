-- =============================================
-- SEMANA 12: Transacciones, Roles y Pagos
-- Ejecutar en Supabase > SQL Editor
-- =============================================


-- =============================================
-- 1. TABLA DE PERFILES (roles de usuario)
-- =============================================

CREATE TABLE IF NOT EXISTS perfiles (
    id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol  VARCHAR(50) NOT NULL DEFAULT 'cliente',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON perfiles(rol);

-- Insertar perfil para usuarios ya existentes
INSERT INTO perfiles (id, rol)
SELECT id, 'cliente' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Trigger: crea perfil automáticamente cuando alguien se registra
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO perfiles (id, rol)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION crear_perfil_usuario();

-- RLS para perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_ve_su_perfil" ON perfiles;
CREATE POLICY "usuario_ve_su_perfil"
ON perfiles FOR SELECT
USING (auth.uid() = id);


-- =============================================
-- 2. CAMPOS DE PAGO EN TABLA PEDIDOS
-- =============================================

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago    VARCHAR(50);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_pago VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_en       TIMESTAMP WITH TIME ZONE;


-- =============================================
-- 3. STORED PROCEDURE: crear_pedido_completo
-- Transacción atómica: crea pedido, descuenta
-- stock y vacía el carrito. Si algo falla,
-- todo se revierte automáticamente (ROLLBACK).
-- =============================================

CREATE OR REPLACE FUNCTION crear_pedido_completo(
    p_usuario_id UUID,
    p_nombre     TEXT,
    p_telefono   TEXT,
    p_email      TEXT,
    p_direccion  TEXT,
    p_entrega    TEXT,
    p_pago       TEXT,
    p_comentarios TEXT DEFAULT NULL
)
RETURNS TABLE (
    pedido_id        BIGINT,
    total_calculado  NUMERIC,
    ok               BOOLEAN,
    mensaje          TEXT
) AS $$
DECLARE
    v_pedido_id BIGINT;
    v_item      RECORD;
    v_total     NUMERIC := 0;
    v_productos JSONB   := '[]'::JSONB;
    v_count     INT     := 0;
BEGIN
    -- Recorrer el carrito y validar stock
    FOR v_item IN
        SELECT c.cantidad,
               p.id    AS prod_id,
               p.nombre AS prod_nombre,
               p.precio,
               p.stock
        FROM carrito c
        JOIN productos p ON p.id = c.producto_id
        WHERE c.usuario_id = p_usuario_id
    LOOP
        IF v_item.stock IS NOT NULL AND v_item.stock < v_item.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para %', v_item.prod_nombre;
        END IF;

        v_total     := v_total + (v_item.precio * v_item.cantidad);
        v_productos := v_productos || jsonb_build_array(
            jsonb_build_object(
                'id',       v_item.prod_id,
                'nombre',   v_item.prod_nombre,
                'precio',   v_item.precio,
                'cantidad', v_item.cantidad
            )
        );
        v_count := v_count + 1;
    END LOOP;

    IF v_count = 0 THEN
        RAISE EXCEPTION 'El carrito está vacío';
    END IF;

    -- Crear el pedido
    INSERT INTO pedidos (
        usuario_id, nombre, telefono, email,
        direccion, entrega, pago, comentarios,
        total, productos, estado
    )
    VALUES (
        p_usuario_id, p_nombre, p_telefono, p_email,
        p_direccion, p_entrega, p_pago, p_comentarios,
        v_total, v_productos, 'pendiente'
    )
    RETURNING id INTO v_pedido_id;

    -- Descontar stock (solo productos que tienen stock definido)
    UPDATE productos p
    SET    stock = p.stock - c.cantidad
    FROM   carrito c
    WHERE  c.producto_id  = p.id
      AND  c.usuario_id   = p_usuario_id
      AND  p.stock IS NOT NULL;

    -- Vaciar el carrito
    DELETE FROM carrito WHERE usuario_id = p_usuario_id;

    RETURN QUERY SELECT v_pedido_id, v_total, TRUE, NULL::TEXT;

EXCEPTION WHEN OTHERS THEN
    -- El bloque hace ROLLBACK automático de todo lo anterior
    RETURN QUERY SELECT NULL::BIGINT, 0::NUMERIC, FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
