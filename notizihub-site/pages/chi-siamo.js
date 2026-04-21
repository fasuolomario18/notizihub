import Head from 'next/head';
import Link from 'next/link';

export default function ChiSiamo() {
  return (
    <>
      <Head>
        <title>Chi siamo — NotiziHub</title>
        <meta name="description" content="NotiziHub è il portale italiano di approfondimento su finanza, tecnologia, salute, viaggi, sport e molto altro. Articoli utili e aggiornati ogni giorno." />
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

        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 20 }}>
          <strong>NotiziHub</strong> è un portale di approfondimento italiano che copre ogni giorno oltre 40 categorie tematiche: finanza personale, crypto e investimenti, tecnologia e intelligenza artificiale, salute e benessere, viaggi, sport, casa, lavoro e molto altro.
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '28px 0 12px' }}>La nostra missione</h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 20 }}>
          Il nostro obiettivo è fornire articoli chiari, pratici e aggiornati che rispondano alle domande reali dei lettori italiani. Non ci limitiamo a riportare notizie: ogni contenuto è strutturato per offrire contesto, approfondimento e informazioni utili alla vita quotidiana.
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '28px 0 12px' }}>Cosa trovi su NotiziHub</h2>
        <ul style={{ fontSize: 16, lineHeight: 1.9, color: '#333', marginBottom: 20, paddingLeft: 24 }}>
          <li><strong>Finanza & Investimenti</strong> — guida a ETF, risparmio, trading e mercati</li>
          <li><strong>Tecnologia & AI</strong> — aggiornamenti su intelligenza artificiale, smartphone e software</li>
          <li><strong>Salute & Benessere</strong> — consigli pratici su alimentazione, medicina e stile di vita</li>
          <li><strong>Viaggi</strong> — destinazioni, voli low cost, consigli per risparmiare</li>
          <li><strong>Sport</strong> — calcio, Formula 1, NBA e molto altro</li>
          <li><strong>Casa & Immobiliare</strong> — mutui, affitti, ristrutturazioni</li>
          <li><strong>Lavoro & Carriera</strong> — smart working, stipendi, curriculum</li>
        </ul>

        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '28px 0 12px' }}>Contattaci</h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#333', marginBottom: 24 }}>
          Per segnalazioni, collaborazioni editoriali o richieste di rettifica puoi scriverci a{' '}
          <a href="mailto:redazione@notizihub.it" style={{ color: '#185FA5' }}>redazione@notizihub.it</a>.
          Rispondiamo entro 2–3 giorni lavorativi.
        </p>

        <div style={{ borderTop: '1px solid #eee', paddingTop: 24, marginBottom: 40 }}>
          <Link href="/contattaci" style={{ color: '#185FA5', fontWeight: 600 }}>Vai alla pagina Contatti →</Link>
        </div>

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          © {new Date().getFullYear()} NotiziHub ·{' '}
          <Link href="/privacy" style={{ color: '#888' }}>Privacy Policy</Link> ·{' '}
          <Link href="/contattaci" style={{ color: '#888' }}>Contattaci</Link>
        </footer>
      </div>
    </>
  );
}
