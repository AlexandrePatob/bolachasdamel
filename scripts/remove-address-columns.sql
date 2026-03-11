-- Migration: Remove address fields from customers and orders
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Endereço removido - entrega combinada via WhatsApp

-- Allow NULL (app não envia mais esses campos)
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN address DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN complement DROP NOT NULL;

-- Opcional: remover colunas completamente
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_address;
ALTER TABLE customers DROP COLUMN IF EXISTS address;
ALTER TABLE customers DROP COLUMN IF EXISTS complement;
