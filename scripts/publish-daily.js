#!/usr/bin/env node
// Runs daily to generate one new article via Piano's OpenWebUI LLM endpoint,
// rotating through all sections. Appends to lib/data.js, commits, and pushes
// so Vercel auto-deploys the updated static site.
//
// Usage:  node scripts/publish-daily.js
// Cron:   0 7 * * * cd /path/to/fox-valley-tribune && node scripts/publish-daily.js
// Env:    OPENWEBUI_API_KEY, OPENWEBUI_ENDPOINT, OPENWEBUI_MODEL (loaded from .env)

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');
const { PERSONAS } = require('../lib/personas');

const DATA_FILE = path.join(__dirname, '../lib/data.js');
const STATE_FILE = path.join(__dirname, '.publish-state.json');

const SECTIONS = ['news', 'sports', 'opinion', 'local-politics', 'lifestyle'];

const SECTION_PROMPTS = {
  news: 'local government, community events, education, business, or public services in the Fox Valley region of northeastern Illinois. Cities include Geneva, Batavia, St. Charles, Aurora, and Elgin in Kane and Kendall counties.',
  sports: 'high school or youth sports in the Fox Valley region. Sports include soccer, wrestling, swimming, baseball, basketball, cross country, volleyball, or local road races and recreational leagues. Premium Sports Pass articles cover recruiting, in-depth game analysis, athlete profiles, and season previews. Free articles cover scores, schedules, and event announcements.',
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

function buildPersonaBlock(section) {
  const relevant = PERSONAS.filter(p => p.sections.includes(section));
  if (!relevant.length) return '';
  const lines = relevant.map(p => `- ${p.name} (${p.role}): ${p.personality}`).join('\n');
  return `\nRECURRING FOX VALLEY CHARACTERS — if one fits naturally in this story, give them a quote or mention (1-2 max). Skip them entirely if they don't fit — never force it:\n${lines}\n`;
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

  const updated = dataContent.replace(/\n\];\n?$/, `\n\n${entry}\n];\n`);
  fs.writeFileSync(DATA_FILE, updated);
}

async function generateArticle(section) {
  const { OPENWEBUI_API_KEY, OPENWEBUI_ENDPOINT, OPENWEBUI_MODEL } = process.env;

  if (!OPENWEBUI_API_KEY || !OPENWEBUI_ENDPOINT || !OPENWEBUI_MODEL) {
    throw new Error('Missing OPENWEBUI_API_KEY, OPENWEBUI_ENDPOINT, or OPENWEBUI_MODEL in environment.');
  }

  const baseUrl = OPENWEBUI_ENDPOINT.replace(/\/$/, '');
  const url = `${baseUrl}/api/chat/completions`;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const systemPrompt = `You are a staff writer for the Fox Valley Tribune, a community newspaper serving northeastern Illinois.
Write in a clear, factual AP-style voice with local specificity. Use real-sounding names, places, and details.
Return ONLY valid JSON — no markdown, no explanation, no code fences.`;

  const userPrompt = `Write a new article for the ${section} section of the Fox Valley Tribune.
The article should be about: ${SECTION_PROMPTS[section]}
${buildPersonaBlock(section)}

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
- For sports articles specifically: locked=true for recruiting, game analysis, athlete features, season previews; locked=false for scores, schedules, event announcements
- body must be 4-6 paragraphs as an array of plain strings
- No markdown in body text — plain prose only
- The slug must be descriptive and unique
- Tags use kebab-case, drawn from: news, sports, opinion, local-politics, lifestyle, government, education, elections, community, business-and-finance, health, infrastructure, environment, family-and-parenting, food-and-drink, home-design, wellness, personal-development, outdoors, high-school-sports, youth-sports`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENWEBUI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENWEBUI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenWebUI API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
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

async function sendSummaryEmail(article, section, id) {
  const { SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, SUMMARY_EMAIL } = process.env;
  if (!SMTP_USER || !SMTP_PASSWORD || !SUMMARY_EMAIL) {
    console.log('[publish-daily] Email config missing — skipping summary email.');
    return;
  }

  const BASE_URL = 'https://fox-valley-tribune.vercel.app';
  const articleUrl = `${BASE_URL}/${section}/${article.slug}`;
  const sectionLabel = section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="background: #0D3B6E; padding: 20px 24px;">
        <h1 style="color: white; font-size: 22px; margin: 0;">Fox Valley Tribune</h1>
        <p style="color: #aac4e8; font-size: 13px; margin: 4px 0 0;">Daily Publish Summary — ${date}</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #555; margin: 0 0 20px;">1 article published and deployed to Vercel.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; width: 90px;">Section</td>
            <td style="padding: 6px 10px; font-size: 13px;">${sectionLabel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888;">Headline</td>
            <td style="padding: 6px 10px; font-size: 13px;">${article.title}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888;">Byline</td>
            <td style="padding: 6px 10px; font-size: 13px;">${article.byline}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888;">Article ID</td>
            <td style="padding: 6px 10px; font-size: 13px;">${id}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888;">Locked</td>
            <td style="padding: 6px 10px; font-size: 13px;">${article.locked ? 'Yes (paywalled)' : 'No (free)'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888;">Excerpt</td>
            <td style="padding: 6px 10px; font-size: 13px; font-style: italic; color: #555;">${article.excerpt}</td>
          </tr>
        </table>
        <div style="margin-top: 24px;">
          <a href="${articleUrl}" style="background: #0D3B6E; color: white; padding: 10px 20px; text-decoration: none; font-size: 14px; display: inline-block;">View Article →</a>
          <a href="${BASE_URL}/${section}" style="margin-left: 12px; color: #0D3B6E; font-size: 14px;">View ${sectionLabel} section →</a>
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(SMTP_PORT || '587'),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.verify();
  console.log('[publish-daily] SMTP connection verified.');

  await transporter.sendMail({
    from: `"Fox Valley Tribune" <${FROM_EMAIL}>`,
    to: SUMMARY_EMAIL,
    subject: `FVT Published: ${article.title}`,
    html,
  });

  console.log(`[publish-daily] Summary email sent to ${SUMMARY_EMAIL}`);
}

async function main() {
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

  // Sync new article into the traffic simulator catalog
  try {
    const simScript = path.join(__dirname, '../../piano-traffic-sim/scripts/sync_catalog.py');
    execSync(`python3 "${simScript}"`, { stdio: 'inherit', cwd: repoRoot });
    console.log('[publish-daily] Simulator catalog synced.');
  } catch (err) {
    console.error('[publish-daily] Catalog sync failed (non-fatal):', err.message);
  }

  await sendSummaryEmail(article, section, nextId).catch(err => {
    console.error('[publish-daily] Email failed:', err.message);
  });
}

main().catch(err => {
  console.error('[publish-daily] Error:', err.message);
  process.exit(1);
});
