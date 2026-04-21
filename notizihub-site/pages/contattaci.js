import Head from 'next/head';
import Link from 'next/link';

export default function Contattaci() {
  return (
    <>
      <Head>
        <title>Contattaci — NotiziHub</title>
        <meta name="description" content="Hai domande o segnalazioni? Contatta la redazione di NotiziHub." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; } a { text-decoration: none; color: inherit; }`}</style>
      </Head>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>
        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
        </header>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Contattaci</h1>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 24 }}>
          Per segnalazioni, collaborazioni o richieste di rimozione contenuti puoi scriverci all'indirizzo email:
        </p>
        <div style={{ background: '#EBF5FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '16px 20px', marginBottom: 32, fontSize: 17 }}>
          <strong>Email:</strong>{' '}
          <a href="mailto:redazione@notizihub.it" style={{ color: '#185FA5' }}>redazione@notizihub.it</a>
        </div>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>
          Rispondiamo entro 2-3 giorni lavorativi. Per richieste urgenti di rimozione contenuti ai sensi del GDPR, indica chiaramente l'oggetto della richiesta.
        </p>
        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 48 }}>
          © {new Date().getFullYear()} NotiziHub ·{' '}
          <Link href="/privacy" style={{ color: '#888' }}>Privacy Policy</Link>
        </footer>
      </div>
    </>
  );
}
