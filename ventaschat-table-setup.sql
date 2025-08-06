-- Script SQL para crear la tabla VentasChat
-- Ejecuta este script en tu panel de Supabase (SQL Editor)

-- Tabla de VentasChat
CREATE TABLE IF NOT EXISTS "VentasChat" (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    producto_msj TEXT NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL DEFAULT 0,
    precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    comprador VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    total_neto NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ventaschat_user ON "VentasChat"(user_name);
CREATE INDEX IF NOT EXISTS idx_ventaschat_fecha ON "VentasChat"(fecha);
CREATE INDEX IF NOT EXISTS idx_ventaschat_estado ON "VentasChat"(estado);
CREATE INDEX IF NOT EXISTS idx_ventaschat_comprador ON "VentasChat"(comprador);
CREATE INDEX IF NOT EXISTS idx_ventaschat_created_at ON "VentasChat"(created_at);

-- Políticas de Row Level Security (RLS)
ALTER TABLE "VentasChat" ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso a VentasChat (ajusta según tus necesidades)
CREATE POLICY "Allow all operations on VentasChat" ON "VentasChat"
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_ventaschat_updated_at BEFORE UPDATE ON "VentasChat"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular total_neto automáticamente
CREATE OR REPLACE FUNCTION calculate_total_neto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_neto = NEW.cantidad * NEW.precio_unitario;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular total_neto automáticamente
CREATE TRIGGER calculate_ventaschat_total BEFORE INSERT OR UPDATE ON "VentasChat"
    FOR EACH ROW EXECUTE FUNCTION calculate_total_neto();

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO "VentasChat" (user_name, producto_msj, cantidad, precio_unitario, comprador, estado) VALUES 
    ('Juan Pérez', 'Producto A - Excelente calidad', 2, 150.00, 'María García', 'completada'),
    ('Ana López', 'Producto B - Como nuevo', 1, 300.00, 'Carlos Ruiz', 'pendiente'),
    ('Luis Torres', 'Producto C - Liquidación', 3, 80.00, 'Sofia Herrera', 'en_proceso')
ON CONFLICT DO NOTHING;
