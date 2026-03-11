-- Páscoa 2026 - Migration completa
-- Categorias, índices, unit_quantity e produtos

-- ============================================
-- 1. Tabela categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories (sort_order);

-- ============================================
-- 2. Seed das categorias
-- ============================================
INSERT INTO categories (id, label, sort_order, is_featured) VALUES
  ('pascoa', 'Páscoa', 1, true),
  ('maes', 'Dia das Mães', 2, false),
  ('sobre', 'Quem Somos', 3, false),
  ('fe', 'Fé', 4, false),
  ('outros', 'Outros', 5, false)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

-- ============================================
-- 3. Índices em products
-- ============================================
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_category_available_idx
  ON products (category) WHERE is_available = true;

-- ============================================
-- 4. Coluna unit_quantity em products
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_quantity INT DEFAULT 1;

-- ============================================
-- 5. Produtos Páscoa 2026 (batch insert)
-- ============================================
INSERT INTO products (name, description, price, image, category, has_chocolate_option, is_available, unit_quantity) VALUES
  ('Amanteigados', 'Bolachas amanteigadas em formato coelho, cenoura e PÁSCOA. Temática Páscoa 2026.', 8.50, '/images/easter/amanteigados.png', 'pascoa', false, true, 1),
  ('Palitos de Chocolate', 'Biscoitos mergulhados em chocolate com formatos de Páscoa (coelho, flor, etc).', 14.00, '/images/easter/palitos-chocolate.png', 'pascoa', true, true, 4),
  ('Rodinha de Páscoa', 'Bolachas redondas com bordas festonadas e designs "Feliz Páscoa" (coelho, cenoura, ovo).', 10.00, '/images/easter/rodinha-pascoa.png', 'pascoa', false, true, 5),
  ('Unidades Ele Vive e Feliz Páscoa', 'Bolachas unitárias: cruz "Ele Vive" e coelhinho "Feliz Páscoa".', 4.50, '/images/easter/unidades-ele-vive-feliz-pascoa.png', 'pascoa', false, true, 1),
  ('Quadradinho de Chocolate', 'Bolachas quadradas com chocolate e designs de Páscoa (coelho, cenoura, cesta, cruz, ovelha, Ele Vive, Feliz Páscoa, etc).', 13.90, '/images/easter/quadradinho-chocolate.png', 'pascoa', true, true, 6),
  ('Jogo da Memória Semana Santa', 'Bolachas quadradas decoradas com cenas da Semana Santa. Jogo da memória temático.', 14.50, '/images/easter/jogo-memoria-semana-santa.png', 'pascoa', false, true, 7),
  ('Coelho com Bolacha de Chocolate', 'Coelho crochê + 5 bolachas quadradas de chocolate em container transparente.', 62.50, '/images/easter/coelho-bolacha-chocolate.png', 'pascoa', true, true, 1),
  ('Bolachas no Ovo de Páscoa', 'Ovo de Páscoa com bolachas dentro. Quadradinho ou Amanteigado.', 18.00, '/images/easter/bolachas-no-ovo.png', 'pascoa', false, true, 6);

-- 5.1 product_options (Amanteigados: embalagens)
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'embalagem', 'Saquinho', 0 FROM products WHERE name = 'Amanteigados' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'embalagem', 'Sacolinha', 2.40 FROM products WHERE name = 'Amanteigados' AND category = 'pascoa';

-- 5.2 product_options (Quadradinho: designs)
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'design', 'Coelho', 0 FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'design', 'Cenoura', 0 FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'design', 'Cesta de ovos', 0 FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'design', 'Ele Vive', 0 FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'design', 'Feliz Páscoa', 0 FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';

-- 5.3 product_options (Bolachas no Ovo: tipo)
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'tipo', 'Amanteigado (6 un)', 0 FROM products WHERE name = 'Bolachas no Ovo de Páscoa' AND category = 'pascoa';
INSERT INTO product_options (product_id, type, name, price_delta)
SELECT id, 'tipo', 'Quadradinho (6 un)', 2.90 FROM products WHERE name = 'Bolachas no Ovo de Páscoa' AND category = 'pascoa';

-- 5.4 product_quantity_rules (Palitos de Chocolate)
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 4, 4, 14.00, NULL FROM products WHERE name = 'Palitos de Chocolate' AND category = 'pascoa';
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 6, 6, 16.00, NULL FROM products WHERE name = 'Palitos de Chocolate' AND category = 'pascoa';

-- 5.5 product_quantity_rules (Rodinha de Páscoa)
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 5, 5, 10.00, NULL FROM products WHERE name = 'Rodinha de Páscoa' AND category = 'pascoa';
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 10, 10, 20.00, NULL FROM products WHERE name = 'Rodinha de Páscoa' AND category = 'pascoa';

-- 5.6 product_quantity_rules (Quadradinho de Chocolate)
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 6, 6, 13.90, NULL FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 12, 12, 27.90, NULL FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';

-- 5.7 product_quantity_rules (Jogo da Memória Semana Santa)
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 7, 7, 14.50, NULL FROM products WHERE name = 'Jogo da Memória Semana Santa' AND category = 'pascoa';
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 14, 14, 28.90, NULL FROM products WHERE name = 'Jogo da Memória Semana Santa' AND category = 'pascoa';

-- 5.8 product_quantity_rules (Bolachas no Ovo)
INSERT INTO product_quantity_rules (product_id, min_qty, max_qty, price, extra_per_unit)
SELECT id, 6, 6, 18.00, NULL FROM products WHERE name = 'Bolachas no Ovo de Páscoa' AND category = 'pascoa';
