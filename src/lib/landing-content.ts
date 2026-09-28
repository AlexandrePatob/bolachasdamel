import type { Metadata } from 'next';

export const SITE_URL = 'https://www.bolachasdamel.com.br';

// Phone verified in the official Instagram bio; location from the original site.
export const business = {
  name: 'Bolachas da Mel',
  phone: '+5541998038007',
  phoneDisplay: '(41) 99803-8007',
  whatsapp: 'https://wa.me/5541998038007',
  instagram: 'https://www.instagram.com/bolachasdamel_/',
  instagramHandle: '@bolachasdamel_',
  location: 'Curitiba, PR',
  city: 'Curitiba',
  state: 'PR',
  country: 'BR',
} as const;

export const teacherGift = {
  name: 'Caneca personalizada + 8 bolachas',
  description: 'Caneca personalizada para o Dia dos Professores com 8 bolachas em formato de lápis com chocolate.',
  image: '/images/landing/kit-professores.png',
  price: 45,
  priceLabel: 'R$ 45,00',
  whatsappUrl: `${business.whatsapp}?text=${encodeURIComponent('Olá! Tenho interesse no kit de Dia dos Professores de R$ 45,00: caneca personalizada com 8 bolachas em formato de lápis com chocolate. Gostaria de combinar a personalização e confirmar a disponibilidade.')}`,
} as const;

export const faq = [
  {
    question: 'O que vem no kit de R$ 45,00?',
    answer: `${teacherGift.description} O kit custa ${teacherGift.priceLabel}. Combine a personalização e consulte a disponibilidade pelo WhatsApp.`,
  },
  {
    question: 'Escolas e empresas podem presentear toda a equipe?',
    answer:
      'Sim! Atendemos pedidos de escolas, instituições e empresas que querem homenagear professores e equipes. Envie a quantidade estimada e sua ideia de personalização para combinar modelos, apresentação e orçamento.',
  },
  {
    question: 'Também fazem personalizados para outras ocasiões?',
    answer:
      'Sim. Além do Dia dos Professores, criamos bolachas e biscoitos para festas, presentes e ações de marca. Compartilhe seu tema ou referência; a equipe avalia formatos, decoração e apresentação antes da confirmação da encomenda.',
  },
  {
    question: 'Qual é o pedido mínimo e o prazo de produção?',
    answer:
      'A quantidade mínima e o prazo dependem do modelo, da personalização e da disponibilidade da agenda. Informe a quantidade estimada e a data em que pretende presentear. A equipe confirma a viabilidade antes de você fechar o pedido.',
  },
  {
    question: 'Como consultar entrega ou retirada?',
    answer:
      'A Bolachas da Mel está em Curitiba, no Paraná. Envie sua cidade e seu CEP pelo WhatsApp para consultar as possibilidades de entrega ou retirada, os custos e os prazos do seu pedido.',
  },
  {
    question: 'Como pedir um orçamento?',
    answer:
      'Conte a ocasião, a quantidade, a data e a cidade pelo WhatsApp. Você também pode organizar essas informações no formulário desta página. A equipe confirma as opções e os valores; enviar a mensagem não confirma uma compra.',
  },
] as const;

const title = 'Presentes para o Dia dos Professores | Bolachas da Mel';
const description =
  'Presenteie no Dia dos Professores com bolachas e biscoitos personalizados em Curitiba. Para famílias, escolas e equipes. Peça seu orçamento pelo WhatsApp.';
const shareImage = {
  url: teacherGift.image,
  width: 1024,
  height: 1536,
  alt: teacherGift.description,
};

export const landingMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: business.name,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE_URL}/`,
    title,
    description,
    siteName: business.name,
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [shareImage],
  },
};

export const landingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: business.name,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/system/logo.png`,
      image: `${SITE_URL}${shareImage.url}`,
      description,
      telephone: business.phone,
      sameAs: [business.instagram],
      address: {
        '@type': 'PostalAddress',
        addressLocality: business.city,
        addressRegion: business.state,
        addressCountry: business.country,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Orçamentos e atendimento',
        telephone: business.phone,
        url: business.whatsapp,
        availableLanguage: 'Portuguese',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: business.name,
      description,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#personalizados`,
      name: 'Presentes personalizados para o Dia dos Professores',
      serviceType: 'Bolachas e biscoitos personalizados sob encomenda',
      description:
        'Bolachas e biscoitos personalizados para presentear professores, com pedidos de famílias, alunos, escolas e empresas. Também atende celebrações e ações de marca. Orçamento e disponibilidade são confirmados pela equipe.',
      provider: { '@id': `${SITE_URL}/#organization` },
      url: `${SITE_URL}/`,
      audience: [
        { '@type': 'BusinessAudience', audienceType: 'Escolas, instituições e empresas que presenteiam professores e equipes' },
        { '@type': 'PeopleAudience', audienceType: 'Famílias e alunos que buscam presentes para professores e celebrações' },
      ],
    },
    {
      '@type': 'Product',
      '@id': `${SITE_URL}/#kit-professores`,
      name: teacherGift.name,
      description: teacherGift.description,
      image: `${SITE_URL}${teacherGift.image}`,
      url: `${SITE_URL}/#kit-professores`,
      brand: { '@id': `${SITE_URL}/#organization` },
      offers: {
        '@type': 'Offer',
        price: teacherGift.price,
        priceCurrency: 'BRL',
        url: `${SITE_URL}/#kit-professores`,
        seller: { '@id': `${SITE_URL}/#organization` },
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#duvidas`,
      url: `${SITE_URL}/#duvidas`,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
};
