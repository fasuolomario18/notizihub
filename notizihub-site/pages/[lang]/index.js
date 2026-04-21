import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notizihub.it';

const LINGUE = [
  { id: 'it', nome: 'Italiano', flag: '🇮🇹' },
  { id: 'en', nome: 'English',  flag: '🇺🇸' },
  { id: 'es', nome: 'Español',  flag: '🇪🇸' },
  { id: 'de', nome: 'Deutsch',  flag: '🇩🇪' },
  { id: 'fr', nome: 'Français', flag: '🇫🇷' },
  { id: 'pt', nome: 'Português',flag: '🇧🇷' },
];

const NICCHIE_META = [
  { id: 'finanza', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'crypto', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'tech', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'salute', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'viaggi', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'motori', colore: '#166534', bg: '#F0FDF4' },
  { id: 'gaming', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'casa', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'lavoro', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'sport', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'assicurazioni', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'fisco', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'pensioni', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'prestiti', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'trading', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'cucina', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'moda', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'bellezza', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'animali', colore: '#166534', bg: '#F0FDF4' },
  { id: 'ambiente', colore: '#166534', bg: '#F0FDF4' },
  { id: 'startup', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'smartphone', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'scienza', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'psicologia', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'cinema', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'energia', colore: '#b45309', bg: '#FFFBEB' },
];

function getNicchiaMeta(id) {
  return NICCHIE_META.find(n => n.id === id) || { colore: '#111', bg: '#f5f5f5' };
}

export async function getStaticPaths() {
  return {
    paths: LINGUE.filter(l => l.id !== 'it').map(l => ({ params: { lang: l.id } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const lang = params.lang;
  if (!LINGUE.find(l => l.id === lang)) return { notFound: true };

  const langDir = path.join(OUTPUT_DIR, lang);
  const tutti = [];

  if (fs.existsSync(langDir)) {
    const nicchie = fs.readdirSync(langDir).filter(f =>
      fs.statSync(path.join(langDir, f)).isDirectory() && !f.startsWith('.')
    );
    for (const nicchia of nicchie) {
      const dir = path.join(langDir, nicchia);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
        tutti.push({
          titolo: data.title || '',
          slug: data.slug || '',
          nicchia,
          nicchia_nome: data.nicchia_nome || nicchia,
          data: data.date || '',
          meta: data.meta_description || '',
        });
      }
    }
  }

  tutti.sort((a, b) => new Date(b.data) - new Date(a.data));
  const lingua = LINGUE.find(l => l.id === lang);

  return { props: { articoli: tutti.slice(0, 30), lang, lingua }, revalidate: 3600 };
}

export default function LangHome({ articoli, lang, lingua }) {
  const [menuAperto, setMenuAperto] = useState(false);
  const principale = articoli[0];
  const secondari = articoli.slice(1, 4);
  const resto = articoli.slice(4);

  const titles = { it: 'NotiziHub — Notizie aggiornate', en: 'NotiziHub — Daily News', es: 'NotiziHub — Noticias del Día', de: 'NotiziHub — Aktuelle Nachrichten', fr: 'NotiziHub — Actualités', pt: 'NotiziHub — Notícias do Dia' };
  const descriptions = { it: 'Notizie italiane aggiornate ogni giorno.', en: 'Daily news updated every day.', es: 'Noticias actualizadas cada día.', de: 'Täglich aktualisierte Nachrichten.', fr: 'Actualités mises à jour chaque jour.', pt: 'Notícias atualizadas todos os dias.' };

  return (
    <>
      <Head>
        <title>{titles[lang] || titles.en}</title>
        <meta name="description" content={descriptions[lang] || descriptions.en} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}/`} />
        {LINGUE.filter(l => l.id !== 'it').map(l => (
          <link key={l.id} rel="alternate" hrefLang={l.id} href={`${SITE_URL}/${l.id}`} />
        ))}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-family: system-ui; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
          .art-title:hover { color: #e63946 !important; }
          @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr !important; } .articles-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </Head>

      <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ padding: '10px 0 8px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#888' }}>
              {new Date().toLocaleDateString(lingua?.locale || 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {/* Selettore lingua */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '3px 8px', background: lang === 'it' ? '#e63946' : '#222', borderRadius: 4, fontSize: 12, color: '#fff', fontFamily: 'system-ui' }}>🇮🇹 IT</Link>
              {LINGUE.filter(l => l.id !== 'it').map(l => (
                <Link key={l.id} href={`/${l.id}`} style={{ padding: '3px 8px', background: lang === l.id ? '#e63946' : '#222', borderRadius: 4, fontSize: 12, color: '#fff', fontFamily: 'system-ui' }}>{l.flag} {l.id.toUpperCase()}</Link>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 0 10px' }}>
            <Link href={`/${lang}`} style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: '#fff' }}>NotiziHub</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        {!principale && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontFamily: 'system-ui' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
            <div style={{ fontSize: 20, marginBottom: 8 }}>Content being generated...</div>
            <div style={{ fontSize: 14 }}>Articles in {lingua?.nome} will appear here after the next run.</div>
          </div>
        )}

        {principale && (
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28, paddingBottom: 28, borderBottom: '2px solid #111' }}>
            <div>
              <img src={`/nicchie/${principale.nicchia}.png`} alt={principale.nicchia_nome} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 6, marginBottom: 14, display: 'block' }} />
              <span className="badge" style={{ background: getNicchiaMeta(principale.nicchia).bg, color: getNicchiaMeta(principale.nicchia).colore, marginBottom: 12, display: 'inline-block' }}>{principale.nicchia_nome}</span>
              <Link href={`/${lang}/${principale.nicchia}/${principale.slug}`}>
                <h1 className="art-title" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12, color: '#111' }}>{principale.titolo}</h1>
              </Link>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, fontFamily: 'system-ui' }}>{principale.meta}</p>
              <div style={{ fontFamily: 'system-ui', fontSize: 12, color: '#999', marginTop: 8 }}>{principale.data}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {secondari.map((art, i) => {
                const ni = getNicchiaMeta(art.nicchia);
                return (
                  <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < secondari.length - 1 ? '1px solid #e5e5e5' : 'none' }}>
                    <span className="badge" style={{ background: ni.bg, color: ni.colore, marginBottom: 6, display: 'inline-block' }}>{art.nicchia_nome}</span>
                    <Link href={`/${lang}/${art.nicchia}/${art.slug}`}>
                      <h3 className="art-title" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#111' }}>{art.titolo}</h3>
                    </Link>
                    <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#999', marginTop: 4 }}>{art.data}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {resto.map((art, i) => {
            const ni = getNicchiaMeta(art.nicchia);
            return (
              <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e5e5', background: '#fff' }}>
                <img src={`/nicchie/${art.nicchia}.png`} alt={art.nicchia_nome} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <div style={{ borderTop: `3px solid ${ni.colore}`, padding: '12px 14px 14px' }}>
                  <span className="badge" style={{ background: ni.bg, color: ni.colore, marginBottom: 8, display: 'inline-block' }}>{art.nicchia_nome}</span>
                  <Link href={`/${lang}/${art.nicchia}/${art.slug}`}>
                    <h2 className="art-title" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8, color: '#111' }}>{art.titolo}</h2>
                  </Link>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, fontFamily: 'system-ui', marginBottom: 8 }}>{(art.meta || '').substring(0, 100)}...</p>
                  <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#999' }}>{art.data}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer style={{ background: '#111', color: '#888', marginTop: 48, padding: '24px 16px', textAlign: 'center', fontFamily: 'system-ui', fontSize: 13 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>NotiziHub</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {LINGUE.map(l => (
              <Link key={l.id} href={l.id === 'it' ? '/' : `/${l.id}`} style={{ color: lang === l.id ? '#fff' : '#666' }}>{l.flag} {l.nome}</Link>
            ))}
          </div>
          <div>© {new Date().getFullYear()} NotiziHub · <Link href="/privacy" style={{ color: '#666' }}>Privacy</Link> · <Link href="/chi-siamo" style={{ color: '#666' }}>About</Link></div>
        </div>
      </footer>
    </>
  );
}
