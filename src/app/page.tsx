import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Cookie, Gift, Heart, Instagram, MapPin, MessageCircle, PackageCheck, Sparkles } from 'lucide-react';
import QuoteForm from '@/components/landing/QuoteForm';
import { business, faq, landingMetadata, landingStructuredData, teacherGift } from '@/lib/landing-content';
import styles from './landing.module.css';

/* THESIS: A sweet thank-you to the teachers who make a difference.
 * OWN-WORLD: Plum, warm paper, red ribbons and personalized Teachers' Day gifts.
 * STORY: Discover recent creations, choose a personal or school gift, request a quote.
 * FIRST VIEWPORT: Teacher-focused message left; real September cookie photo and featured gift right.
 * FORM: A seasonal gift atelier, with original images and an inline brief, no chatbot.
 */
export const metadata = landingMetadata;

const gallery = [
  { image: teacherGift.image, title: teacherGift.name, description: 'Uma caneca personalizada e 8 bolachas em formato de lápis com chocolate. Um presente para agradecer a quem ensina com amor.', alt: teacherGift.description, label: 'Kit Dia dos Professores', link: teacherGift.whatsappUrl, contain: true, id: 'kit-professores', price: teacherGift.priceLabel },
  { image: 'bolachas-com-marca.jpg', title: 'Sua mensagem em cada bolacha.', description: 'Uma criação recente com marca e laço. Inspire-se para homenagear a sua equipe.', alt: 'Bolachas personalizadas para a Fratelli Livraria em embalagens individuais com laços vermelhos', label: 'Personalização para equipes', link: '#orcamento', contain: false },
  { image: 'bolachas-com-chocolate.jpg', title: 'Um doce jeito de agradecer.', description: 'Bolachas com chocolate e embalagem individual, em uma das nossas criações de setembro.', alt: 'Bolachas com cobertura de chocolate branco e escuro, embaladas individualmente pela Bolachas da Mel', label: 'Para presentear', link: '#orcamento', contain: false },
];

export default function Home() {
  return (
    <div className={styles.landing}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(landingStructuredData).replace(/</g, '\\u003c') }} />
      <a href="#conteudo" className={styles.skipLink}>Pular para o conteúdo</a>
      <div className={styles.announcement}><BookOpen size={14} aria-hidden="true" /> Dia dos Professores · Um carinho para quem ensina.</div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Bolachas da Mel — início">
            <Image src="/images/system/logo.png" alt="" width={52} height={52} sizes="52px" />
            <span>bolachas <span className={styles.brandBottom}>da <b>Mel</b><span className={styles.brandDot}>.</span></span></span>
          </Link>
          <nav className={styles.nav} aria-label="Navegação principal">
            <a href="#personalizados">Presentes para professores</a><a href="#empresas">Para escolas e equipes</a><a href="#como-funciona">Como encomendar</a><a href="#sobre">Nossa história</a>
          </nav>
          <a href="#orcamento" className={styles.headerCta}>Pedir orçamento <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </header>

      <main id="conteudo">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span /> ESPECIAL DIA DOS PROFESSORES</p>
              <h1 id="hero-title"><span>Quem ensina<br /> merece um</span><em>carinho<br className={styles.desktopBreak} /> especial.</em></h1>
              <p className={styles.heroDescription}>Bolachas e biscoitos personalizados para agradecer a quem faz a diferença. Um presente cheio de sabor para o seu professor — ou para toda a equipe da escola.</p>
              <div className={styles.heroActions}>
                <a href="#orcamento" className={styles.button}>Quero presentear <ArrowUpRight size={19} aria-hidden="true" /></a>
                <a href="#personalizados" className={styles.textLink}>Ver as ideias de presentes <ArrowDown size={17} aria-hidden="true" /></a>
              </div>
              <div className={styles.heroNote}><Heart size={15} aria-hidden="true" /><span>Feitas à mão em Curitiba. Encomendas sob consulta.</span></div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroImage}><Image src="/images/landing/bolachas-com-chocolate.jpg" alt="Criação recente da Bolachas da Mel: bolachas com chocolate, prontas para presentear" fill priority sizes="(max-width: 600px) 85vw, 42vw" /></div>
              <div className={styles.seal}><BookOpen size={22} strokeWidth={1.4} aria-hidden="true" /><span>para quem<br /><strong>nos inspira</strong></span></div>
              <a href="#kit-professores" className={styles.photoInset} aria-label={`Conheça o kit com caneca e 8 bolachas por ${teacherGift.priceLabel}`}>
                <div className={styles.insetImage}><Image src={teacherGift.image} alt={teacherGift.description} fill sizes="(max-width: 800px) 145px, 190px" /></div>
                <span>Caneca + 8 bolachas · {teacherGift.priceLabel}</span>
              </a>
              <div className={styles.imageCaption}><span className={styles.captionDot} /> Criações recentes. O mesmo carinho de sempre.</div>
            </div>
          </div>
        </section>

        <div className={styles.promiseBar} aria-label="O que faz cada encomenda especial">
          <span><Cookie aria-hidden="true" size={21} /> Produção artesanal</span><span className={styles.barStar} aria-hidden="true">✳</span>
          <span><Sparkles aria-hidden="true" size={21} /> Personalização com significado</span><span className={styles.barStar} aria-hidden="true">✳</span>
          <span><Gift aria-hidden="true" size={21} /> Para professores e equipes</span><span className={styles.barStar} aria-hidden="true">✳</span>
          <span><MessageCircle aria-hidden="true" size={21} /> Atendimento próximo</span>
        </div>

        <section id="personalizados" className={`${styles.container} ${styles.section}`} aria-labelledby="creations-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Dia dos Professores, do nosso jeitinho</p><h2 id="creations-title">Para quem deixa<br /><em>marcas tão bonitas.</em></h2></div>
            <p>Caneca personalizada, bolachas em formato de lápis e muito carinho. Conheça o kit especial e outras ideias para presentear professores e equipes.</p>
          </div>
          <div className={styles.gallery}>
            {gallery.map((item) => (
              <article key={item.image} id={item.id} className={styles.galleryItem}>
                <a href={item.link} target={item.link.startsWith('https') ? '_blank' : undefined} rel={item.link.startsWith('https') ? 'noopener noreferrer' : undefined} className={`${styles.galleryImage} ${item.contain ? styles.productPoster : ''}`} aria-label={`Consultar ${item.label.toLowerCase()}`}>
                  <Image src={item.image.startsWith('/') ? item.image : `/images/landing/${item.image}`} alt={item.alt} fill sizes="(max-width: 600px) 90vw, 30vw" />
                  <span className={styles.imageLabel}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></span>
                </a>
                <h3>{item.title}</h3><p>{item.description}</p>
                {item.price && <div className={styles.productOffer}><strong>{item.price}<small>o kit</small></strong><a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.button}>Quero este kit <ArrowUpRight size={17} aria-hidden="true" /></a><p>Personalização e disponibilidade pelo WhatsApp.</p></div>}
              </article>
            ))}
          </div>
          <p className={styles.galleryFoot}>Uma lembrança para a professora ou um pedido para a escola inteira? <a href="#orcamento">Vamos combinar <ArrowRight size={15} aria-hidden="true" /></a></p>
        </section>

        <section id="empresas" className={styles.audienceSection} aria-labelledby="audience-title">
          <div className={styles.container}>
            <div className={styles.centerHeading}><p className={styles.kicker}>Todo professor merece esse carinho</p><h2 id="audience-title">Um agradecimento.<br /><em>Do seu tamanho.</em></h2></div>
            <div className={styles.audiences}>
              <article className={styles.businessCard}>
                <div className={styles.audienceTop}><span>PARA ESCOLAS & EQUIPES</span><BookOpen size={29} strokeWidth={1.3} aria-hidden="true" /></div>
                <h3>Uma equipe inteira.<br />O mesmo cuidado.</h3>
                <p>Reconheça quem ensina todos os dias. Planeje uma homenagem da escola ou da empresa com bolachas personalizadas e uma mensagem de gratidão.</p>
                <ul><li><Check size={17} aria-hidden="true" /> Lembranças para professores e educadores</li><li><Check size={17} aria-hidden="true" /> Personalização para a escola ou equipe</li><li><Check size={17} aria-hidden="true" /> Quantidades e embalagens sob consulta</li></ul>
                <a href={`${business.whatsapp}?text=${encodeURIComponent('Olá! Quero um orçamento para o Dia dos Professores, para presentear a equipe da minha escola ou empresa.')}`} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.lightButton}`}>Pedir orçamento para minha equipe <ArrowUpRight size={18} aria-hidden="true" /></a>
                <span className={styles.audienceNote}>Conte a sua ideia. Alinhamos os detalhes com você.</span>
              </article>
              <article className={styles.personalCard}>
                <div className={styles.audienceTop}><span>PARA UM PROFESSOR ESPECIAL</span><Heart size={29} strokeWidth={1.3} aria-hidden="true" /></div>
                <h3>Um simples gesto.<br />Um grande obrigado.</h3>
                <p>Da família, do aluno ou da turma: transforme o carinho por aquele professor em uma lembrança feita para ele.</p>
                <ul><li><Check size={17} aria-hidden="true" /> Presentes de famílias e alunos</li><li><Check size={17} aria-hidden="true" /> Uma homenagem da turma</li><li><Check size={17} aria-hidden="true" /> Ideias e mensagens personalizadas</li></ul>
                <a href={`${business.whatsapp}?text=${encodeURIComponent('Olá! Quero conhecer os presentes e pedir um orçamento para o Dia dos Professores.')}`} target="_blank" rel="noopener noreferrer" className={`${styles.button} ${styles.outlineButton}`}>Escolher o presente do meu professor <ArrowUpRight size={18} aria-hidden="true" /></a>
                <span className={styles.audienceNote}>Conte para quem é. A gente ajuda com as possibilidades.</span>
              </article>
            </div>
          </div>
        </section>

        <section id="como-funciona" className={`${styles.container} ${styles.section}`} aria-labelledby="process-title">
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>É mais simples do que parece</p><h2 id="process-title">Sua homenagem começa<br /><em>com uma conversa.</em></h2></div><a href="#orcamento" className={styles.textLink}>Começar meu pedido <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          <ol className={styles.steps}>
            <li><span className={styles.stepNumber}>01</span><h3>Conte quem vai receber</h3><p>Um professor, a turma ou uma equipe. Compartilhe sua ideia, a quantidade e quando precisa do presente.</p></li>
            <li><span className={styles.stepNumber}>02</span><h3>Combinamos os detalhes</h3><p>Alinhamos personalização, embalagem, valores e disponibilidade antes de confirmar sua encomenda.</p></li>
            <li><span className={styles.stepNumber}>03</span><h3>É hora de encantar</h3><p>Com tudo aprovado, preparamos suas bolachas com cuidado e combinamos a entrega ou retirada.</p></li>
          </ol>
        </section>

        <section id="sobre" className={styles.storySection} aria-labelledby="story-title">
          <div className={`${styles.container} ${styles.storyGrid}`}>
            <div className={styles.storyImage}><Image src="/images/system/about-us.png" alt="A família por trás da Bolachas da Mel" fill sizes="(max-width: 600px) 90vw, 40vw" /><span>Uma história de mãe. Um mundo de afeto.</span></div>
            <div className={styles.storyCopy}><Heart size={34} strokeWidth={1.2} aria-hidden="true" /><p className={styles.kicker}>Muito prazer, somos a Bolachas da Mel</p><h2 id="story-title">Tudo começou<br /><em>com um grande amor.</em></h2><p>A chegada da nossa menina trouxe cor, doçura e a coragem de começar um novo caminho. Assim nasceu a Bolachas da Mel.</p><p>De Curitiba, levamos esse carinho para cada fornada. Porque, para a gente, uma bolachinha pode ser muito mais: um agradecimento, uma celebração, um pedacinho da sua história.</p><a href={business.instagram} target="_blank" rel="noopener noreferrer" className={styles.textLink}><Instagram size={19} aria-hidden="true" /> Acompanhe nosso dia a dia <ArrowUpRight size={16} aria-hidden="true" /></a></div>
          </div>
        </section>

        <section id="duvidas" className={`${styles.container} ${styles.section} ${styles.faqGrid}`} aria-labelledby="faq-title">
          <div><p className={styles.kicker}>Antes de adoçar o seu dia</p><h2 id="faq-title">Podemos<br /><em>te ajudar?</em></h2><p className={styles.faqIntro}>Algumas respostas para tirar sua ideia do papel. E, se faltar alguma coisa, é só chamar.</p><a href={business.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Falar com a gente <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          <div className={styles.faqList}>{faq.map(({ question, answer }) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
        </section>

        <section id="orcamento" className={styles.quoteSection} aria-labelledby="quote-title">
          <div className={`${styles.container} ${styles.quoteGrid}`}>
            <div className={styles.quoteCopy}><p className={styles.kicker}>Dia dos Professores com mais carinho</p><h2 id="quote-title">Vamos adoçar<br />esse <em>obrigado?</em></h2><p>Conte para quem é o presente e o que você imagina. Levamos os detalhes para o WhatsApp e confirmamos as opções e a disponibilidade por lá.</p><div className={styles.quoteBenefits}><span><MessageCircle size={19} aria-hidden="true" /> Atendimento de gente para gente</span><span><PackageCheck size={19} aria-hidden="true" /> Detalhes combinados antes da confirmação</span></div><a href={business.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Prefiro falar direto no WhatsApp <ArrowUpRight size={16} aria-hidden="true" /></a></div>
            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div><Link href="/" className={styles.footerBrand}>bolachas da <em>Mel.</em></Link><p>Pequenos biscoitos. Grandes significados.</p></div>
          <div className={styles.footerLinks}><a href={business.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} aria-hidden="true" /> {business.instagramHandle}</a><a href={business.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> {business.phoneDisplay}</a><span><MapPin size={17} aria-hidden="true" /> Curitiba, Paraná</span></div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}><span>© {new Date().getFullYear()} Bolachas da Mel. Feitas com carinho.</span><div><Link href="/old" prefetch={false}>Catálogo original</Link><a href="#duvidas">Dúvidas frequentes</a></div></div>
      </footer>
      <a className={styles.floatingContact} href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Conversar com a Bolachas da Mel no WhatsApp"><MessageCircle size={23} aria-hidden="true" /><span>Vamos conversar?</span></a>
    </div>
  );
}
