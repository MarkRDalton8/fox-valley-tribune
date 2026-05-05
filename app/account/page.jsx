'use client';

import { useEffect } from 'react';
import { COLORS } from '../../lib/data';
import PianoInit from '../../components/PianoInit';

export default function AccountPage() {
  useEffect(() => {
    const tp = window.tp || [];
    tp.push(['init', function () {
      if (window.tp.pianoId.getUser()) {
        window.tp.myaccount.show({
          displayMode: 'inline',
          containerSelector: '#piano-account-container',
        });
      }
    }]);
  }, []);

  return (
    <>
      <PianoInit section="account" />
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 700, color: COLORS.dark, borderBottom: `3px solid ${COLORS.dark}`, paddingBottom: 14, marginBottom: 32 }}>
          My Account
        </h2>
        <div id="piano-account-container" style={{ minHeight: 400 }} />
      </div>
    </>
  );
}
