import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.notizihub.com';
const LINGUE_IDS = ['en', 'es', 'de', 'fr', 'pt'];

function generateSitemap(articoliIT, articoliLang) {
  const staticPages = ['', '/chi-siamo', '/contattaci', '/privacy', ...LINGUE_IDS.map(l => `/${l}`)];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${articoliIT.map(a => `  <url>
    <loc>${SITE_URL}/${a.nicchia}/${a.slug}</loc>
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${articoliLang.map(a => `  <url>
    <loc>${SITE_URL}/${a.lang}/${a.nicchia}/${a.slug}</loc>
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
  const nicchie = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.'));
  for (const nicchia of nicchie) {
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
  const articoliLang = [];
  for (const lang of LINGUE_IDS) {
    const langDir = path.join(OUTPUT_DIR, lang);
    articoliLang.push(...readArticles(langDir, { lang }));
  }

  res.setHeader('Content-Type', 'text/xml');
  res.write(generateSitemap(articoliIT, articoliLang));
  res.end();
  return { props: {} };
}

export default Sitemap;
