import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import { LINGUE, SITE_URL, getNicchiaMeta, NICCHIE_META } from '../lib/langConfig';

const titles = { en: 'NotiziHub — Daily News', es: 'NotiziHub — Noticias del Día', de: 'NotiziHub — Aktuelle Nachrichten', fr: 'NotiziHub — Actualités', pt: 'NotiziHub — Notícias do Dia' };
const descriptions = { en: 'Daily news updated every day.', es: 'Noticias actualizadas cada día.', de: 'Täglich aktualisierte Nachrichten.', fr: 'Actualités mises à jour chaque jour.', pt: 'Notícias atualizadas todos os dias.' };
const searchPlaceholder = { en: 'Search articles...', es: 'Buscar artículos...', de: 'Artikel suchen...', fr: 'Rechercher des articles...', pt: 'Pesquisar artigos...' };
const searchLabel = { en: 'Search', es: 'Buscar', de: 'Suchen', fr: 'Rechercher', pt: 'Pesquisar' };
const noResults = { en: 'No results', es: 'Sin resultados', de: 'Keine Ergebnisse', fr: 'Aucun résultat', pt: 'Sem resultados' };

export default function LangHome({ articoli, articoliSearch = [], lang, lingua }) {
  const [menuAperto, setMenuAperto] = useState(false);
  const [cercaAperto, setCercaAperto] = useState(false);
  const [query, setQuery] = useState('');

  const principale = articoli[0];
  const secondari = articoli.slice(1, 4);
  const resto = articoli.slice(4);

  const risultatiCerca = query.length >= 2
    ? articoliSearch.filter(a => {
        const q = query.toLowerCase();
        return a.titolo.toLowerCase().includes(q) || a.nicchia_nome?.toLowerCase().includes(q) || (a.meta && a.meta.toLowerCase().includes(q));
      })
    : [];

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
          @media (max-width: 768px) { .desktop-nav { display: none !important; } .hero-grid { grid-template-columns: 1fr !important; } .articles-grid { grid-template-columns: 1fr !important; } }
          @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } .mobile-menu { display: none !important; } }
        `}</style>
      </Head>

      <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

          {/* Top bar */}
          <div style={{ padding: '10px 0 8px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
              {new Date().toLocaleDateString(lingua?.locale || 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '3px 7px', background: '#222', borderRadius: 4, fontSize: 11, color: '#ccc', fontFamily: 'system-ui' }}>🇮🇹 IT</Link>
              {LINGUE.filter(l => l.id !== 'it').map(l => (
                <Link key={l.id} href={`/${l.id}`} style={{ padding: '3px 7px', background: lang === l.id ? '#e63946' : '#222', borderRadius: 4, fontSize: 11, color: '#fff', fontFamily: 'system-ui' }}>{l.flag} {l.id.toUpperCase()}</Link>
              ))}
              <button onClick={() => { setCercaAperto(!cercaAperto); setMenuAperto(false); }} style={{ background: '#222', border: '1px solid #444', borderRadius: 99, padding: '5px 12px', color: '#ccc', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 4 }}>
                🔍 <span>{searchLabel[lang] || 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Barra ricerca */}
          {cercaAperto && (
            <div style={{ padding: '12px 0', borderBottom: '1px solid #333' }}>
              <input
                type="text" autoFocus
                placeholder={searchPlaceholder[lang] || 'Search...'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 16, fontFamily: 'system-ui', outline: 'none', background: '#222', color: '#fff' }}
              />
              {query.length >= 2 && (
                <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {risultatiCerca.length === 0 && (
                    <div style={{ padding: '12px', color: '#888', fontFamily: 'system-ui', fontSize: 14 }}>{noResults[lang] || 'No results'}</div>
                  )}
                  {risultatiCerca.slice(0, 8).map((art, i) => (
                    <Link key={i} href={`/${lang}/${art.nicchia}/${art.slug}`} onClick={() => { setCercaAperto(false); setQuery(''); }} style={{ display: 'block', padding: '10px 12px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#888', fontFamily: 'system-ui' }}>{art.nicchia_nome}</span>
                      <div style={{ fontSize: 14, color: '#fff', fontFamily: 'system-ui', marginTop: 2 }}>{art.titolo}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Logo */}
          <div style={{ padding: '12px 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href={`/${lang}`} style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: '#fff' }}>NotiziHub</Link>
            <button className="mobile-menu-btn" onClick={() => setMenuAperto(!menuAperto)} style={{ background: 'none', border: '1px solid #444', borderRadius: 6, padding: '6px 12px', color: '#ccc', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui' }}>
              {menuAperto ? '✕' : '☰ Categories'}
            </button>
          </div>

          {/* Nav desktop */}
          <nav className="desktop-nav" style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #333' }}>
            {NICCHIE_META.map(n => (
              <Link key={n.id} href={`/${lang}/nicchia/${n.id}`} style={{ padding: '8px 12px', fontFamily: 'system-ui', fontSize: 12, fontWeight: 500, color: '#aaa', whiteSpace: 'nowrap' }}>{n.id.charAt(0).toUpperCase() + n.id.slice(1)}</Link>
            ))}
          </nav>

          {/* Menu mobile */}
          {menuAperto && (
            <div className="mobile-menu" style={{ padding: '12px 0', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {NICCHIE_META.map(n => (
                  <Link key={n.id} href={`/${lang}/nicchia/${n.id}`} onClick={() => setMenuAperto(false)} style={{ padding: '6px 12px', background: '#222', borderRadius: 99, fontFamily: 'system-ui', fontSize: 13, color: '#ccc' }}>{n.id.charAt(0).toUpperCase() + n.id.slice(1)}</Link>
                ))}
              </div>
            </div>
          )}
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
