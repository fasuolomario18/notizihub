import Head from 'next/head';
import Link from 'next/link';

export default function ChiSiamo() {
  return (
    <>
      <Head>
        <title>Chi siamo — NotiziHub</title>
        <meta name="description" content="NotiziHub è il portale italiano di notizie aggiornate ogni giorno su finanza, tech, salute, sport e molto altro." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; } a { text-decoration: none; color: inherit; }`}</style>
      </Head>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>
        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
        </header>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Chi siamo</h1>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 16 }}>
          <strong>NotiziHub</strong> è un portale di informazione italiano che pubblica articoli aggiornati ogni giorno su oltre 40 categorie: finanza personale, crypto, tecnologia, salute, viaggi, sport e molto altro.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 16 }}>
          Il nostro obiettivo è fornire contenuti chiari, aggiornati e utili per il lettore italiano, senza perdere tempo in notizie irrilevanti. Ogni articolo è costruito per rispondere alle domande più cercate e offrire informazioni pratiche.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 32 }}>
          NotiziHub viene aggiornato quotidianamente attraverso un sistema automatico che seleziona le notizie più rilevanti dai principali feed RSS italiani e internazionali.
        </p>
        <div style={{ borderTop: '1px solid #eee', paddingTop: 24 }}>
          <Link href="/contattaci" style={{ color: '#185FA5', fontWeight: 600 }}>Contattaci →</Link>
        </div>
        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 48 }}>
          © {new Date().getFullYear()} NotiziHub ·{' '}
          <Link href="/privacy" style={{ color: '#888' }}>Privacy Policy</Link>
        </footer>
      </div>
    </>
  );
}
