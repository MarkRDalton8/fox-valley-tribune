#!/usr/bin/env node
// Runs daily to generate one new article via Claude API, rotating through all
// sections. Appends the article to lib/data.js, then commits and pushes so
// Vercel auto-deploys the updated static site.
//
// Usage:  node scripts/publish-daily.js
// Cron:   0 7 * * * cd /path/to/fox-valley-tribune && node scripts/publish-daily.js
// Env:    ANTHROPIC_API_KEY must be set

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_FILE = path.join(__dirname, '../lib/data.js');
const STATE_FILE = path.join(__dirname, '.publish-state.json');

const SECTIONS = ['news', 'sports', 'opinion', 'local-politics', 'lifestyle'];

const SECTION_PROMPTS = {
  news: 'local government, community events, education, business, or public services in the Fox Valley region of northeastern Illinois. Cities include Geneva, Batavia, St. Charles, Aurora, and Elgin in Kane and Kendall counties.',
  sports: 'high school or youth sports in the Fox Valley region. Sports include soccer, wrestling, swimming, baseball, basketball, cross country, volleyball, or local road races and recreational leagues.',
  opinion: 'an editorial, letter to the editor, or commentary about a local issue in the Fox Valley area. Topics might include local government decisions, school funding, development, environment, transportation, or community life.',
  'local-politics': 'elections, city council proceedings, county government, school board decisions, or local political developments in Fox Valley municipalities.',
  lifestyle: 'daily life, home and interior design, personal development, wellness and fitness, food and cooking, gardening, or community interests relevant to Fox Valley suburban families.',
};

function readState() {
  if (!fs.existsSync(STATE_FILE)) return { lastSection: null, lastId: 31 };
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getNextSection(lastSection) {
  const idx = SECTIONS.indexOf(lastSection);
  return SECTIONS[(idx + 1) % SECTIONS.length];
}

function slugExists(slug) {
  return fs.readFileSync(DATA_FILE, 'utf8').includes(`slug: '${slug}'`);
}

function escapeForJs(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

function appendArticle(article, section, id) {
  const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const bodyLines = article.body
    .map(p => `      '${escapeForJs(p)}',`)
    .join('\n');

  const entry = `  {
    id: ${id},
    slug: '${escapeForJs(article.slug)}',
    section: '${section}',
    title: '${escapeForJs(article.title)}',
    byline: '${escapeForJs(article.byline)}',
    date: '${date}',
    category: '${escapeForJs(article.category)}',
    excerpt: '${escapeForJs(article.excerpt)}',
    body: [
${bodyLines}
    ],
    tags: ${JSON.stringify(article.tags)},
    locked: ${article.locked},
    featured: false,
  },`;

  const updated = dataContent.replace(/\n\];$/, `\n\n${entry}\n];`);
  fs.writeFileSync(DATA_FILE, updated);
}

async function generateArticle(section) {
  const client = new Anthropic();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const systemPrompt = `You are a staff writer for the Fox Valley Tribune, a community newspaper serving northeastern Illinois.
Write in a clear, factual AP-style voice with local specificity. Use real-sounding names, places, and details.
Return ONLY valid JSON — no markdown, no explanation, no code fences.`;

  const userPrompt = `Write a new article for the ${section} section of the Fox Valley Tribune.
The article should be about: ${SECTION_PROMPTS[section]}

Today is ${today}. Make the article feel timely and current.

Return a JSON object with exactly these fields:
{
  "slug": "kebab-case-url-slug-unique-and-descriptive",
  "title": "Compelling headline under 90 characters",
  "byline": "Author name, or Tribune Staff, Tribune Sports, or Tribune Lifestyle",
  "category": "Short category label (1-3 words)",
  "excerpt": "Single sentence summary for article cards, under 160 characters",
  "body": [
    "First paragraph — the lede, most important information first.",
    "Second paragraph — supporting details, context, or quotes.",
    "Third paragraph — additional reporting or background.",
    "Fourth paragraph — another quote or detail.",
    "Fifth paragraph — closing context or forward-looking note."
  ],
  "tags": ["${section}", "relevant-tag", "another-tag"],
  "locked": true
}

Rules:
- locked should be true for roughly 70% of articles, false for shorter community items
- body must be 4-6 paragraphs as an array of plain strings
- No markdown in body text — plain prose only
- The slug must be descriptive and unique
- Tags use kebab-case, drawn from: news, sports, opinion, local-politics, lifestyle, government, education, elections, community, business-and-finance, health, infrastructure, environment, family-and-parenting, food-and-drink, home-design, wellness, personal-development, outdoors, high-school-sports, youth-sports`;

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Could not parse JSON from model response:\n${raw}`);
    parsed = JSON.parse(match[0]);
  }

  return parsed;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set.');
  }

  const state = readState();
  const section = getNextSection(state.lastSection);
  const nextId = state.lastId + 1;

  console.log(`[publish-daily] Section: ${section} | Article ID: ${nextId}`);

  const article = await generateArticle(section);

  if (slugExists(article.slug)) {
    article.slug = `${article.slug}-${Date.now()}`;
  }

  console.log(`[publish-daily] Generated: "${article.title}"`);
  console.log(`[publish-daily] Slug: ${article.slug} | Locked: ${article.locked}`);

  appendArticle(article, section, nextId);
  writeState({ lastSection: section, lastId: nextId });

  const repoRoot = path.join(__dirname, '..');
  execSync('git add lib/data.js scripts/.publish-state.json', { stdio: 'inherit', cwd: repoRoot });
  execSync(
    `git commit -m "Daily publish [${section}]: ${article.title.substring(0, 60)}"`,
    { stdio: 'inherit', cwd: repoRoot }
  );
  execSync('git push', { stdio: 'inherit', cwd: repoRoot });

  console.log('[publish-daily] Done — pushed to GitHub. Vercel will redeploy shortly.');
}

main().catch(err => {
  console.error('[publish-daily] Error:', err.message);
  process.exit(1);
});
