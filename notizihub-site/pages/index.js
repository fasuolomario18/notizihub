import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';

const NICCHIE = [
  { id: 'finanza', nome: 'Finanza', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'crypto', nome: 'Crypto', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'tech', nome: 'Tech & AI', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'salute', nome: 'Salute', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'viaggi', nome: 'Viaggi', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'motori', nome: 'Motori', colore: '#166534', bg: '#F0FDF4' },
  { id: 'gaming', nome: 'Gaming', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'casa', nome: 'Casa', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'lavoro', nome: 'Lavoro', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'sport', nome: 'Sport', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'assicurazioni', nome: 'Assicurazioni', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'fisco', nome: 'Fisco & Tasse', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'pensioni', nome: 'Pensioni', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'prestiti', nome: 'Prestiti', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'trading', nome: 'Trading', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'cucina', nome: 'Cucina', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'moda', nome: 'Moda', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'bellezza', nome: 'Bellezza', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'genitori', nome: 'Genitori', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'animali', nome: 'Animali', colore: '#166534', bg: '#F0FDF4' },
  { id: 'politica', nome: 'Politica', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'esteri', nome: 'Esteri', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'ambiente', nome: 'Ambiente', colore: '#166534', bg: '#F0FDF4' },
  { id: 'startup', nome: 'Startup', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'energia', nome: 'Energia', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'cinema', nome: 'Cinema & TV', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'musica', nome: 'Musica', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'libri', nome: 'Libri', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'fumetti', nome: 'Fumetti', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'calcio-mercato', nome: 'Calciomercato', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'psicologia', nome: 'Psicologia', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'università', nome: 'Università', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'bricolage', nome: 'Bricolage', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'giardinaggio', nome: 'Giardinaggio', colore: '#166534', bg: '#F0FDF4' },
  { id: 'medicina', nome: 'Medicina', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'smartphone', nome: 'Smartphone', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'turismo-food', nome: 'Turismo Food', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'meteo', nome: 'Meteo', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'cronaca', nome: 'Cronaca', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'scienza', nome: 'Scienza', colore: '#0f766e', bg: '#F0FDFA' },
];

function getNicchia(id) {
  return NICCHIE.find(n => n.id === id) || NICCHIE[0];
}

export async function getStaticProps() {
  const outputDir = path.join(process.cwd(), '..', 'output');
  const tutti = [];

  for (const nicchia of NICCHIE) {
    const dir = path.join(outputDir, nicchia.id);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const { data } = matter(raw);
        tutti.push({
          titolo: data.title || '',
          slug: data.slug || '',
          nicchia: nicchia.id,
          nicchia_nome: nicchia.nome,
          data: data.date || '',
          meta: data.meta_description || '',
          image_url: data.image_url || '',
        });
      } catch (e) {
        console.warn(`[index] YAML error in ${nicchia.id}/${file}: ${e.message}`);
      }
    }
  }

  tutti.sort((a, b) => new Date(b.data) - new Date(a.data));

  // articoli per la homepage (ultimi 30)
  const articoli = tutti.slice(0, 30);

  // lista leggera per la ricerca (solo i campi necessari, tutti gli articoli)
  const articoliSearch = tutti.map(a => ({
    titolo: a.titolo,
    slug: a.slug,
    nicchia: a.nicchia,
    nicchia_nome: a.nicchia_nome,
    meta: a.meta,
  }));

  return { props: { articoli, articoliSearch }, revalidate: 3600 };
}

export default function Home({ articoli, articoliSearch }) {
  const [menuAperto, setMenuAperto] = useState(false);
  const [cercaAperto, setCercaAperto] = useState(false);
  const [query, setQuery] = useState('');

  const principale = articoli[0];
  const secondari = articoli.slice(1, 4);
  const resto = articoli.slice(4);

  const risultatiCerca = query.length >= 2
    ? articoliSearch.filter(a => {
        const q = query.toLowerCase();
        return (
          a.titolo.toLowerCase().includes(q) ||
          a.nicchia_nome.toLowerCase().includes(q) ||
          (a.meta && a.meta.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <>
      <Head>
        <title>NotiziHub — Notizie italiane aggiornate ogni giorno</title>
        <meta name="description" content="Finanza, crypto, tech, salute, viaggi e molto altro. Aggiornato ogni giorno." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="alternate" hrefLang="it" href="https://www.notizihub.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.notizihub.com/en" />
        <link rel="alternate" hrefLang="es" href="https://www.notizihub.com/es" />
        <link rel="alternate" hrefLang="de" href="https://www.notizihub.com/de" />
        <link rel="alternate" hrefLang="fr" href="https://www.notizihub.com/fr" />
        <link rel="alternate" hrefLang="pt" href="https://www.notizihub.com/pt" />
        <link rel="alternate" hrefLang="x-default" href="https://www.notizihub.com/" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-family: system-ui; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
          .art-title:hover { color: #e63946 !important; }
          .card-img { width: 100%; height: 180px; object-fit: cover; display: block; }
          .secondary-img { width: 90px; height: 70px; object-fit: cover; flex-shrink: 0; border-radius: 4px; }
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .hero-grid { grid-template-columns: 1fr !important; }
            .articles-grid { grid-template-columns: 1fr !important; }
            .card-img { height: 200px; }
            .secondary-img { width: 80px; height: 60px; }
          }
          @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-menu { display: none !important; }
            .card-img { height: 160px; }
          }
        `}</style>
      </Head>

      <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

          {/* Top bar */}
          <div style={{ padding: '10px 0 8px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
              {new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {[{id:'en',flag:'🇺🇸'},{id:'es',flag:'🇪🇸'},{id:'de',flag:'🇩🇪'},{id:'fr',flag:'🇫🇷'},{id:'pt',flag:'🇧🇷'}].map(l => (
                <Link key={l.id} href={`/${l.id}`} style={{ padding: '3px 7px', background: '#222', borderRadius: 4, fontSize: 11, color: '#ccc', fontFamily: 'system-ui' }}>{l.flag} {l.id.toUpperCase()}</Link>
              ))}
              <button onClick={() => { setCercaAperto(!cercaAperto); setMenuAperto(false); }} style={{ background: '#222', border: '1px solid #444', borderRadius: 99, padding: '5px 12px', color: '#ccc', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 4 }}>
                🔍 <span>Cerca</span>
              </button>
            </div>
          </div>

          {/* Barra ricerca */}
          {cercaAperto && (
            <div style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
              <input
                type="text" autoFocus
                placeholder="Cerca articoli..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 16, fontFamily: 'system-ui', outline: 'none', background: '#222', color: '#fff' }}
              />
              {query.length >= 2 && (
                <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {risultatiCerca.length === 0 && (
                    <div style={{ padding: '12px', color: '#888', fontFamily: 'system-ui', fontSize: 14 }}>Nessun risultato</div>
                  )}
                  {risultatiCerca.slice(0, 8).map((art, i) => {
                    const ni = getNicchia(art.nicchia);
                    return (
                      <Link key={i} href={`/${art.nicchia}/${art.slug}`} onClick={() => { setCercaAperto(false); setQuery(''); }} style={{ display: 'block', padding: '10px 12px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#888', fontFamily: 'system-ui' }}>{art.nicchia_nome}</span>
                        <div style={{ fontSize: 14, color: '#fff', fontFamily: 'system-ui', marginTop: 2 }}>{art.titolo}</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Logo */}
          <div style={{ padding: '12px 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: '#fff' }}>NotiziHub</Link>
            <button className="mobile-menu-btn" onClick={() => setMenuAperto(!menuAperto)} style={{ background: 'none', border: '1px solid #444', borderRadius: 6, padding: '6px 12px', color: '#ccc', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui' }}>
              {menuAperto ? '✕ Chiudi' : '☰ Categorie'}
            </button>
          </div>

          {/* Nav desktop — flex wrap per mostrare tutte le nicchie */}
          <nav className="desktop-nav" style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #333' }}>
            {NICCHIE.map(n => (
              <Link key={n.id} href={`/nicchia/${n.id}`} style={{ padding: '8px 12px', fontFamily: 'system-ui', fontSize: 12, fontWeight: 500, color: '#aaa', whiteSpace: 'nowrap', borderBottom: '2px solid transparent' }}>{n.nome}</Link>
            ))}
          </nav>

          {/* Menu mobile a tendina */}
          {menuAperto && (
            <div className="mobile-menu" style={{ padding: '12px 0', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {NICCHIE.map(n => (
                  <Link key={n.id} href={`/nicchia/${n.id}`} onClick={() => setMenuAperto(false)} style={{ padding: '6px 12px', background: '#222', borderRadius: 99, fontFamily: 'system-ui', fontSize: 13, color: '#ccc' }}>{n.nome}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {/* Hero */}
        {principale && (
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28, paddingBottom: 28, borderBottom: '2px solid #111' }}>
            <div>
              <div style={{ width: '100%', overflow: 'hidden', borderRadius: 6, marginBottom: 14 }}>
                <img
                  src={principale.image_url || `/nicchie/${principale.nicchia}.png`}
                  alt={principale.nicchia_nome}
                  style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                />
              </div>
              <span className="badge" style={{ background: getNicchia(principale.nicchia).bg, color: getNicchia(principale.nicchia).colore, marginBottom: 12, display: 'inline-block' }}>{principale.nicchia_nome}</span>
              <Link href={`/${principale.nicchia}/${principale.slug}`}>
                <h1 className="art-title" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12, color: '#111', transition: 'color 0.15s' }}>{principale.titolo}</h1>
              </Link>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, marginBottom: 10, fontFamily: 'system-ui' }}>{principale.meta}</p>
              <div style={{ fontFamily: 'system-ui', fontSize: 12, color: '#999' }}>{principale.data}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {secondari.map((art, i) => {
                const ni = getNicchia(art.nicchia);
                return (
                  <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < secondari.length - 1 ? '1px solid #e5e5e5' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <img
                      src={art.image_url || `/nicchie/${art.nicchia}.png`}
                      alt={art.nicchia_nome}
                      className="secondary-img"
                    />
                    <div style={{ flex: 1 }}>
                      <span className="badge" style={{ background: ni.bg, color: ni.colore, marginBottom: 6, display: 'inline-block' }}>{art.nicchia_nome}</span>
                      <Link href={`/${art.nicchia}/${art.slug}`}>
                        <h3 className="art-title" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#111', transition: 'color 0.15s' }}>{art.titolo}</h3>
                      </Link>
                      <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#999', marginTop: 4 }}>{art.data}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Griglia */}
        <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {resto.map((art, i) => {
            const ni = getNicchia(art.nicchia);
            return (
              <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e5e5', background: '#fff' }}>
                <div style={{ overflow: 'hidden' }}>
                  <img
                    src={art.image_url || `/nicchie/${art.nicchia}.png`}
                    alt={art.nicchia_nome}
                    className="card-img"
                  />
                </div>
                <div style={{ borderTop: `3px solid ${ni.colore}`, padding: '12px 14px 14px' }}>
                  <span className="badge" style={{ background: ni.bg, color: ni.colore, marginBottom: 8, display: 'inline-block' }}>{art.nicchia_nome}</span>
                  <Link href={`/${art.nicchia}/${art.slug}`}>
                    <h2 className="art-title" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8, color: '#111', transition: 'color 0.15s' }}>{art.titolo}</h2>
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
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {NICCHIE.slice(0, 10).map(n => <Link key={n.id} href={`/nicchia/${n.id}`} style={{ color: '#666' }}>{n.nome}</Link>)}
          </div>
          <div>© {new Date().getFullYear()} NotiziHub · <Link href="/chi-siamo" style={{ color: '#666' }}>Chi siamo</Link> · <Link href="/contattaci" style={{ color: '#666' }}>Contattaci</Link> · <Link href="/privacy" style={{ color: '#666' }}>Privacy</Link></div>
        </div>
      </footer>
    </>
  );
}
