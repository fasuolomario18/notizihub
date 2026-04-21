import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';
import Link from 'next/link';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notizihub.it';

const LINGUE = [
  { id: 'it', nome: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { id: 'en', nome: 'English',  flag: '🇺🇸', locale: 'en-US' },
  { id: 'es', nome: 'Español',  flag: '🇪🇸', locale: 'es-ES' },
  { id: 'de', nome: 'Deutsch',  flag: '🇩🇪', locale: 'de-DE' },
  { id: 'fr', nome: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { id: 'pt', nome: 'Português',flag: '🇧🇷', locale: 'pt-BR' },
];

export async function getStaticPaths() {
  const paths = [];
  const validLangs = LINGUE.filter(l => l.id !== 'it').map(l => l.id);

  for (const lang of validLangs) {
    const langDir = path.join(OUTPUT_DIR, lang);
    if (!fs.existsSync(langDir)) continue;
    const nicchie = fs.readdirSync(langDir).filter(f => fs.statSync(path.join(langDir, f)).isDirectory() && !f.startsWith('.'));
    for (const nicchia of nicchie) {
      const dir = path.join(langDir, nicchia);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
        if (data.slug) paths.push({ params: { lang, nicchia, slug: data.slug } });
      }
    }
  }
  return { paths, fallback: 'blocking' };
}

function parseFaq(content) {
  const sectionPattern = /## (Domande Frequenti|Frequently Asked Questions|Preguntas Frecuentes|Häufig gestellte Fragen|Questions Fréquentes|Perguntas Frequentes)([\s\S]*?)(?=\n## |\n<!-- META|$)/;
  const faqMatch = content.match(sectionPattern);
  if (!faqMatch) return [];
  const faqs = [];
  const re = /\*\*(Q|D|P|F):\s*(.*?)\*\*\s*\n(A|R):\s*(.*?)(?=\n\*\*|\n<!-- META|$)/gs;
  let m;
  while ((m = re.exec(faqMatch[2])) !== null) {
    faqs.push({ q: m[2].trim().replace(/\?$/, ''), a: m[4].trim() });
  }
  return faqs;
}

function parseTldr(content) {
  const m = content.match(/<!--\s*TLDR\s*-->([\s\S]*?)<!--\s*\/TLDR\s*-->/);
  return m ? m[1].trim() : null;
}

export async function getStaticProps({ params }) {
  const { lang, nicchia, slug } = params;
  if (!LINGUE.find(l => l.id === lang && l.id !== 'it')) return { notFound: true };

  const dir = path.join(OUTPUT_DIR, lang, nicchia);
  if (!fs.existsSync(dir)) return { notFound: true };

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let articolo = null;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      const tldr = parseTldr(content);
      const faqs = parseFaq(content);
      const cleanContent = content.replace(/<!--\s*TLDR\s*-->[\s\S]*?<!--\s*\/TLDR\s*-->\n?/g, '');
      const processed = await remark().use(html).process(cleanContent);
      articolo = { ...data, contenuto: processed.toString(), tldr, faqs };
      break;
    }
  }

  if (!articolo) return { notFound: true };

  const correlati = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.slug && data.slug !== slug) {
      correlati.push({ titolo: data.title || '', slug: data.slug, meta: data.meta_description || '', data: data.date || '' });
    }
  }
  correlati.sort((a, b) => new Date(b.data) - new Date(a.data));
  articolo.correlati = correlati.slice(0, 3);

  const lingua = LINGUE.find(l => l.id === lang) || LINGUE[1];
  return { props: { articolo, lang, nicchia, lingua }, revalidate: 86400 };
}

export default function Articolo({ articolo, lang, nicchia, lingua }) {
  const canonicalUrl = `${SITE_URL}/${lang}/${nicchia}/${articolo.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articolo.title,
    description: articolo.meta_description || '',
    datePublished: articolo.date,
    dateModified: articolo.date,
    inLanguage: lingua?.locale || 'en-US',
    publisher: { '@type': 'Organization', name: 'NotiziHub', url: SITE_URL },
    url: canonicalUrl,
    image: `${SITE_URL}/nicchie/${nicchia}.png`,
  };

  const faqSchema = articolo.faqs?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: articolo.faqs.map(f => ({
      '@type': 'Question',
      name: f.q + '?',
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const faqLabels = { it: 'Domande Frequenti', en: 'Frequently Asked Questions', es: 'Preguntas Frecuentes', de: 'Häufig gestellte Fragen', fr: 'Questions Fréquentes', pt: 'Perguntas Frequentes' };
  const correlatiLabels = { it: 'Articoli correlati', en: 'Related articles', es: 'Artículos relacionados', de: 'Ähnliche Artikel', fr: 'Articles similaires', pt: 'Artigos relacionados' };
  const sintesiLabels = { it: 'In sintesi', en: 'Summary', es: 'En resumen', de: 'Zusammenfassung', fr: 'En résumé', pt: 'Em resumo' };

  return (
    <>
      <Head>
        <title>{articolo.title} — NotiziHub</title>
        <meta name="description" content={articolo.meta_description || ''} />
        <meta property="og:title" content={articolo.title} />
        <meta property="og:description" content={articolo.meta_description || ''} />
        <meta property="og:image" content={`${SITE_URL}/nicchie/${nicchia}.png`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .article-hero { width: 100%; height: 320px; object-fit: cover; display: block; border-radius: 8px; }
          .article-body h1 { font-size: 26px; font-weight: 700; line-height: 1.35; margin: 24px 0 14px; }
          .article-body h2 { font-size: 21px; font-weight: 700; line-height: 1.3; margin: 28px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 6px; }
          .article-body p { font-size: 17px; line-height: 1.8; color: #222; margin-bottom: 16px; }
          .article-body ul, .article-body ol { margin: 12px 0 16px 24px; }
          .article-body li { font-size: 16px; line-height: 1.7; color: #222; margin-bottom: 6px; }
          .faq-item { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
          .faq-q { background: #f5f5f5; padding: 14px 16px; font-weight: 700; font-size: 15px; }
          .faq-a { padding: 14px 16px; font-size: 15px; line-height: 1.7; color: #444; }
          @media (max-width: 600px) { .article-hero { height: 200px; border-radius: 0; } }
        `}</style>
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>
        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={`/${lang}`} style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href="/" style={{ padding: '3px 7px', background: '#f0f0f0', borderRadius: 4, fontSize: 11, color: '#555' }}>🇮🇹</Link>
            {['en','es','de','fr','pt'].map(l => (
              <Link key={l} href={`/${l}`} style={{ padding: '3px 7px', background: lang === l ? '#e63946' : '#f0f0f0', borderRadius: 4, fontSize: 11, color: lang === l ? '#fff' : '#555' }}>{l.toUpperCase()}</Link>
            ))}
          </div>
        </header>

        <div style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
          <img src={`/nicchie/${nicchia}.png`} alt={articolo.nicchia_nome || nicchia} className="article-hero" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Link href={`/${lang}`} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: '#E6F1FB', color: '#0C447C', marginBottom: 16 }}>
            {articolo.nicchia_nome}
          </Link>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, color: '#111', marginBottom: 12 }}>{articolo.title}</h1>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>{articolo.date} · 5 min</div>

        {articolo.tldr && (
          <div style={{ background: '#EBF5FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #1a56db', borderRadius: 8, padding: '16px 20px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a56db', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sintesiLabels[lang] || 'Summary'}</div>
            <div style={{ fontSize: 16, lineHeight: 1.6, color: '#1e3a5f' }}>{articolo.tldr}</div>
          </div>
        )}

        <div style={{ margin: '0 0 28px', textAlign: 'center' }}>
          <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-6279755178771025" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: articolo.contenuto }} />

        {articolo.faqs?.length > 0 && (
          <div style={{ margin: '36px 0' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #e5e5e5', paddingBottom: 8 }}>{faqLabels[lang] || 'FAQ'}</h2>
            {articolo.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">❓ {f.q}?</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ margin: '32px 0', textAlign: 'center' }}>
          <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-6279755178771025" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>

        {articolo.correlati?.length > 0 && (
          <div style={{ margin: '36px 0' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #e5e5e5', paddingBottom: 8 }}>{correlatiLabels[lang] || 'Related articles'}</h2>
            {articolo.correlati.map((art, i) => (
              <Link key={i} href={`/${lang}/${nicchia}/${art.slug}`} style={{ display: 'block', padding: '14px 16px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 }}>{art.titolo}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{(art.meta || '').substring(0, 100)}...</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{art.data}</div>
              </Link>
            ))}
          </div>
        )}

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/privacy" style={{ color: '#888', marginRight: 16 }}>Privacy</Link>
            <Link href="/chi-siamo" style={{ color: '#888', marginRight: 16 }}>About</Link>
            <Link href="/contattaci" style={{ color: '#888' }}>Contact</Link>
          </div>
          © {new Date().getFullYear()} NotiziHub
        </footer>
      </div>
    </>
  );
}
