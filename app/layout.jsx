import Script from 'next/script';
import Header from '../components/Header';
import SubscribeRibbon from '../components/SubscribeRibbon';
import { COLORS } from '../lib/data';
import './globals.css';

export const metadata = {
  title: 'Fox Valley Tribune',
  description: 'Your trusted source for news, sports, opinion, and local politics from the Fox Valley region.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Piano Composer — loads first so tp queue is available before page scripts run */}
        <Script
          id="piano-composer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(src){var a=document.createElement("script");a.type="text/javascript";a.async=true;a.src=src;var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b)})("https://experience.tinypass.com/xbuilder/experience/load?aid=QiNgMM49pu");`,
          }}
        />

        {/* Piano Analytics — instantTracking fires the initial page.display automatically */}
        <Script
          id="piano-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(_config) {
                var script = document.createElement("script");
                script.src = "https://tag.aticdn.net/piano-analytics.js";
                script.async = true;
                script.dataset.config = JSON.stringify(_config);
                document.head.appendChild(script);
              })({
                site: 639124,
                collectDomain: "https://fjqqzhr.pa-cd.com",
                instantTracking: true
              });
            `,
          }}
        />

        {/* Piano ESP */}
        <Script
          id="piano-esp"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(){
                window.PianoESPConfig = { hashId: "E684A334-071D-4AFE-9F03-1C2EC0C7F2EA" };
                var e=document.createElement("script");
                e.setAttribute("id","pnesplucidsdksel");
                e.type="text/javascript";
                e.src="//api-esp.piano.io/public/sdk/vx/sdk.js?i=E684A334-071D-4AFE-9F03-1C2EC0C7F2EA&v="+(localStorage&&localStorage.lucidsdkver||"xxx");
                e.async=true;
                document.getElementsByTagName("script")[0].parentNode.appendChild(e);
              }();
            `,
          }}
        />

        <Header />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px' }}>
          {children}
        </main>

        <footer style={{ background: COLORS.dark, color: '#888', padding: '48px 20px 24px', marginTop: 64 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
              <div style={{ maxWidth: 300 }}>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'white', fontSize: 28, margin: '0 0 10px' }}>
                  Fox Valley Tribune
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Your trusted source for news, sports, opinion, and local politics from the Fox Valley region of northeastern Illinois.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#ccc', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 14px' }}>Sections</h4>
                {[['News', '/news'], ['Sports', '/sports'], ['Opinion', '/opinion'], ['Local Politics', '/local-politics']].map(([label, href]) => (
                  <div key={href} style={{ marginBottom: 8 }}>
                    <a href={href} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{label}</a>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ color: '#ccc', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 14px' }}>Account</h4>
                {[['Subscribe', '/subscribe'], ['My Account', '/account']].map(([label, href]) => (
                  <div key={href} style={{ marginBottom: 8 }}>
                    <a href={href} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{label}</a>
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

        <SubscribeRibbon />
      </body>
    </html>
  );
}
