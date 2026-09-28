# Validação da landing

Data: 28/09/2026. Ambiente: projeto local, Next.js 16.1.6.

## Evidências

- TypeScript: `tsc --noEmit --incremental false`, exit 0.
- ESLint focal: página, wrapper /old, formulário, helpers, conteúdo SEO, robots e sitemap; exit 0.
- Testes do briefing: `node scripts/test-quote.cjs`, exit 0. Cobrem codificação WhatsApp, públicos, campos opcionais, quantidade e data.
- Build de produção: `next build`, exit 0. `/`, `/old`, `/robots.txt` e `/sitemap.xml` gerados. O endpoint legado `/api/products` registra uso dinâmico durante a tentativa de prerender e é classificado como rota dinâmica.
- `git diff --check`, exit 0.
- HTTP local: `/`, `/old`, `/robots.txt`, `/sitemap.xml` e `/llms.txt` retornaram 200. `/old` contém noindex e permanece acessível ao crawler; robots não bloqueia a leitura dessa diretiva.
- HTML inicial de `/` contém o nome do kit, R$ 45,00, JSON-LD e domínio canônico. llms.txt contém composição e preço.
- Imagem fornecida: dimensões naturais confirmadas com sharp, 1024 × 1536, iguais às declaradas no compartilhamento social.
- Revisão visual no navegador: hero e galeria em desktop; kit, composição, preço e CTA em celular 390 × 844. Sem overflow horizontal (scrollWidth 375 para innerWidth 390). Arte preservada inteira.
- Link “Quero este kit” contém o número +5541998038007 e a mensagem com caneca personalizada, 8 bolachas de lápis com chocolate e R$ 45,00. Nenhuma mensagem foi enviada.
- Console da prévia final sem erros ou avisos capturados. Viewport temporário restaurado.

## Revisão e limites

A revisão independente anterior confirmou a preservação do componente original em `/old` (apenas os cinco imports adaptados) e identificou ajustes de hidratação da data, fallback sem JavaScript e noindex/robots, que foram corrigidos. A nova oferta foi conferida pelo agente de conteúdo e pelo autor da interface. A tentativa de revisão independente final foi interrompida por limite de uso; a validação final acima foi executada pelo agente principal.

O ajuste AC8 manteve o layout e substituiu a capa promocional do catálogo pela oferta fornecida pelo usuário. Composição e preço são coerentes entre conteúdo visível, FAQ, Product/Offer e llms.txt. Não foram declarados estoque, frete, avaliações ou prazo sem confirmação. Não houve publicação em produção, envio de mensagens ou alteração do banco de dados. Indexação e resultados de busca dependem da publicação e dos serviços externos.

## Preparação da PR

A branch `codex/landing-dia-dos-professores` incorpora a main em `df84887`. Após essa atualização, build de produção (incluindo TypeScript), ESLint focal, testes do briefing e diff staged sem erros de whitespace passaram novamente. Uma revisão independente dos arquivos novos confirmou o escopo, a consistência da oferta, a preservação de `/old` e a ausência de temporários ou segredos nesses arquivos.
