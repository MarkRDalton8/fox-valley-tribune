import { useEffect } from 'react';
import Layout from '../components/Layout';
import { COLORS } from '../data';

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
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 38, fontWeight: 700, color: COLORS.dark,
          borderBottom: `3px solid ${COLORS.dark}`, paddingBottom: 14, marginBottom: 32,
        }}>
          My Account
        </h2>
        <div id="piano-account-container" style={{ minHeight: 400 }} />
      </div>
    </Layout>
  );
}
