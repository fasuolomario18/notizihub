import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './output';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DELAY_MS = 19000; // 19s = ~3 req/min, sotto il limite 200/hr di Pexels

if (!PEXELS_API_KEY) {
  console.error('PEXELS_API_KEY non impostata');
  process.exit(1);
}

async function fetchPexelsImage(query) {
  const q = encodeURIComponent(query.slice(0, 60));
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${q}&per_page=5&orientation=landscape`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.photos || data.photos.length === 0) return null;
  const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
  return photo.src.large2x || photo.src.large;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Nicchia → query inglese
const nicchiaToQuery = {
  cronaca: 'italy news breaking',
  esteri: 'world news international',
  calcio: 'soccer football match',
  'calcio-mercato': 'soccer transfer market',
  finanza: 'finance money economy',
  crypto: 'cryptocurrency bitcoin',
  tecnologia: 'technology innovation',
  cinema: 'cinema movie film',
  musica: 'music concert stage',
  salute: 'health medicine wellness',
  cucina: 'food cooking italian cuisine',
  viaggi: 'travel landscape destination',
  casa: 'home interior design',
  moda: 'fashion style clothing',
  bellezza: 'beauty cosmetics skincare',
  sport: 'sport athlete training',
  ambiente: 'environment nature ecology',
  energia: 'energy solar wind power',
  politica: 'politics government parliament',
  economia: 'economy business market',
  scienze: 'science research laboratory',
  scuola: 'education school students',
  lavoro: 'work office career',
  auto: 'car automobile driving',
  tech: 'technology gadget digital',
  gaming: 'gaming videogame console',
  animali: 'animals pets nature',
  fumetti: 'comics manga cartoon',
  fisco: 'tax finance documents',
  assicurazioni: 'insurance contract business',
  bricolage: 'diy tools home improvement',
  en: 'news world',
  es: 'noticias mundo',
  de: 'nachrichten welt',
  fr: 'actualités monde',
  pt: 'notícias mundo',
};

async function main() {
  const nicchie = fs.readdirSync(OUTPUT_DIR).filter(f =>
    fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.')
  );

  // Raccogli tutti i file da processare e ordinali per data (più recenti prima)
  const toProcess = [];
  for (const nicchia of nicchie) {
    const dir = path.join(OUTPUT_DIR, nicchia);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      toProcess.push({ nicchia, dir, file });
    }
  }
  toProcess.sort((a, b) => b.file.localeCompare(a.file)); // ordinamento decrescente per nome file (= per data)

  let total = 0, updated = 0, skipped = 0, errors = 0;

  for (const { nicchia, dir, file } of toProcess) {
      total++;
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');

      // Skip if already has image_url
      if (/^image_url:/m.test(raw)) {
        skipped++;
        continue;
      }

      // Extract title from frontmatter for search query
      const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      const title = titleMatch ? titleMatch[1] : '';
      const baseQuery = nicchiaToQuery[nicchia] || nicchia;
      // Use first 3 words of title if available, else nicchia query
      const titleWords = title.split(' ').slice(0, 3).join(' ');
      const query = titleWords.length > 5 ? `${titleWords} ${nicchia}` : baseQuery;

      try {
        const imageUrl = await fetchPexelsImage(query);
        if (imageUrl) {
          // Insert image_url after the last frontmatter field before closing ---
          const newRaw = raw.replace(
            /^(---\n[\s\S]*?)(---\n)/m,
            (_, front, close) => `${front}image_url: "${imageUrl}"\n${close}`
          );
          fs.writeFileSync(filePath, newRaw, 'utf-8');
          updated++;
          console.log(`[${updated}] ${nicchia}/${file} → OK`);
        } else {
          console.log(`[skip] ${nicchia}/${file} → nessuna foto trovata`);
        }
      } catch (e) {
        errors++;
        console.error(`[err] ${nicchia}/${file}: ${e.message}`);
      }

      await sleep(DELAY_MS);
  }

  console.log(`\nFatto: ${total} articoli — ${updated} aggiornati, ${skipped} già con immagine, ${errors} errori`);
}

main();
