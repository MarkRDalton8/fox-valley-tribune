import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { COLORS } from '../data';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/news', label: 'News' },
  { to: '/sports', label: 'Sports' },
  { to: '/opinion', label: 'Opinion' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  useEffect(() => {
    const tp = window.tp || [];

    tp.push(['init', function () {
      window.tp.experience.execute();

      const user = window.tp.pianoId.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.given_name || user.email || 'Subscriber');
      }
    }]);

    tp.push(['addHandler', 'loginSuccess', function (data) {
      window.tp.pianoId.hide();
      setIsLoggedIn(true);
      setUserName(data.user.given_name || data.user.email || 'Subscriber');
    }]);

    tp.push(['addHandler', 'checkoutComplete', function () {
      navigate('/account');
    }]);
  }, [location.pathname]);

  const handleLogin = () => {
    window.tp = window.tp || [];
    window.tp.push(['init', function () {
      window.tp.pianoId.show({
        screen: 'login',
        displayMode: 'modal',
        loggedIn: function (data) {
          window.tp.pianoId.hide();
          setIsLoggedIn(true);
          setUserName(data.user.given_name || data.user.email || 'Subscriber');
        },
      });
    }]);
  };

  const handleLogout = () => {
    if (window.tp?.pianoId) {
      window.tp.pianoId.logout();
    }
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: '100vh', background: '#fff' }}>

      {/* Utility bar */}
      <div style={{ background: COLORS.dark, color: '#aaa', fontSize: 12, padding: '6px 0', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <span style={{ color: '#ccc' }}>Welcome, {userName}</span>
                <Link to="/account" style={{ color: '#aaa', textDecoration: 'none' }}>My Account</Link>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12, padding: 0 }}>Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12, padding: 0 }}>Sign In</button>
                <Link to="/subscribe" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 700 }}>Subscribe</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div style={{ padding: '24px 0 16px', borderBottom: `4px solid ${COLORS.dark}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 60, fontWeight: 900, color: COLORS.dark,
              margin: 0, letterSpacing: '-1px', lineHeight: 1,
            }}>
              Fox Valley Tribune
            </h1>
          </Link>
          <p style={{ fontSize: 11, color: '#999', margin: '8px 0 0', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Serving the Fox Valley Since 1989
          </p>
        </div>
      </div>

      {/* Section nav */}
      <nav style={{ background: COLORS.dark, borderBottom: `3px solid ${COLORS.primary}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                color: isActive(to) ? 'white' : '#bbb',
                textDecoration: 'none',
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderBottom: isActive(to) ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                marginBottom: -3,
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/subscribe"
            style={{
              marginLeft: 'auto',
              background: COLORS.primary,
              color: 'white',
              textDecoration: 'none',
              padding: '9px 22px',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderRadius: 1,
            }}
          >
            Subscribe
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: COLORS.dark, color: '#888', padding: '48px 20px 24px', marginTop: 64 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
            <div style={{ maxWidth: 300 }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'white', fontSize: 28, margin: '0 0 10px' }}>
                Fox Valley Tribune
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Your trusted source for news, sports, and opinion from the Fox Valley region of northeastern Illinois.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#ccc', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 14px' }}>Sections</h4>
              {['News', 'Sports', 'Opinion'].map(s => (
                <div key={s} style={{ marginBottom: 8 }}>
                  <Link to={`/${s.toLowerCase()}`} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{s}</Link>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#ccc', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 14px' }}>Account</h4>
              {[{ to: '/subscribe', label: 'Subscribe' }, { to: '/account', label: 'My Account' }].map(({ to, label }) => (
                <div key={to} style={{ marginBottom: 8 }}>
                  <Link to={to} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{label}</Link>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 20, fontSize: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>© 2026 Fox Valley Tribune. All rights reserved.</span>
            <span>Piano Demo Site</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
