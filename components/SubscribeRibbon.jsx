'use client';

import { useState, useEffect } from 'react';
import { COLORS, PIANO_CONFIG } from '../lib/data';

export default function SubscribeRibbon() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('ribbon_dismissed')) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('ribbon_dismissed', '1');
  };

  const handleSubscribe = () => {
    const tp = window.tp || [];
    tp.push(['init', function () {
      if (PIANO_CONFIG.OFFER_ID) {
        window.tp.offer.show({ offerId: PIANO_CONFIG.OFFER_ID, displayMode: 'modal' });
      } else {
        window.location.href = '/subscribe';
      }
    }]);
  };

  if (dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s ease',
      background: COLORS.dark, borderTop: `3px solid ${COLORS.primary}`,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
          <div style={{ background: COLORS.primary, color: 'white', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '5px 12px', whiteSpace: 'nowrap' }}>
            Subscribe
          </div>
          <p style={{ color: '#e0e0e0', fontSize: 15, margin: 0, fontFamily: "'Playfair Display', Georgia, serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Support local journalism. Get unlimited access to the Fox Valley Tribune.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={handleSubscribe} style={{ background: COLORS.primary, color: 'white', border: 'none', padding: '10px 28px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Subscribe Now
          </button>
          <button onClick={handleDismiss} aria-label="Dismiss" style={{ background: 'none', border: '1px solid #444', color: '#aaa', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
