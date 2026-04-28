import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';
import Link from 'next/link';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.notizihub.com';

export async function getStaticPaths() {
  const paths = [];
  if (!fs.existsSync(OUTPUT_DIR)) return { paths: [], fallback: 'blocking' };

  const nicchie = fs.readdirSync(OUTPUT_DIR).filter(f =>
    fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.')
  );

  for (const nicchia of nicchie) {
    const dir = path.join(OUTPUT_DIR, nicchia);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      if (data.slug) {
        paths.push({ params: { nicchia, slug: data.slug } });
      }
    }
  }
  return { paths, fallback: 'blocking' };
}

function parseFaq(content) {
  const faqMatch = content.match(/## Domande Frequenti([\s\S]*?)(?=\n## |\n<!-- META|$)/);
  if (!faqMatch) return [];
  const faqs = [];
  const re = /\*\*D:\s*(.*?)\*\*\s*\n+R:\s*(.*?)(?=\n+\*\*D:|\n<!-- META|$)/gs;
  let m;
  while ((m = re.exec(faqMatch[1])) !== null) {
    const a = m[2].trim();
    if (a) faqs.push({ q: m[1].trim().replace(/\?$/, ''), a });
  }
  return faqs;
}

function parseTldr(content) {
  const m = content.match(/<!--\s*TLDR\s*-->([\s\S]*?)<!--\s*\/TLDR\s*-->/);
  return m ? m[1].trim() : null;
}

function stripTldrMarkers(content) {
  return content.replace(/<!--\s*TLDR\s*-->[\s\S]*?<!--\s*\/TLDR\s*-->\n?/g, '');
}

export async function getStaticProps({ params }) {
  const dir = path.join(OUTPUT_DIR, params.nicchia);
  if (!fs.existsSync(dir)) return { notFound: true };

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let articolo = null;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === params.slug) {
      const tldr = parseTldr(content);
      const faqs = parseFaq(content);
      // Strip TLDR markers and the first H1 (rendered separately in the template)
      const cleanContent = stripTldrMarkers(content).replace(/^#\s+.+\n?/m, '');
      const processed = await remark().use(html).process(cleanContent);
      articolo = { ...data, contenuto: processed.toString(), tldr, faqs };
      break;
    }
  }

  if (!articolo) return { notFound: true };

  // articoli correlati (stessa nicchia, escludi corrente)
  const correlati = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.slug && data.slug !== params.slug) {
      correlati.push({ titolo: data.title || '', slug: data.slug, meta: data.meta_description || '', data: data.date || '' });
    }
  }
  correlati.sort((a, b) => new Date(b.data) - new Date(a.data));
  articolo.correlati = correlati.slice(0, 3);

  return { props: { articolo }, revalidate: 86400 };
}

export default function Articolo({ articolo }) {
  const canonicalUrl = `${SITE_URL}/${articolo.nicchia}/${articolo.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articolo.title,
    description: articolo.meta_description || '',
    datePublished: articolo.date,
    dateModified: articolo.date,
    author: { '@type': 'Organization', name: 'Redazione NotiziHub', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'NotiziHub', url: SITE_URL },
    url: canonicalUrl,
    image: articolo.image_url || `${SITE_URL}/nicchie/${articolo.nicchia}.png`,
  };

  const faqSchema = articolo.faqs && articolo.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: articolo.faqs.filter(f => f.a && f.a.trim()).map(f => ({
      '@type': 'Question',
      name: f.q + '?',
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <>
      <Head>
        <title>{articolo.title} — NotiziHub</title>
        <meta name="description" content={articolo.meta_description || ''} />
        <meta property="og:title" content={articolo.title} />
        <meta property="og:description" content={articolo.meta_description || ''} />
        <meta property="og:image" content={articolo.image_url || `${SITE_URL}/nicchie/${articolo.nicchia}.png`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="it" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .article-hero { width: 100%; height: 320px; object-fit: cover; display: block; border-radius: 8px; }
          .article-body h1 { font-size: 26px; font-weight: 700; line-height: 1.35; margin: 24px 0 14px; }
          .article-body h2 { font-size: 21px; font-weight: 700; line-height: 1.3; margin: 28px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 6px; }
          .article-body h3 { font-size: 17px; font-weight: 700; margin: 20px 0 10px; }
          .article-body p { font-size: 17px; line-height: 1.8; color: #222; margin-bottom: 16px; }
          .article-body ul, .article-body ol { margin: 12px 0 16px 24px; }
          .article-body li { font-size: 16px; line-height: 1.7; color: #222; margin-bottom: 6px; }
          .article-body strong { font-weight: 700; }
          .faq-item { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
          .faq-q { background: #f5f5f5; padding: 14px 16px; font-weight: 700; font-size: 15px; cursor: pointer; }
          .faq-a { padding: 14px 16px; font-size: 15px; line-height: 1.7; color: #444; }
          @media (max-width: 600px) {
            .article-hero { height: 200px; border-radius: 0; }
            .article-body h1 { font-size: 22px; }
            .article-body h2 { font-size: 18px; }
            .article-body p { font-size: 16px; }
          }
        `}</style>
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>

        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
        </header>

        <div style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
          <img src={articolo.image_url || `/nicchie/${articolo.nicchia}.png`} alt={articolo.title || articolo.nicchia_nome} className="article-hero" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Link href={`/nicchia/${articolo.nicchia}`} style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 99,
            fontSize: 12, fontWeight: 600, background: '#E6F1FB', color: '#0C447C', marginBottom: 16
          }}>{articolo.nicchia_nome}</Link>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, color: '#111', marginBottom: 12 }}>
          {articolo.title}
        </h1>

        <div style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
          <span style={{ fontWeight: 600, color: '#555' }}>Redazione NotiziHub</span> · Pubblicato il {articolo.date} · Lettura: 5 min
        </div>

        {articolo.tldr && (
          <div style={{ background: '#EBF5FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #1a56db', borderRadius: 8, padding: '16px 20px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a56db', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>In sintesi</div>
            <div style={{ fontSize: 16, lineHeight: 1.6, color: '#1e3a5f' }}>{articolo.tldr}</div>
          </div>
        )}

        <div style={{ margin: '0 0 28px', textAlign: 'center' }}>
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6279755178771025"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: articolo.contenuto }} />

        {articolo.faqs && articolo.faqs.length > 0 && (
          <div style={{ margin: '36px 0' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #e5e5e5', paddingBottom: 8 }}>Domande Frequenti</h2>
            {articolo.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">❓ {f.q}?</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ margin: '32px 0', textAlign: 'center' }}>
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6279755178771025"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>

        {articolo.correlati && articolo.correlati.length > 0 && (
          <div style={{ margin: '36px 0' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #e5e5e5', paddingBottom: 8 }}>Articoli correlati</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {articolo.correlati.map((art, i) => (
                <Link key={i} href={`/${articolo.nicchia}/${art.slug}`} style={{ display: 'block', padding: '14px 16px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', transition: 'border-color 0.15s' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 }}>{art.titolo}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{(art.meta || '').substring(0, 100)}...</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{art.data}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/privacy" style={{ color: '#888', marginRight: 16 }}>Privacy Policy</Link>
            <Link href="/chi-siamo" style={{ color: '#888', marginRight: 16 }}>Chi siamo</Link>
            <Link href="/contattaci" style={{ color: '#888' }}>Contattaci</Link>
          </div>
          © {new Date().getFullYear()} NotiziHub
        </footer>
      </div>
    </>
  );
}
