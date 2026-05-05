'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/data';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/sports', label: 'Sports' },
  { href: '/opinion', label: 'Opinion' },
  { href: '/local-politics', label: 'Local Politics' },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const tp = window.tp || [];

    tp.push(['addHandler', 'loginSuccess', function (data) {
      window.tp.pianoId.hide();
      setIsLoggedIn(true);
      setUserName(data.user.given_name || data.user.email || 'Subscriber');
      window.location.href = '/account';
    }]);

    tp.push(['addHandler', 'checkoutComplete', function () {
      window.location.href = '/account';
    }]);

    tp.push(['init', function () {
      const user = window.tp.pianoId.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.given_name || user.email || 'Subscriber');
      }
    }]);
  }, []);

  const handleLogin = () => {
    const tp = window.tp || [];
    tp.push(['init', function () {
      window.tp.pianoId.show({ screen: 'register', displayMode: 'modal' });
    }]);
  };

  const handleLogout = () => {
    if (window.tp?.pianoId) window.tp.pianoId.logout();
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  const isActive = (href) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href);

  return (
    <>
      {/* Utility bar */}
      <div style={{ background: COLORS.dark, color: '#aaa', fontSize: 12, padding: '6px 0', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <span style={{ color: '#ccc' }}>Welcome, {userName}</span>
                <a href="/account" style={{ color: '#aaa', textDecoration: 'none' }}>My Account</a>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12, padding: 0 }}>Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12, padding: 0 }}>Sign In</button>
                <a href="/subscribe" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 700 }}>Subscribe</a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div style={{ padding: '24px 0 16px', borderBottom: `4px solid ${COLORS.dark}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 60, fontWeight: 900, color: COLORS.dark, margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>
              Fox Valley Tribune
            </h1>
          </a>
          <p style={{ fontSize: 11, color: '#999', margin: '8px 0 0', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Serving the Fox Valley Since 1989
          </p>
        </div>
      </div>

      {/* Section nav */}
      <nav style={{ background: COLORS.dark, borderBottom: `3px solid ${COLORS.primary}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                color: isActive(href) ? 'white' : '#bbb',
                textDecoration: 'none',
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderBottom: isActive(href) ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                marginBottom: -3,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </a>
          ))}
          <a
            href="/subscribe"
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
              whiteSpace: 'nowrap',
            }}
          >
            Subscribe
          </a>
        </div>
      </nav>
    </>
  );
}
