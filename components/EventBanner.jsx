'use client';

import { useState, useEffect } from 'react';

const GOLD = '#B45309';

export default function EventBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('event_banner_dismissed')) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('event_banner_dismissed', '1');
  };

  if (dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s ease',
      background: '#1a1a2e', borderTop: `3px solid ${GOLD}`,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
          <div style={{
            background: GOLD, color: 'white', fontSize: 10, fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '5px 12px', whiteSpace: 'nowrap',
          }}>
            Invitation
          </div>
          <p style={{
            color: '#e0e0e0', fontSize: 15, margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Fox Valley Executive Leadership Summit — May 28 · Geneva, IL · Limited seats for senior leaders
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <a
            href="/events/executive-summit-2026"
            style={{
              background: GOLD, color: 'white', border: 'none',
              padding: '10px 28px', fontSize: 13, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '1px',
              cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Learn More
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              background: 'none', border: '1px solid #444', color: '#aaa',
              width: 32, height: 32, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
