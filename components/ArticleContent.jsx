'use client';

import { useState, useEffect } from 'react';
import { COLORS, ARTICLES, SECTION_COLORS, PIANO_CONFIG } from '../lib/data';
import PianoInit from './PianoInit';
import ProgressiveProfileModal from './ProgressiveProfileModal';
import ProgressiveProfileModal2 from './ProgressiveProfileModal2';

const SECTION_KEYWORDS = {
  news: 'city,community',
  sports: 'sports,athletics',
  opinion: 'newspaper,writing',
  'local-politics': 'government,politics',
  lifestyle: 'lifestyle,home',
};

// Priority order: most specific/visual first. First matching tag wins.
const TAG_IMAGE_PRIORITY = [
  'soccer', 'football', 'basketball', 'baseball', 'wrestling', 'swimming',
  'running', 'road-racing', 'recruiting',
  'health', 'education', 'environment', 'elections', 'transportation',
  'business-and-finance', 'infrastructure',
  'food-and-drink', 'cooking', 'gardening', 'home-design', 'interior',
  'wellness', 'fitness', 'outdoors', 'family-and-parenting',
  'personal-development', 'arts-and-entertainment',
  'high-school-sports', 'youth-sports',
];

const TAG_IMAGE_KEYWORDS = {
  soccer: 'soccer',
  football: 'football',
  basketball: 'basketball',
  baseball: 'baseball',
  wrestling: 'wrestling',
  swimming: 'swimming,pool',
  running: 'running',
  'road-racing': 'running,race',
  recruiting: 'stadium,sports',
  'high-school-sports': 'athlete,sports',
  'youth-sports': 'children,sports',
  health: 'hospital,healthcare',
  education: 'school,classroom',
  environment: 'nature,environment',
  elections: 'election,voting',
  transportation: 'transit,transportation',
  'business-and-finance': 'business,office',
  infrastructure: 'construction,bridge',
  'food-and-drink': 'food,restaurant',
  cooking: 'cooking,kitchen',
  gardening: 'garden,plants',
  'home-design': 'interior,design',
  interior: 'interior,home',
  wellness: 'wellness,yoga',
  fitness: 'fitness,exercise',
  outdoors: 'nature,outdoor',
  'family-and-parenting': 'family,children',
  'personal-development': 'inspiration,books',
  'arts-and-entertainment': 'art,performance',
};

function getArticleImageUrl(section, id, width, height, tags = []) {
  const tagSet = new Set(tags || []);
  for (const tag of TAG_IMAGE_PRIORITY) {
    if (tagSet.has(tag)) {
      return `https://loremflickr.com/${width}/${height}/${TAG_IMAGE_KEYWORDS[tag]}?lock=${id}`;
    }
  }
  const kw = SECTION_KEYWORDS[section] || 'news';
  return `https://loremflickr.com/${width}/${height}/${kw}?lock=${id}`;
}

const PARA_STYLE = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 18, lineHeight: 1.85, color: '#222', marginBottom: 26,
};

export default function ArticleContent({ section, slug }) {
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
  const articleImage = getArticleImageUrl(section, article.id, 160, 160, article.tags);

  return (
    <>
      <PianoInit
        section={section}
        tags={[
          ...(article.tags || [section, article.category?.toLowerCase()].filter(Boolean)),
          ...(article.locked ? [section === 'sports' ? 'sports-pass' : 'premium'] : []),
        ]}
        contentCreator={article.byline}
      />

      <div className="article-layout" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '760px 1fr', gap: 40 }}>
        {/* Main article column */}
        <div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: sectionColor }}>
                {article.category}
              </span>
              {article.locked && article.section === 'sports' && (
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: '#1B5E20', color: 'white', padding: '2px 7px', borderRadius: 2 }}>
                  Sports Pass
                </span>
              )}
              {article.locked && article.section !== 'sports' && (
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: '#D97706', color: 'white', padding: '2px 7px', borderRadius: 2 }}>
                  Premium
                </span>
              )}
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
          <div style={{ overflow: 'hidden' }}>
            <img
              src={articleImage}
              alt=""
              style={{ float: 'left', width: 160, height: 160, marginRight: 20, marginBottom: 10, marginTop: 4, borderRadius: 2, display: 'block' }}
            />
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

          {/* Progressive profiling modals — local politics only */}
          {section === 'local-politics' && <ProgressiveProfileModal />}
          {section === 'local-politics' && <ProgressiveProfileModal2 />}

          {/* Lifestyle newsletter Piano template container */}
          {section === 'lifestyle' && (
            <div className="piano-lifestyle-newsletter" style={{ marginTop: 56 }} />
          )}

          {showFull && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 48, paddingTop: 24 }}>
              <a href={`/${section}`} style={{ color: sectionColor, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                ← More {sectionLabel}
              </a>
            </div>
          )}
        </div>

        {/* Right rail — Piano Content recommendations */}
        <aside>
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#888', borderBottom: `3px solid ${COLORS.primary}`, paddingBottom: 8, marginBottom: 16 }}>
              Recommended
            </div>
            <div className="piano-content-recommendations" />
          </div>
        </aside>
      </div>
    </>
  );
}
