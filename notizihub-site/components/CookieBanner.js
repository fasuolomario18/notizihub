import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#111', color: '#fff', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12, borderTop: '3px solid #e63946',
      fontFamily: 'system-ui, sans-serif', fontSize: 14,
    }}>
      <div style={{ flex: 1, minWidth: 200, lineHeight: 1.5, color: '#ccc' }}>
        🍪 Usiamo cookie tecnici e di terze parti (Google Analytics, AdSense) per migliorare l'esperienza e mostrare annunci pertinenti.{' '}
        <Link href="/privacy" style={{ color: '#93c5fd', textDecoration: 'underline' }}>Leggi la Privacy Policy</Link>
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => setVisible(false)}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #555', borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 13 }}>
          Solo necessari
        </button>
        <button
          onClick={accept}
          style={{ padding: '8px 20px', background: '#e63946', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Accetta tutti
        </button>
      </div>
    </div>
  );
}
