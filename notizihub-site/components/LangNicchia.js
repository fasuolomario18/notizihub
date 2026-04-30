import Head from 'next/head';
import Link from 'next/link';
import { LINGUE, SITE_URL, getNicchiaMeta } from '../lib/langConfig';

const correlatiLabels = { en: 'All categories', es: 'Todas las categorías', de: 'Alle Kategorien', fr: 'Toutes les catégories', pt: 'Todas as categorias' };

export default function LangNicchia({ articoli, nicchia, nicchiaNome, lang, lingua, desc }) {
  const meta = getNicchiaMeta(nicchia);
  const canonicalUrl = `${SITE_URL}/${lang}/nicchia/${nicchia}`;

  return (
    <>
      <Head>
        <title>{nicchiaNome} — NotiziHub</title>
        <meta name="description" content={desc || `${nicchiaNome} news updated daily. Guides, insights and latest updates.`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .card { transition: transform 0.2s, box-shadow 0.2s; }
          .card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          @media (max-width: 600px) { .cards-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </Head>

      <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ padding: '10px 0 8px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Link href="/" style={{ fontFamily: 'system-ui', fontSize: 11, color: '#888' }}>🇮🇹 IT</Link>
            <div style={{ display: 'flex', gap: 6 }}>
              {LINGUE.filter(l => l.id !== 'it').map(l => (
                <Link key={l.id} href={`/${l.id}`} style={{ padding: '3px 7px', background: lang === l.id ? '#e63946' : '#222', borderRadius: 4, fontSize: 11, color: '#fff', fontFamily: 'system-ui' }}>{l.flag} {l.id.toUpperCase()}</Link>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 0 10px' }}>
            <Link href={`/${lang}`} style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: '#fff' }}>NotiziHub</Link>
          </div>
        </div>
      </header>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <img src={`/nicchie/${nicchia}.png`} alt={nicchiaNome} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '40px 24px 20px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>{nicchiaNome}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{articoli.length} articles</p>
        </div>
      </div>

      {desc && (
        <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 16px', fontSize: 15, lineHeight: 1.7, color: '#555' }}>
            {desc}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Link href={`/${lang}`} style={{ fontSize: 13, color: '#185FA5' }}>← {correlatiLabels[lang] || 'All categories'}</Link>
        </div>

        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
          {articoli.map((art, i) => (
            <div key={i} className="card" style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <img src={`/nicchie/${nicchia}.png`} alt={art.titolo} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '14px 16px 16px', borderTop: `3px solid ${meta.colore}` }}>
                <Link href={`/${lang}/${nicchia}/${art.slug}`}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 8, color: '#111' }}>{art.titolo}</h2>
                </Link>
                {art.meta && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>{art.meta.substring(0, 100)}...</p>}
                <div style={{ fontSize: 11, color: '#aaa' }}>{art.data}</div>
              </div>
            </div>
          ))}
        </div>

        {articoli.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No articles yet — check back after the next run.</div>
        )}

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/privacy" style={{ color: '#888', marginRight: 16 }}>Privacy</Link>
            <Link href="/chi-siamo" style={{ color: '#888' }}>About</Link>
          </div>
          © {new Date().getFullYear()} NotiziHub
        </footer>
      </div>
    </>
  );
}
