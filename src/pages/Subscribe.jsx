import Layout from '../components/Layout';
import { COLORS, PIANO_CONFIG } from '../data';

const BENEFITS = [
  'Unlimited access to all subscriber-only articles',
  'Full in-depth sports coverage and stats',
  'Opinion, editorials, and commentary',
  'Breaking news alerts',
  'Digital e-edition of the print paper',
  'Cancel anytime — no commitment required',
];

export default function Subscribe() {
  const handleSubscribe = () => {
    window.tp = window.tp || [];
    window.tp.push(['init', function () {
      if (PIANO_CONFIG.OFFER_ID) {
        window.tp.offer.show({ offerId: PIANO_CONFIG.OFFER_ID, displayMode: 'modal' });
      } else {
        window.tp.experience.execute();
      }
    }]);
  };

  const handleSignIn = () => {
    window.tp = window.tp || [];
    window.tp.push(['init', function () {
      window.tp.pianoId.show({ screen: 'register', displayMode: 'modal' });
    }]);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', color: COLORS.primary, marginBottom: 16 }}>
            Support Local Journalism
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 44, fontWeight: 700, color: COLORS.dark, margin: '0 0 16px', lineHeight: 1.2,
          }}>
            Stay Informed.<br />Stay Connected.
          </h1>
          <p style={{ fontSize: 16, color: '#555', lineHeight: 1.75, margin: 0 }}>
            The Fox Valley Tribune has covered this community since 1989. Your subscription
            keeps local reporters in the field and our neighbors informed.
          </p>
        </div>

        {/* Offer card */}
        <div style={{
          border: `2px solid ${COLORS.primary}`,
          borderRadius: 2, padding: '40px 48px', marginBottom: 24,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: COLORS.primary, marginBottom: 12 }}>
              Digital Access
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 52, fontWeight: 700, color: COLORS.dark, lineHeight: 1,
            }}>
              $9<span style={{ fontSize: 28, fontWeight: 400 }}>.99</span>
              <span style={{ fontSize: 18, fontWeight: 400, color: '#888' }}>/mo</span>
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>Cancel anytime</div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
            {BENEFITS.map(b => (
              <li key={b} style={{
                padding: '10px 0', borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 15, color: '#333', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: '#1b5e20', fontWeight: 700 }}>✓</span>
                {b}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            style={{
              width: '100%', background: COLORS.primary, color: 'white',
              border: 'none', padding: '16px', fontSize: 15,
              fontWeight: 800, cursor: 'pointer', letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Subscribe Now
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#999' }}>
          Already a subscriber?{' '}
          <button
            onClick={handleSignIn}
            style={{ background: 'none', border: 'none', color: COLORS.primary, cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}
          >
            Sign in here
          </button>
        </p>
      </div>
    </Layout>
  );
}
