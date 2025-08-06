-- Script para renombrar columnas existentes
-- Solo ejecuta esto si ya tienes la tabla creada con nombres diferentes

ALTER TABLE "VentasChat" RENAME COLUMN user_name TO "user";
ALTER TABLE "VentasChat" RENAME COLUMN producto_msj TO productomsj;
ALTER TABLE "VentasChat" RENAME COLUMN precio_unitario TO preciounitario;
ALTER TABLE "VentasChat" RENAME COLUMN total_neto TO totalneto;
