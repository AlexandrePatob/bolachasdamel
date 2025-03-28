# Bolachas da Mel 🍪

Site institucional da Bolachas da Mel, uma confeitaria artesanal especializada em bolachas artesanais para Páscoa.

## 🚀 Tecnologias Utilizadas

- [Next.js 14](https://nextjs.org/) - Framework React com renderização híbrida
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animações
- [React Hot Toast](https://react-hot-toast.com/) - Sistema de notificações toast
- [Next/Image](https://nextjs.org/docs/api-reference/next/image) - Componente de otimização de imagens

## 🛠️ Estratégias Implementadas

### Performance
- Otimização de imagens com Next/Image
- Lazy loading de componentes
- Animações otimizadas com Framer Motion
- Renderização híbrida (SSR/SSG) do Next.js

### UX/UI
- Design responsivo para todos os dispositivos
- Animações suaves e interativas
- Feedback visual para ações do usuário
- Sistema de notificações toast
- Layout adaptativo com Tailwind CSS

### Segurança
- Validação de dados no cliente
- Sanitização de inputs
- Proteção contra XSS
- Headers de segurança configurados

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/AlexandrePatob/bolachasdamel.git
cd bolachas-da-mel
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=554198038007
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse o projeto em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
bolachas-da-mel/
├── public/
│   └── images/         # Imagens estáticas
├── src/
│   ├── app/           # Páginas e rotas
│   ├── components/    # Componentes React
│   └── styles/        # Estilos globais
├── .env.local         # Variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo Git
├── next.config.js     # Configuração do Next.js
├── package.json       # Dependências e scripts
├── tailwind.config.js # Configuração do Tailwind
└── tsconfig.json      # Configuração do TypeScript
```

## 🎨 Componentes Principais

- `Header`: Cabeçalho com navegação e carrinho
- `ProductList`: Lista de produtos disponíveis
- `EasterFavorites`: Seção de favoritos da Páscoa
- `AboutUs`: Seção "Quem Somos"
- `CartModal`: Modal do carrinho de compras
- `OrderForm`: Formulário de pedido
- `Footer`: Rodapé com informações de contato

## 📱 Responsividade

O site é totalmente responsivo e se adapta aos seguintes breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier




