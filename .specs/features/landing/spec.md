# Landing Bolachas da Mel

## Acceptance criteria
- AC1: / apresenta nova landing em pt-BR com oferta de bolachas/biscoitos personalizados, caminhos B2B e B2C e CTAs de orçamento funcionais.
- AC2: /old preserva homepage, catálogo, carrinho e fluxo original; noindex para a rota antiga.
- AC3: formulário simples prepara briefing para WhatsApp +5541998038007; não envia mensagens automaticamente; trata entrada inválida e não promete preço/data.
- AC4: HTML principal renderizado no servidor, título/description/canonical/OG, JSON-LD factual e FAQ idêntico ao texto visível, robots.txt, sitemap.xml e llms.txt.
- AC5: layout responsivo desktop/mobile, imagens reais com alt, teclado e foco visíveis, sem overflow horizontal, sem chatbot ou alegações comerciais inventadas.
- AC6: build de produção, TypeScript, verificação focal de lint e testes do briefing passam; rotas públicas verificadas por HTTP e navegação.
- AC7: campanha enfatiza Dia dos Professores para famílias/alunos e escolas/equipes. Fotos florais e de Dia das Mães são substituídas por material oficial recente de setembro de 2026; criações genéricas não são apresentadas como modelos confirmados do catálogo de professores.
- AC8: manter o visual aprovado; trocar a referência promocional ao catálogo pelo kit da imagem enviada, com caneca personalizada, 8 bolachas de lápis com chocolate e R$ 45,00 legíveis na página, CTA específico e consistência entre FAQ, Product/Offer e llms.txt.

## Implementation steps
1. Preservar página antiga em /old com importações ajustadas e metadados noindex.
2. Criar landing server-rendered, recursos locais e CSS isolado.
3. Integrar formulário de orçamento e verificar briefing/validação.
4. Integrar SEO e recursos para agentes e validar rotas, build e interface.

## Assumptions and boundaries
SEO técnico melhora elegibilidade e compreensão, sem garantia de ranking/conversão. llms.txt é informativo, sem garantia de adoção. WhatsApp confirmado no Instagram público. Não publicar/deployar nesta tarefa.
