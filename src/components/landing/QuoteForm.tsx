'use client';

import { useState, type FormEvent } from 'react';
import {
  buildQuoteMessage,
  validateQuote,
  WHATSAPP_URL,
  type QuoteDetails,
  type QuoteErrors,
} from '@/lib/quote';
import styles from './QuoteForm.module.css';

const initialDetails: QuoteDetails = {
  audience: 'personal',
  occasion: 'Dia dos Professores',
  customization: '',
  quantity: '',
  date: '',
  city: '',
};

/** Place once inside the landing page's #orcamento section. */
export default function QuoteForm() {
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState<QuoteErrors>({});

  function update<Key extends keyof QuoteDetails>(field: Key, value: QuoteDetails[Key]) {
    setDetails((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = validateQuote(details);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];

    if (firstError) {
      event.preventDefault();
      document.getElementById(`quote-${firstError}`)?.focus();
    }
  }

  return (
    <>
      <noscript>
        <style>{'#quote-form { display: none; }'}</style>
        <div className={styles.form}>
          <p>Para o Dia dos Professores ou outra ocasião, conte sua ideia: a personalização e a quantidade que você imagina.</p>
          <a className={styles.submit} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Pedir orçamento pelo WhatsApp
          </a>
          <p className={styles.reassurance}>Nossa equipe ajuda com as opções, os valores e os prazos.</p>
        </div>
      </noscript>
      <form
        id="quote-form"
        className={styles.form}
        action={WHATSAPP_URL}
        method="get"
        target="_blank"
        rel="noopener noreferrer"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Pedir orçamento de bolachas personalizadas"
        aria-describedby="quote-form-note"
      >
        <input type="hidden" name="text" value={buildQuoteMessage(details)} />

        <fieldset className={styles.audience}>
          <legend>Quero bolachas para...</legend>
          <div className={styles.audienceOptions}>
            <label className={styles.audienceOption}>
              <input
                type="radio"
                checked={details.audience === 'personal'}
                onChange={() => update('audience', 'personal')}
                value="personal"
                name="quote-audience"
              />
              <span>
                <strong>Um professor especial</strong>
                <small>Famílias, alunos e presentes</small>
              </span>
            </label>
            <label className={styles.audienceOption}>
              <input
                type="radio"
                checked={details.audience === 'business'}
                onChange={() => update('audience', 'business')}
                value="business"
                name="quote-audience"
              />
              <span>
                <strong>Minha escola ou equipe</strong>
                <small>Escolas, empresas e grupos</small>
              </span>
            </label>
          </div>
        </fieldset>

        <p id="quote-form-note" className={styles.optionalNote}>
          Preencha o que já souber. O resto a gente combina.
        </p>

        <div className={styles.field}>
          <label htmlFor="quote-occasion">Qual é a ocasião?</label>
          <input
            id="quote-occasion"
            type="text"
            maxLength={120}
            value={details.occasion}
            onChange={(event) => update('occasion', event.target.value)}
            placeholder={details.audience === 'business' ? 'Ex.: Dia dos Professores, homenagem à equipe' : 'Ex.: Dia dos Professores, aniversário, presente especial'}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="quote-customization">Como você imagina suas bolachas?</label>
          <textarea
            id="quote-customization"
            rows={3}
            maxLength={600}
            value={details.customization}
            onChange={(event) => update('customization', event.target.value)}
            placeholder={details.audience === 'business' ? 'Nome da escola, identidade visual, embalagem... conte sua ideia.' : 'Nome do professor, mensagem de carinho, cores... conte sua ideia.'}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="quote-quantity">Quantidade estimada</label>
            <input
              id="quote-quantity"
              type="text"
              inputMode="numeric"
              maxLength={7}
              value={details.quantity}
              onChange={(event) => update('quantity', event.target.value)}
              placeholder="Ex.: 50"
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={errors.quantity ? 'quote-quantity-error' : undefined}
            />
            {errors.quantity ? <p className={styles.error} id="quote-quantity-error" role="alert">{errors.quantity}</p> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="quote-date">Data desejada</label>
            <input
              id="quote-date"
              type="date"
              value={details.date}
              onChange={(event) => update('date', event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'quote-date-error' : undefined}
            />
            {errors.date ? <p className={styles.error} id="quote-date-error" role="alert">{errors.date}</p> : null}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="quote-city">Cidade / UF</label>
          <input
            id="quote-city"
            type="text"
            autoComplete="address-level2"
            maxLength={100}
            value={details.city}
            onChange={(event) => update('city', event.target.value)}
            placeholder="Ex.: Curitiba / PR"
          />
        </div>

        <button type="submit" className={styles.submit}>
          Pedir orçamento pelo WhatsApp
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className={styles.reassurance}>
          Abre o WhatsApp com sua ideia pronta para enviar. Nossa equipe confirma valores, prazos e entrega.
        </p>
      </form>
    </>
  );
}
