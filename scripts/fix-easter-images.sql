-- Atualiza os paths das imagens dos produtos Páscoa
-- Execute no Supabase SQL Editor se os produtos já existirem com paths antigos

UPDATE products SET image = '/images/easter/amanteigados.png' WHERE name = 'Amanteigados' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/palitos-chocolate.png' WHERE name = 'Palitos de Chocolate' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/rodinha-pascoa.png' WHERE name = 'Rodinha de Páscoa' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/unidades-ele-vive-feliz-pascoa.png' WHERE name = 'Unidades Ele Vive e Feliz Páscoa' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/quadradinho-chocolate.png' WHERE name = 'Quadradinho de Chocolate' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/jogo-memoria-semana-santa.png' WHERE name = 'Jogo da Memória Semana Santa' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/coelho-bolacha-chocolate.png' WHERE name = 'Coelho com Bolacha de Chocolate' AND category = 'pascoa';
UPDATE products SET image = '/images/easter/bolachas-no-ovo.png' WHERE name = 'Bolachas no Ovo de Páscoa' AND category = 'pascoa';
