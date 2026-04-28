/**
 * NotiziHub — Article Expander
 * Rilegge ogni articolo .md e lo riscrive con più profondità (700-1000 parole),
 * preservando esattamente: title, slug, date, nicchia, meta_description, tags, image_url.
 *
 * Uso: node expand_articles.js [--lang it] [--nicchia finanza] [--limit 10]
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, 'output');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Argomenti CLI
const args = process.argv.slice(2);
const getLang    = () => { const i = args.indexOf('--lang');    return i !== -1 ? args[i+1] : null; };
const getNicchia = () => { const i = args.indexOf('--nicchia'); return i !== -1 ? args[i+1] : null; };
const getLimit   = () => { const i = args.indexOf('--limit');   return i !== -1 ? parseInt(args[i+1]) : Infinity; };

const LANG_FILTER    = getLang();
const NICCHIA_FILTER = getNicchia();
const LIMIT          = getLimit();
const FORCE          = args.includes('--force');
const LANG_IDS       = ['en', 'es', 'de', 'fr', 'pt'];

// ── Frontmatter parser / serializer ──────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[')) {
      try { val = JSON.parse(val.replace(/'/g, '"')); } catch { val = []; }
    }
    data[m[1]] = val;
  }
  return { data, content: match[2] };
}

function serializeFrontmatter(data) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(x => `"${x}"`).join(', ')}]`);
    } else if (typeof v === 'string' && (v.includes(':') || v.includes('"'))) {
      lines.push(`${k}: "${v.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

function countWords(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/[#*_>`~-]/g, '').split(/\s+/).filter(Boolean).length;
}

// ── Claude expansion ──────────────────────────────────────────────────────────

async function expandArticle(data, content, lang) {
  const langName = { it: 'italiano', en: 'English', es: 'español', de: 'Deutsch', fr: 'français', pt: 'português' }[lang] || lang;

  const prompt = `Sei un giornalista specializzato che scrive in ${langName} per un pubblico reale. Riscrivi questo articolo rendendolo più autentico, specifico e utile.

REGOLE FERREE:
1. Mantieni ESATTAMENTE lo stesso titolo H1 e lo stesso argomento principale
2. L'articolo DEVE essere tra 900 e 1200 parole (body escluso TLDR)
3. Struttura Markdown: usa H2 e H3, paragrafi brevi, liste puntate dove utile
4. Il blocco TLDR (tra <!-- TLDR --> e <!-- /TLDR -->) deve restare IDENTICO
5. La sezione "## Domande Frequenti" DEVE avere almeno 3 domande formato:
   **D: Domanda specifica?**
   R: Risposta dettagliata con dati o esempi concreti (2-3 frasi minimo).
6. Usa dati reali, cifre specifiche, esempi pratici — evita frasi generiche come "è importante" o "è fondamentale"
7. Aggiungi un punto di vista originale o un'informazione non ovvia che un lettore troverebbe utile
8. Scrivi come un umano esperto, non come un testo AI generico
9. NON aggiungere frontmatter, blocchi di codice, tabelle HTML

ARTICOLO DA RISCRIVERE:
${content.substring(0, 3500)}

Scrivi solo il body Markdown migliorato (niente frontmatter):`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].text.trim();
}

// ── Raccolta file .md ─────────────────────────────────────────────────────────

async function collectFiles() {
  const files = [];

  async function scanDir(dir, lang) {
    if (!fsSync.existsSync(dir)) return;
    const nicchie = await fs.readdir(dir);
    for (const nicchia of nicchie) {
      if (NICCHIA_FILTER && nicchia !== NICCHIA_FILTER) continue;
      const nicchiaDir = path.join(dir, nicchia);
      const stat = await fs.stat(nicchiaDir);
      if (!stat.isDirectory() || nicchia.startsWith('.') || LANG_IDS.includes(nicchia)) continue;
      const mds = (await fs.readdir(nicchiaDir)).filter(f => f.endsWith('.md'));
      for (const f of mds) {
        files.push({ filePath: path.join(nicchiaDir, f), lang, nicchia });
      }
    }
  }

  if (!LANG_FILTER || LANG_FILTER === 'it') await scanDir(OUTPUT_DIR, 'it');
  for (const lang of LANG_IDS) {
    if (LANG_FILTER && LANG_FILTER !== lang) continue;
    await scanDir(path.join(OUTPUT_DIR, lang), lang);
  }

  return files;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📰 NotiziHub Article Expander`);
  console.log(`   OUTPUT_DIR: ${OUTPUT_DIR}`);
  console.log(`   Filtro lang: ${LANG_FILTER || 'tutte'} | nicchia: ${NICCHIA_FILTER || 'tutte'} | limit: ${LIMIT === Infinity ? '∞' : LIMIT} | force: ${FORCE}\n`);

  const files = await collectFiles();
  const todo = files.slice(0, LIMIT);
  console.log(`Trovati ${files.length} articoli — elaboro ${todo.length}\n`);

  let ok = 0, skip = 0, err = 0;

  for (let i = 0; i < todo.length; i++) {
    const { filePath, lang, nicchia } = todo[i];
    const fname = path.basename(filePath);

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const { data, content } = parseFrontmatter(raw);
      const words = countWords(content);

      process.stdout.write(`[${i+1}/${todo.length}] ${lang}/${nicchia}/${fname.substring(0, 50)} (${words}w) ... `);

      if (words >= 900 && !FORCE) {
        console.log('✓ skip (già lungo)');
        skip++;
        continue;
      }

      const newContent = await expandArticle(data, content, lang);
      const newWords = countWords(newContent);

      // Riscrivi con stesso frontmatter (data invariata)
      const output = serializeFrontmatter(data) + '\n' + newContent + '\n';
      await fs.writeFile(filePath, output, 'utf-8');

      console.log(`✅ ${words}w → ${newWords}w`);
      ok++;

      // Pausa tra le call per evitare rate limit
      await new Promise(r => setTimeout(r, 400));

    } catch (e) {
      console.log(`❌ ${e.message}`);
      err++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n── Riepilogo ──`);
  console.log(`  ✅ Espansi:   ${ok}`);
  console.log(`  ✓  Saltati:   ${skip} (già ≥ 900 parole)`);
  console.log(`  ❌ Errori:    ${err}`);
  console.log(`  📁 Totale:    ${todo.length}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
