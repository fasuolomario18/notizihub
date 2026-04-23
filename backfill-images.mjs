import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './notizihub-site/output';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DELAY_MS = 19000; // 19s = ~3 req/min, sotto il limite 200/hr di Pexels

if (!PEXELS_API_KEY) {
  console.error('[backfill] PEXELS_API_KEY non impostata — impossibile procedere');
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  console.error(`[backfill] Directory non trovata: ${OUTPUT_DIR}`);
  process.exit(1);
}

async function fetchPexelsImage(query) {
  const q = encodeURIComponent(query.slice(0, 60));
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${q}&per_page=5&orientation=landscape`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );
  if (!res.ok) {
    console.warn(`  [pexels] Errore API ${res.status} per "${query}"`);
    return null;
  }
  const data = await res.json();
  if (!data.photos || data.photos.length === 0) {
    console.warn(`  [pexels] Nessuna foto per "${query}"`);
    return null;
  }
  const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
  return photo.src.large2x || photo.src.large;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const nicchiaToQuery = {
  // Niches attive in index.js
  finanza:       'finance money investing',
  crypto:        'cryptocurrency bitcoin blockchain',
  tech:          'technology innovation digital',
  salute:        'health medicine wellness',
  viaggi:        'travel landscape destination',
  motori:        'car automobile electric vehicle',
  gaming:        'gaming videogame console',
  casa:          'home interior real estate',
  lavoro:        'work office career',
  sport:         'sport athlete training',
  assicurazioni: 'insurance contract business',
  fisco:         'tax finance documents',
  pensioni:      'retirement pension senior',
  prestiti:      'loan credit bank',
  trading:       'stock market trading finance',
  cucina:        'food cooking italian cuisine',
  moda:          'fashion style clothing',
  bellezza:      'beauty cosmetics skincare',
  animali:       'animals pets nature',
  ambiente:      'environment nature ecology',
  startup:       'startup entrepreneurship business',
  smartphone:    'smartphone mobile app technology',
  scienza:       'science research laboratory space',
  psicologia:    'psychology mind mental health',
  cinema:        'cinema movie film entertainment',
  energia:       'energy solar wind power',
  // Legacy niches
  cronaca:       'italy news breaking',
  esteri:        'world news international',
  calcio:        'soccer football match',
  'calcio-mercato': 'soccer transfer market',
  tecnologia:    'technology gadget digital',
  musica:        'music concert stage',
  politica:      'politics government parliament',
  economia:      'economy business market',
  scienze:       'science research laboratory',
  scuola:        'education school students',
  auto:          'car automobile driving',
  fumetti:       'comics manga cartoon',
  bricolage:     'diy tools home improvement',
};

// Raccoglie ricorsivamente tutti i file .md sotto una dir
function collectMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !entry.startsWith('.')) {
      results.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md') && !entry.startsWith('.')) {
      results.push(full);
    }
  }
  return results;
}

// Estrae un campo dal frontmatter YAML
function extractFrontmatterField(raw, field) {
  const re = new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, 'm');
  const m = raw.match(re);
  return m ? m[1].trim() : null;
}

async function main() {
  console.log(`[backfill] Scanning: ${OUTPUT_DIR}`);
  const files = collectMdFiles(OUTPUT_DIR);
  console.log(`[backfill] Trovati ${files.length} file .md`);

  // Ordina dal più recente al più vecchio (per nome file)
  files.sort((a, b) => path.basename(b).localeCompare(path.basename(a)));

  let total = 0, updated = 0, skipped = 0, errors = 0;

  for (const filePath of files) {
    total++;
    const raw = fs.readFileSync(filePath, 'utf-8');

    if (/^image_url:/m.test(raw)) {
      skipped++;
      continue;
    }

    // Estrai nicchia dal frontmatter; fallback al nome della dir padre
    const nicchia = extractFrontmatterField(raw, 'nicchia')
      || path.basename(path.dirname(filePath));
    const title = extractFrontmatterField(raw, 'title') || '';

    const baseQuery = nicchiaToQuery[nicchia] || nicchia;
    const titleWords = title.replace(/['"]/g, '').split(' ').slice(0, 3).join(' ');
    const query = titleWords.length > 5 ? `${titleWords} ${nicchia}` : baseQuery;

    console.log(`[${total}] ${path.relative(OUTPUT_DIR, filePath)}`);

    try {
      const imageUrl = await fetchPexelsImage(query);
      if (imageUrl) {
        const newRaw = raw.replace(
          /^(---\n[\s\S]*?)(---\n)/m,
          (_, front, close) => `${front}image_url: "${imageUrl}"\n${close}`
        );
        fs.writeFileSync(filePath, newRaw, 'utf-8');
        updated++;
        console.log(`  → OK: ${imageUrl.substring(0, 60)}...`);
      } else {
        console.log('  → nessuna foto trovata');
      }
    } catch (e) {
      errors++;
      console.error(`  → ERRORE: ${e.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n[backfill] Completato: ${total} file — ${updated} aggiornati, ${skipped} già con immagine, ${errors} errori`);
}

main();
