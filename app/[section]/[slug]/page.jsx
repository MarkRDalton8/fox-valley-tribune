'use client';

import { useState, useEffect } from 'react';
import { COLORS, ARTICLES, SECTION_COLORS, PIANO_CONFIG } from '../../../lib/data';
import PianoInit from '../../../components/PianoInit';

const PARA_STYLE = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 18, lineHeight: 1.85, color: '#222', marginBottom: 26,
};

export default function ArticleDetail({ params }) {
  const { section, slug } = params;
  const article = ARTICLES.find(a => a.slug === slug && a.section === section);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!article?.locked || !PIANO_CONFIG.SUBSCRIBER_RESOURCE_ID) return;
    const tp = window.tp || [];
    tp.push(['init', function () {
      window.tp.api.callApi('/access/check', { rid: PIANO_CONFIG.SUBSCRIBER_RESOURCE_ID }, function (response) {
        if (response?.access?.granted || response?.data?.access?.granted) setHasAccess(true);
      });
    }]);
  }, [article?.slug]);

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, color: COLORS.dark }}>
          Article Not Found
        </h1>
        <a href="/" style={{ color: COLORS.primary, fontSize: 15 }}>← Return to Home</a>
      </div>
    );
  }

  const sectionLabel = section === 'local-politics' ? 'Local Politics' : section.charAt(0).toUpperCase() + section.slice(1);
  const sectionColor = SECTION_COLORS[section] || COLORS.dark;
  const showFull = !article.locked || hasAccess;
  const visibleBody = showFull ? article.body : article.body.slice(0, 2);

  return (
    <>
      <PianoInit
        section={section}
        tags={article.tags || [section, article.category?.toLowerCase()].filter(Boolean)}
        contentCreator={article.byline}
      />

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#999', marginBottom: 22 }}>
          <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
          {' · '}
          <a href={`/${section}`} style={{ color: sectionColor, textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {sectionLabel}
          </a>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: sectionColor }}>
              {article.category}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, fontWeight: 700, color: COLORS.dark, lineHeight: 1.2, margin: '0 0 22px' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#888', borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 0' }}>
            <span>{article.byline}</span>
            <span>{article.date}</span>
          </div>
        </div>

        {/* Body */}
        <div>
          {visibleBody.map((para, i) => (
            <p key={i} style={PARA_STYLE}>{para}</p>
          ))}

          {/* Piano paywall gate — Composer renders its experience here */}
          {article.locked && !hasAccess && (
            <div className="piano-container" />
          )}
        </div>

        {/* Sports newsletter Piano template container */}
        {section === 'sports' && (
          <div className="piano-sports-newsletter" style={{ background: COLORS.primary, marginTop: 56 }} />
        )}

        {/* Local politics email signup Piano template container */}
        {section === 'local-politics' && (
          <div className="piano-politics-signup" style={{ marginTop: 56 }} />
        )}

        {showFull && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 48, paddingTop: 24 }}>
            <a href={`/${section}`} style={{ color: sectionColor, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              ← More {sectionLabel}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
