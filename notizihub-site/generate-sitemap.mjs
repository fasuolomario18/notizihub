import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.notizihub.com';
const LINGUE_IDS = ['en', 'es', 'de', 'fr', 'pt'];
const ALL_LANGS = ['it', ...LINGUE_IDS];

function hreflangLinks(pairs) {
  return pairs.map(([lang, href]) =>
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`
  ).join('\n');
}

function homepageAlternates() {
  return ALL_LANGS.map(l => [l, l === 'it' ? `${SITE_URL}/` : `${SITE_URL}/${l}`])
    .concat([['x-default', `${SITE_URL}/`]]);
}

function nicchiaAlternates(nicchia) {
  return ALL_LANGS.map(l => [l, l === 'it' ? `${SITE_URL}/nicchia/${nicchia}` : `${SITE_URL}/${l}/nicchia/${nicchia}`])
    .concat([['x-default', `${SITE_URL}/nicchia/${nicchia}`]]);
}

function readArticles(dir, prefix = {}) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.')
  );
  for (const nicchia of entries) {
    const nicchiaDir = path.join(dir, nicchia);
    const files = fs.readdirSync(nicchiaDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      try {
        const { data } = matter(fs.readFileSync(path.join(nicchiaDir, file), 'utf-8'));
        if (data.slug) result.push({ nicchia, slug: data.slug, data: data.date || '', ...prefix });
      } catch {}
    }
  }
  return result;
}

const articoliIT = readArticles(OUTPUT_DIR);
const nicchie = fs.existsSync(OUTPUT_DIR)
  ? fs.readdirSync(OUTPUT_DIR).filter(f =>
      fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() &&
      !f.startsWith('.') && !LINGUE_IDS.includes(f)
    )
  : [];

const articoliLang = [];
for (const lang of LINGUE_IDS) {
  articoliLang.push(...readArticles(path.join(OUTPUT_DIR, lang), { lang }));
}

const staticPages = ['/chi-siamo', '/contattaci', '/privacy'];
const homepageAlts = homepageAlternates();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>${SITE_URL}/</loc>
${hreflangLinks(homepageAlts)}
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${LINGUE_IDS.map(l => `  <url>
    <loc>${SITE_URL}/${l}</loc>
${hreflangLinks(homepageAlts)}
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}

${nicchie.map(n => {
  const alts = nicchiaAlternates(n);
  return [
    `  <url>\n    <loc>${SITE_URL}/nicchia/${n}</loc>\n${hreflangLinks(alts)}\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ...LINGUE_IDS.map(l => `  <url>\n    <loc>${SITE_URL}/${l}/nicchia/${n}</loc>\n${hreflangLinks(alts)}\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`)
  ].join('\n');
}).join('\n')}

${articoliIT.map(a => `  <url>
    <loc>${SITE_URL}/${a.nicchia}/${a.slug}</loc>
    <xhtml:link rel="alternate" hreflang="it" href="${SITE_URL}/${a.nicchia}/${a.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${a.nicchia}/${a.slug}" />
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

${articoliLang.map(a => `  <url>
    <loc>${SITE_URL}/${a.lang}/${a.nicchia}/${a.slug}</loc>
    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE_URL}/${a.lang}/${a.nicchia}/${a.slug}" />
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
console.log(`Sitemap generata: ${articoliIT.length} articoli IT, ${articoliLang.length} articoli multilingua, ${nicchie.length} categorie`);
