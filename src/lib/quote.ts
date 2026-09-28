export const WHATSAPP_NUMBER = '5541998038007';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export type QuoteAudience = 'business' | 'personal';

export type QuoteDetails = {
  audience: QuoteAudience;
  occasion: string;
  customization: string;
  quantity: string;
  date: string;
  city: string;
};

export type QuoteErrors = Partial<Record<keyof QuoteDetails, string>>;

export function getLocalDate(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function validateQuote(details: QuoteDetails, today = getLocalDate()): QuoteErrors {
  const errors: QuoteErrors = {};
  const quantity = details.quantity.trim();

  if (quantity && (!/^\d+$/.test(quantity) || Number(quantity) < 1)) {
    errors.quantity = 'Informe uma quantidade inteira maior que zero, ou deixe em branco.';
  }

  if (details.date) {
    const date = new Date(`${details.date}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(details.date) || getLocalDate(date) !== details.date) {
      errors.date = 'Escolha uma data válida, ou deixe em branco.';
    } else if (details.date < today) {
      errors.date = 'Escolha uma data a partir de hoje, ou deixe em branco.';
    }
  }

  return errors;
}

export function buildQuoteMessage(details: QuoteDetails): string {
  const date = details.date ? details.date.split('-').reverse().join('/') : 'a definir';

  return [
    'Olá, Bolachas da Mel! Quero um orçamento de bolachas personalizadas.',
    '',
    `Pedido para: ${details.audience === 'business' ? 'minha empresa (B2B)' : 'uma celebração ou presente (B2C)'}`,
    `Ocasião: ${details.occasion.trim() || 'a definir'}`,
    `Personalização: ${details.customization.trim() || 'quero ajuda para escolher'}`,
    `Quantidade estimada: ${details.quantity.trim() || 'a definir'}`,
    `Data desejada: ${date}`,
    `Cidade / UF: ${details.city.trim() || 'a definir'}`,
    '',
    'Podem me ajudar com as opções, os valores e a disponibilidade?',
  ].join('\n');
}

export function buildWhatsAppUrl(details: QuoteDetails): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(buildQuoteMessage(details))}`;
}
