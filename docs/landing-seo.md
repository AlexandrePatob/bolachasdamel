# SEO da landing page

O conteúdo comercial está em `src/lib/landing-content.ts`. A página deve renderizar `faq` visivelmente e usar a mesma fonte no JSON-LD. O grafo descreve Organization, WebSite, Service, Product com Offer e FAQPage, sem avaliações ou condições comerciais não confirmadas. O produto publicado é a caneca personalizada com 8 bolachas de lápis com chocolate por R$ 45,00, informado pela marca; `teacherGift` mantém os dados do cartão, do link de WhatsApp e do JSON-LD consistentes. O `llms.txt` descreve a oferta e o encaminhamento ao atendimento humano; não representa integração com um modelo de IA nem garante uso por agentes.

## Foco de campanha

Desde a revisão de 28/09/2026, título, descrição, FAQ, Service e `llms.txt` priorizam presentes para o Dia dos Professores. Os públicos principais são famílias e alunos (B2C), escolas, instituições e empresas (B2B). Festas, presentes e ações de marca continuam como possibilidades secundárias. Os metadados não anunciam estoque, datas-limite ou entrega garantida.

Ao encerrar a campanha, atualizar o conteúdo visível, os metadados e o `llms.txt` juntos para manter a referência dos agentes e buscadores consistente com a oferta. A seleção de imagens deve corresponder às criações reais apresentadas; a publicação de uma foto não implica disponibilidade comercial.

Open Graph, Twitter e o JSON-LD usam `/images/landing/kit-professores.png`, imagem do kit fornecida pela marca. As dimensões declaradas são as naturais do arquivo: 1024 × 1536 px. A origem das imagens está registrada em [landing-assets.md](landing-assets.md). O Product/Offer aponta para `/#kit-professores` e publica somente o preço confirmado de 45 BRL; não declara estoque, avaliações, frete ou quantidade mínima.

## Antes de publicar

- Conferir o destino do WhatsApp `5541998038007`, verificado na bio oficial do Instagram em 25/09/2026, e as condições comerciais com a marca. A versão antiga utilizava um número diferente; a landing page usa o contato verificado.
- Conferir a página publicada, a imagem de compartilhamento, o canonical e os endpoints `/robots.txt`, `/sitemap.xml` e `/llms.txt` no domínio definitivo.
- Validar o JSON-LD no [Schema Markup Validator](https://validator.schema.org/) e medir a página publicada no [PageSpeed Insights](https://pagespeed.web.dev/).
- Enviar o sitemap ao Google Search Console e acompanhar indexação, consultas e conversões. SEO técnico não garante posição, tráfego ou uma nota específica.

## Indexação

O sitemap contém apenas `/`. `robots.txt` desencoraja o rastreamento de `/admin` e `/api/`, preservando acesso aos arquivos necessários à renderização da landing page. `/old` permanece intencionalmente acessível ao rastreador para que ele leia a diretiva `noindex` da página antiga.

`robots.txt` controla rastreamento, não acesso nem indexação garantida. Acompanhar a indexação da landing page e a exclusão de `/old` pelo Search Console. A área administrativa continua dependendo da autenticação existente. [Referência do Google](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

As rotas de metadados usam as convenções nativas do Next.js: [robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) e [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).
