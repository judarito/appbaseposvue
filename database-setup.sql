-- Script SQL para configurar las tablas en Supabase
-- Ejecuta este script en tu panel de Supabase (SQL Editor)

-- Tabla de tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios (extendida de auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Políticas de Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso a tenants (ajusta según tus necesidades)
CREATE POLICY "Allow all operations on tenants" ON tenants
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Política para permitir acceso a users (ajusta según tus necesidades)
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO tenants (name) VALUES 
    ('Empresa Demo 1'),
    ('Empresa Demo 2'),
    ('Empresa Demo 3')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, name) VALUES 
    ('admin@demo.com', 'Administrador Demo'),
    ('user@demo.com', 'Usuario Demo')
ON CONFLICT (email) DO NOTHING;
