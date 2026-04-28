import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
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

function generateSitemap(nicchie, articoliIT, articoliLang) {
  const staticPages = ['/chi-siamo', '/contattaci', '/privacy'];

  const homepageAlts = homepageAlternates();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- ── Homepage IT + tutte le lingue con hreflang ── -->
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

  <!-- ── Pagine statiche ── -->
${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}

  <!-- ── Categorie IT + lingue con hreflang ── -->
${nicchie.map(n => {
  const alts = nicchiaAlternates(n);
  return [
    `  <url>\n    <loc>${SITE_URL}/nicchia/${n}</loc>\n${hreflangLinks(alts)}\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ...LINGUE_IDS.map(l => `  <url>\n    <loc>${SITE_URL}/${l}/nicchia/${n}</loc>\n${hreflangLinks(alts)}\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`)
  ].join('\n');
}).join('\n')}

  <!-- ── Articoli IT ── -->
${articoliIT.map(a => `  <url>
    <loc>${SITE_URL}/${a.nicchia}/${a.slug}</loc>
    <xhtml:link rel="alternate" hreflang="it" href="${SITE_URL}/${a.nicchia}/${a.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${a.nicchia}/${a.slug}" />
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  <!-- ── Articoli lingue straniere ── -->
${articoliLang.map(a => `  <url>
    <loc>${SITE_URL}/${a.lang}/${a.nicchia}/${a.slug}</loc>
    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE_URL}/${a.lang}/${a.nicchia}/${a.slug}" />
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
}

function Sitemap() { return null; }

function readArticles(dir, prefix = {}) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.'));
  for (const nicchia of entries) {
    const nicchiaDir = path.join(dir, nicchia);
    const files = fs.readdirSync(nicchiaDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const { data } = matter(fs.readFileSync(path.join(nicchiaDir, file), 'utf-8'));
      if (data.slug) result.push({ nicchia, slug: data.slug, data: data.date || '', ...prefix });
    }
  }
  return result;
}

export async function getServerSideProps({ res }) {
  const articoliIT = readArticles(OUTPUT_DIR);

  const nicchie = fs.existsSync(OUTPUT_DIR)
    ? fs.readdirSync(OUTPUT_DIR).filter(f =>
        fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() &&
        !f.startsWith('.') &&
        !LINGUE_IDS.includes(f)
      )
    : [];

  const articoliLang = [];
  for (const lang of LINGUE_IDS) {
    const langDir = path.join(OUTPUT_DIR, lang);
    articoliLang.push(...readArticles(langDir, { lang }));
  }

  res.setHeader('Content-Type', 'text/xml');
  res.write(generateSitemap(nicchie, articoliIT, articoliLang));
  res.end();
  return { props: {} };
}

export default Sitemap;
