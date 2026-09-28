// Run with Node 22.18+: node scripts/test-quote.cjs
const assert = require('node:assert/strict');
const { buildQuoteMessage, buildWhatsAppUrl, getLocalDate, validateQuote } = require('../src/lib/quote.ts');

const details = {
  audience: 'business',
  occasion: 'Lançamento & café',
  customization: 'Logo + cores da marca\nEmbalagem especial',
  quantity: '120',
  date: '2026-10-25',
  city: 'Curitiba / PR',
};

const url = new URL(buildWhatsAppUrl(details));
assert.equal(url.origin + url.pathname, 'https://wa.me/5541998038007');
assert.equal(url.searchParams.get('text'), buildQuoteMessage(details));
assert.deepEqual([...url.searchParams.keys()], ['text']);
for (const value of ['minha empresa (B2B)', details.occasion, details.customization, '120', '25/10/2026', details.city]) {
  assert.ok(url.searchParams.get('text').includes(value));
}

assert.deepEqual(validateQuote(details, '2026-09-25'), {});
assert.equal(getLocalDate(new Date(2026, 8, 25)), '2026-09-25');
assert.ok(validateQuote({ ...details, date: '2026-09-24' }, '2026-09-25').date);
assert.ok(validateQuote({ ...details, date: '2026-02-30' }, '2026-01-01').date);
assert.deepEqual(validateQuote({ ...details, date: '2026-09-25' }, '2026-09-25'), {});
for (const quantity of ['-1', '0', '2.5', '1e2', 'abc']) {
  assert.ok(validateQuote({ ...details, quantity }, '2026-09-25').quantity);
}

const empty = { audience: 'personal', occasion: '', customization: '', quantity: '', date: '', city: '' };
assert.deepEqual(validateQuote(empty, '2026-09-25'), {});
assert.ok(buildQuoteMessage(empty).includes('uma celebração ou presente (B2C)'));
assert.ok(buildQuoteMessage(empty).includes('quero ajuda para escolher'));
assert.ok(buildQuoteMessage(empty).includes('Data desejada: a definir'));
console.log('Quote checks passed: WhatsApp encoding, both audiences, optional fields, quantity and date validation.');
