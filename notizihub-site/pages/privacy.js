import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  const aggiornamento = '21 aprile 2026';
  return (
    <>
      <Head>
        <title>Privacy Policy — NotiziHub</title>
        <meta name="description" content="Informativa sulla privacy e sul trattamento dei dati personali di NotiziHub." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; background: #f9f9f7; color: #111; } a { text-decoration: none; color: inherit; } h2 { font-size: 20px; font-weight: 700; margin: 28px 0 10px; } p { font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 12px; } ul { margin: 8px 0 12px 24px; } li { font-size: 16px; line-height: 1.7; color: #333; margin-bottom: 4px; }`}</style>
      </Head>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>
        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
        </header>

        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#999', fontSize: 14, marginBottom: 32 }}>Ultimo aggiornamento: {aggiornamento}</p>

        <h2>1. Titolare del trattamento</h2>
        <p>Il titolare del trattamento dei dati è NotiziHub, contattabile all'indirizzo <a href="mailto:redazione@notizihub.it" style={{ color: '#185FA5' }}>redazione@notizihub.it</a>.</p>

        <h2>2. Dati raccolti</h2>
        <p>NotiziHub non raccoglie dati personali in modo diretto. Tuttavia, i servizi di terze parti integrati nel sito possono raccogliere dati tecnici come:</p>
        <ul>
          <li>Indirizzo IP</li>
          <li>Tipo di browser e dispositivo</li>
          <li>Pagine visitate e tempo di permanenza</li>
          <li>Cookie di navigazione</li>
        </ul>

        <h2>3. Cookie</h2>
        <p>Questo sito utilizza cookie tecnici necessari al funzionamento e cookie di terze parti per:</p>
        <ul>
          <li><strong>Google Analytics</strong> — analisi del traffico in forma anonima</li>
          <li><strong>Google AdSense</strong> — pubblicità personalizzata basata sugli interessi</li>
        </ul>
        <p>Puoi disabilitare i cookie nelle impostazioni del tuo browser o tramite i tool di opt-out di Google.</p>

        <h2>4. Google AdSense e pubblicità</h2>
        <p>Questo sito utilizza Google AdSense per mostrare annunci pubblicitari. Google, come fornitore di terze parti, utilizza cookie per mostrare annunci basati sulle visite precedenti degli utenti. Per maggiori informazioni o per disattivare la pubblicità personalizzata, visita <a href="https://www.google.com/settings/ads" style={{ color: '#185FA5' }} target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>

        <h2>5. Diritti dell'utente</h2>
        <p>Ai sensi del GDPR (Regolamento UE 2016/679), hai il diritto di accedere, rettificare, cancellare o limitare il trattamento dei tuoi dati personali. Per esercitare questi diritti, contattaci a <a href="mailto:redazione@notizihub.it" style={{ color: '#185FA5' }}>redazione@notizihub.it</a>.</p>

        <h2>6. Modifiche alla privacy policy</h2>
        <p>Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento.</p>

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 48 }}>
          © {new Date().getFullYear()} NotiziHub ·{' '}
          <Link href="/chi-siamo" style={{ color: '#888' }}>Chi siamo</Link> ·{' '}
          <Link href="/contattaci" style={{ color: '#888' }}>Contattaci</Link>
        </footer>
      </div>
    </>
  );
}
