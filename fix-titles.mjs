import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');

function extractH1(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function cleanRssTitle(title) {
  // Remove source name suffix like " - Radio Popolare", " - Il Sole 24 Ore", etc.
  return title.replace(/\s*-\s*[^-]{3,50}$/, '').trim();
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80);
}

let fixed = 0, skipped = 0;

function processDir(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith('.') && entry.length === 2) {
      // lang directory
      processDir(fullPath, entry);
    } else if (stat.isDirectory() && !entry.startsWith('.')) {
      // nicchia directory
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        
        // Extract current title from frontmatter
        const titleMatch = raw.match(/^title:\s*"(.+)"$/m);
        if (!titleMatch) { skipped++; continue; }
        const currentTitle = titleMatch[1];
        
        // Check if title has source suffix (contains " - SomeName")
        const hasSuffix = /\s+-\s+[A-Z][^-]{2,40}$/.test(currentTitle);
        if (!hasSuffix) { skipped++; continue; }
        
        // Try to extract H1 from content body
        const contentBody = raw.replace(/^---[\s\S]*?---\n/, '');
        const h1 = extractH1(contentBody);
        const newTitle = h1 || cleanRssTitle(currentTitle);
        
        if (newTitle === currentTitle) { skipped++; continue; }
        
        // Also fix meta_description if it's just the old title
        let updated = raw.replace(/^title:\s*".+"$/m, `title: "${newTitle.replace(/"/g, "'")}"`);
        
        // Fix slug too
        const newSlug = slugify(newTitle);
        updated = updated.replace(/^slug:\s*".+"$/m, `slug: "${newSlug}"`);
        
        // Fix meta_description if it matches the old RSS title
        const metaMatch = updated.match(/^meta_description:\s*"(.+)"$/m);
        if (metaMatch && metaMatch[1].includes(' - ') && /[A-Z][^-]{2,40}$/.test(metaMatch[1])) {
          updated = updated.replace(/^meta_description:\s*".+"$/m, `meta_description: "${newTitle.substring(0, 155).replace(/"/g, "'")}"`);
        }
        
        fs.writeFileSync(filePath, updated, 'utf-8');
        console.log(`[fixed] ${currentTitle.substring(0, 50)} → ${newTitle.substring(0, 50)}`);
        fixed++;
      }
    }
  }
}

processDir(OUTPUT_DIR);
console.log(`\nDone: ${fixed} fixed, ${skipped} skipped`);
