import Layout from '../components/Layout';
import { ArticleCard } from '../components/SharedComponents';
import { COLORS, ARTICLES } from '../data';

export default function Home() {
  const featuredNews = ARTICLES.find(a => a.section === 'news' && a.featured);
  const featuredSports = ARTICLES.find(a => a.section === 'sports' && a.featured);
  const latestNews = ARTICLES.filter(a => a.section === 'news' && !a.featured).slice(0, 2);
  const latestSports = ARTICLES.filter(a => a.section === 'sports' && !a.featured).slice(0, 2);
  const opinion = ARTICLES.filter(a => a.section === 'opinion').slice(0, 2);

  const SectionHeader = ({ label, color }) => (
    <div style={{
      fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '2px', color: '#888',
      borderBottom: `3px solid ${color}`, paddingBottom: 8, marginBottom: 16,
    }}>
      {label}
    </div>
  );

  return (
    <Layout>
      {/* Breaking news bar */}
      <div style={{
        background: COLORS.primary, color: 'white',
        padding: '9px 16px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '2px', background: COLORS.dark,
          padding: '4px 10px', whiteSpace: 'nowrap',
        }}>
          Breaking
        </span>
        <span style={{ fontSize: 14 }}>
          County Board Approves $2.3M Road Repair Budget — Vote was 18-3 Tuesday
        </span>
      </div>

      {/* Top row: featured news + sidebar news */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
        {featuredNews && <ArticleCard article={featuredNews} featured />}
        <div>
          <SectionHeader label="Latest News" color={COLORS.sectionNews} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {latestNews.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${COLORS.border}`, marginBottom: 32 }} />

      {/* Bottom row: Sports + Opinion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <SectionHeader label="Sports" color={COLORS.sectionSports} />
          {featuredSports && (
            <div style={{ marginBottom: 14 }}>
              <ArticleCard article={featuredSports} featured />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {latestSports.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>
        <div>
          <SectionHeader label="Opinion" color={COLORS.sectionOpinion} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {opinion.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
}
