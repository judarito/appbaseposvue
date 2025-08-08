-- Script mínimo para crear la tabla VentasChat
-- Copia y pega este código en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS "VentasChat" (
    id SERIAL PRIMARY KEY,
    comprador VARCHAR(255) NOT NULL,
    productomsj TEXT NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL DEFAULT 0,
    preciounitario NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(50) NOT NULL DEFAULT 'POR PAGAR',
    totalneto NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE "VentasChat" ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir todas las operaciones
CREATE POLICY "Allow all operations on VentasChat" ON "VentasChat"
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Función para calcular total_neto automáticamente
CREATE OR REPLACE FUNCTION calculate_total_neto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.totalneto = NEW.cantidad * NEW.preciounitario;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular total_neto automáticamente en INSERT y UPDATE
CREATE TRIGGER calculate_ventaschat_total 
    BEFORE INSERT OR UPDATE ON "VentasChat"
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_total_neto();

-- Insertar datos de ejemplo
INSERT INTO "VentasChat" ("user", productomsj, cantidad, preciounitario, comprador, estado) VALUES 
    ('Juan Pérez', 'Producto A - Excelente calidad', 2, 150.00, 'María García', 'PAGADO'),
    ('Ana López', 'Producto B - Como nuevo', 1, 300.00, 'Carlos Ruiz', 'POR PAGAR'),
    ('Luis Torres', 'Producto C - Liquidación', 3, 80.00, 'Sofia Herrera', 'PAGO PARCIAL');
