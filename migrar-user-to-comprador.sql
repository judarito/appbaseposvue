-- Script para migrar datos de 'user' a 'comprador' y eliminar campo duplicado
-- Ejecutar en el SQL Editor de Supabase

-- 1. Primero, copiar los datos de 'user' a 'comprador' si 'comprador' está vacío
UPDATE "VentasChat" 
SET comprador = "user" 
WHERE comprador IS NULL OR comprador = '';

-- 2. Si todos los datos están en 'user' y 'comprador' está vacío, copiar todo
UPDATE "VentasChat" 
SET comprador = "user" 
WHERE comprador = '';

-- 3. Verificar que no hay datos perdidos
SELECT 
    id,
    "user",
    comprador,
    CASE 
        WHEN "user" = comprador THEN 'IGUAL'
        WHEN comprador IS NULL OR comprador = '' THEN 'COMPRADOR_VACIO'
        WHEN "user" IS NULL OR "user" = '' THEN 'USER_VACIO'
        ELSE 'DIFERENTES'
    END as estado_comparacion
FROM "VentasChat"
ORDER BY id;

-- 4. Una vez verificado que los datos están correctos, eliminar la columna 'user'
-- DESCOMENTA LA SIGUIENTE LÍNEA SOLO DESPUÉS DE VERIFICAR LOS DATOS:
-- ALTER TABLE "VentasChat" DROP COLUMN "user";

-- 5. Verificación final
SELECT 
    id,
    comprador,
    productomsj,
    cantidad,
    preciounitario,
    estado
FROM "VentasChat"
ORDER BY id
LIMIT 10;
