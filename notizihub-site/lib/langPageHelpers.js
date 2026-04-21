import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), '..', 'output');
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notizihub.it';

export const LINGUE = [
  { id: 'it', nome: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { id: 'en', nome: 'English',  flag: '🇺🇸', locale: 'en-US' },
  { id: 'es', nome: 'Español',  flag: '🇪🇸', locale: 'es-ES' },
  { id: 'de', nome: 'Deutsch',  flag: '🇩🇪', locale: 'de-DE' },
  { id: 'fr', nome: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { id: 'pt', nome: 'Português',flag: '🇧🇷', locale: 'pt-BR' },
];

export const NICCHIE_META = [
  { id: 'finanza', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'crypto', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'tech', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'salute', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'viaggi', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'motori', colore: '#166534', bg: '#F0FDF4' },
  { id: 'gaming', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'casa', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'lavoro', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'sport', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'assicurazioni', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'fisco', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'pensioni', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'prestiti', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'trading', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'cucina', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'moda', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'bellezza', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'animali', colore: '#166534', bg: '#F0FDF4' },
  { id: 'ambiente', colore: '#166534', bg: '#F0FDF4' },
  { id: 'startup', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'smartphone', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'scienza', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'psicologia', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'cinema', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'energia', colore: '#b45309', bg: '#FFFBEB' },
];

export function getNicchiaMeta(id) {
  return NICCHIE_META.find(n => n.id === id) || { colore: '#111', bg: '#f5f5f5' };
}

export function getLangDir(lang) {
  return path.join(OUTPUT_DIR, lang);
}

export async function getLangHomeProps(lang) {
  const langDir = getLangDir(lang);
  const tutti = [];

  if (fs.existsSync(langDir)) {
    const nicchie = fs.readdirSync(langDir).filter(f =>
      fs.statSync(path.join(langDir, f)).isDirectory() && !f.startsWith('.')
    );
    for (const nicchia of nicchie) {
      const dir = path.join(langDir, nicchia);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
        tutti.push({
          titolo: data.title || '',
          slug: data.slug || '',
          nicchia,
          nicchia_nome: data.nicchia_nome || nicchia,
          data: data.date || '',
          meta: data.meta_description || '',
        });
      }
    }
  }

  tutti.sort((a, b) => new Date(b.data) - new Date(a.data));
  const lingua = LINGUE.find(l => l.id === lang);
  return { props: { articoli: tutti.slice(0, 30), lang, lingua }, revalidate: 3600 };
}

export async function getLangArticlePaths(lang) {
  const paths = [];
  const langDir = getLangDir(lang);
  if (!fs.existsSync(langDir)) return { paths, fallback: 'blocking' };

  const nicchie = fs.readdirSync(langDir).filter(f =>
    fs.statSync(path.join(langDir, f)).isDirectory() && !f.startsWith('.')
  );
  for (const nicchia of nicchie) {
    const dir = path.join(langDir, nicchia);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
      if (data.slug) paths.push({ params: { nicchia, slug: data.slug } });
    }
  }
  return { paths, fallback: 'blocking' };
}

function parseFaq(content) {
  const sectionPattern = /## (Domande Frequenti|Frequently Asked Questions|Preguntas Frecuentes|Häufig gestellte Fragen|Questions Fréquentes|Perguntas Frequentes)([\s\S]*?)(?=\n## |\n<!-- META|$)/;
  const faqMatch = content.match(sectionPattern);
  if (!faqMatch) return [];
  const faqs = [];
  const re = /\*\*(Q|D|P|F):\s*(.*?)\*\*\s*\n(A|R):\s*(.*?)(?=\n\*\*|\n<!-- META|$)/gs;
  let m;
  while ((m = re.exec(faqMatch[2])) !== null) {
    faqs.push({ q: m[2].trim().replace(/\?$/, ''), a: m[4].trim() });
  }
  return faqs;
}

function parseTldr(content) {
  const m = content.match(/<!--\s*TLDR\s*-->([\s\S]*?)<!--\s*\/TLDR\s*-->/);
  return m ? m[1].trim() : null;
}

export async function getLangArticleProps(lang, params) {
  const { nicchia, slug } = params;
  const dir = path.join(getLangDir(lang), nicchia);
  if (!fs.existsSync(dir)) return { notFound: true };

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let articolo = null;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      const tldr = parseTldr(content);
      const faqs = parseFaq(content);
      const cleanContent = content.replace(/<!--\s*TLDR\s*-->[\s\S]*?<!--\s*\/TLDR\s*-->\n?/g, '');
      const processed = await remark().use(html).process(cleanContent);
      articolo = { ...data, contenuto: processed.toString(), tldr, faqs };
      break;
    }
  }

  if (!articolo) return { notFound: true };

  const correlati = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.slug && data.slug !== slug) {
      correlati.push({ titolo: data.title || '', slug: data.slug, meta: data.meta_description || '', data: data.date || '' });
    }
  }
  correlati.sort((a, b) => new Date(b.data) - new Date(a.data));
  articolo.correlati = correlati.slice(0, 3);

  const lingua = LINGUE.find(l => l.id === lang) || LINGUE[1];
  return { props: { articolo, lang, nicchia, lingua }, revalidate: 86400 };
}
