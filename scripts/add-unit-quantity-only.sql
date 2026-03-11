-- Execução rápida: adiciona unit_quantity em products
-- Use isto se já tiver produtos e só precisar corrigir o erro.
-- Cole no Supabase SQL Editor e execute.

ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_quantity INT DEFAULT 1;
