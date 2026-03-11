# Scripts - Páscoa 2026

## Migration do banco de dados

### Opção 1: Supabase CLI (recomendado)

O projeto está configurado com Supabase CLI. Para aplicar as migrations no seu banco remoto:

```bash
# 1. Vincular ao projeto (primeira vez apenas)
yarn db:link

# 2. Enviar migrations para o banco
yarn db:push
```

### Opção 2: SQL Editor (manual)

Execute o arquivo `pascoa-2026-migration.sql` no **Supabase SQL Editor**:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** > **New query**
4. Cole o conteúdo de `pascoa-2026-migration.sql`
5. Clique em **Run**

### Ajuste Quadradinho (pacotes fechados)

Execute `fix-pascoa-products.sql` no Supabase SQL Editor para remover as opções de design do Quadradinho. Os pacotes 6 un e 12 un são definidos pelas `product_quantity_rules` e selecionados no modal de detalhes.

### Imagens

Após rodar a migration, adicione as fotos dos produtos em:

```
public/images/products/pascoa/
```

Arquivos esperados:

- amanteigados.jpg
- palitos-chocolate.jpg
- rodinha-pascoa.jpg
- unidades-ele-vive-feliz-pascoa.jpg
- quadradinho-chocolate.jpg
- jogo-memoria-semana-santa.jpg
- coelho-bolacha-chocolate.jpg
- bolachas-no-ovo.jpg

Se as imagens ainda não estiverem disponíveis, os produtos aparecerão com link quebrado até você adicioná-las.
