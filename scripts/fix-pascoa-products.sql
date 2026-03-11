-- Ajuste dos produtos de Páscoa - Pacotes fechados
-- Quadradinho: opções 6 un e 12 un vêm das quantity_rules (não de product_options)
-- Remover opções de design do Quadradinho (user: "Nao tem TIPO")

-- 1. Remover opções de design do Quadradinho de Chocolate
DELETE FROM product_options
WHERE product_id IN (SELECT id FROM products WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa')
  AND type = 'design';

-- 2. Verificação: regras do Quadradinho já corretas no migration (6 un R$13,90 / 12 un R$27,90)
-- product_quantity_rules: min=6 max=6 price=13.90 e min=12 max=12 price=27.90
