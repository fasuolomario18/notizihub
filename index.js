/**
 * NotiziHub - Auto Publisher Multilingua
 * Genera articoli SEO in 6 lingue (IT, EN, ES, DE, FR, PT) da RSS feed
 */

import Parser from 'rss-parser';
import nodemailer from 'nodemailer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parser = new Parser();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LINGUE = [
  { id: 'it', nome: 'italiano',  locale: 'it-IT', hl: 'it', gl: 'IT', ceid: 'IT:it' },
  { id: 'en', nome: 'English',   locale: 'en-US', hl: 'en', gl: 'US', ceid: 'US:en' },
  { id: 'es', nome: 'español',   locale: 'es-ES', hl: 'es', gl: 'ES', ceid: 'ES:es' },
  { id: 'de', nome: 'Deutsch',   locale: 'de-DE', hl: 'de', gl: 'DE', ceid: 'DE:de' },
  { id: 'fr', nome: 'français',  locale: 'fr-FR', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  { id: 'pt', nome: 'português', locale: 'pt-BR', hl: 'pt', gl: 'BR', ceid: 'BR:pt' },
];

const NICCHIE = [
  { id: 'finanza', nome: { it: 'Finanza Personale', en: 'Personal Finance', es: 'Finanzas Personales', de: 'Finanzen', fr: 'Finances Personnelles', pt: 'Finanças Pessoais' },
    feed_base: ['finanza+personale+investimenti', 'risparmio+ETF+borsa'],
    keyword_base: { it: ['investire', 'risparmio', 'ETF'], en: ['investing', 'savings', 'ETF'], es: ['invertir', 'ahorro', 'ETF'], de: ['investieren', 'sparen', 'ETF'], fr: ['investir', 'épargne', 'ETF'], pt: ['investir', 'poupança', 'ETF'] } },
  { id: 'crypto', nome: { it: 'Crypto & Web3', en: 'Crypto & Web3', es: 'Cripto & Web3', de: 'Krypto & Web3', fr: 'Crypto & Web3', pt: 'Cripto & Web3' },
    feed_base: ['bitcoin+ethereum+crypto', 'blockchain+DeFi'],
    keyword_base: { it: ['bitcoin', 'ethereum', 'DeFi'], en: ['bitcoin', 'ethereum', 'DeFi'], es: ['bitcoin', 'ethereum', 'DeFi'], de: ['bitcoin', 'ethereum', 'DeFi'], fr: ['bitcoin', 'ethereum', 'DeFi'], pt: ['bitcoin', 'ethereum', 'DeFi'] } },
  { id: 'tech', nome: { it: 'Tecnologia & AI', en: 'Technology & AI', es: 'Tecnología & IA', de: 'Technologie & KI', fr: 'Technologie & IA', pt: 'Tecnologia & IA' },
    feed_base: ['intelligenza+artificiale+tecnologia', 'AI+software+tech'],
    keyword_base: { it: ['intelligenza artificiale', 'smartphone', 'software'], en: ['artificial intelligence', 'smartphone', 'software'], es: ['inteligencia artificial', 'smartphone', 'software'], de: ['künstliche Intelligenz', 'Smartphone', 'Software'], fr: ['intelligence artificielle', 'smartphone', 'logiciel'], pt: ['inteligência artificial', 'smartphone', 'software'] } },
  { id: 'salute', nome: { it: 'Salute & Wellness', en: 'Health & Wellness', es: 'Salud & Bienestar', de: 'Gesundheit & Wellness', fr: 'Santé & Bien-être', pt: 'Saúde & Bem-estar' },
    feed_base: ['salute+benessere+medicina', 'health+wellness'],
    keyword_base: { it: ['dieta', 'benessere', 'prevenzione'], en: ['diet', 'wellness', 'prevention'], es: ['dieta', 'bienestar', 'prevención'], de: ['Diät', 'Wohlbefinden', 'Prävention'], fr: ['régime', 'bien-être', 'prévention'], pt: ['dieta', 'bem-estar', 'prevenção'] } },
  { id: 'viaggi', nome: { it: 'Viaggi', en: 'Travel', es: 'Viajes', de: 'Reisen', fr: 'Voyages', pt: 'Viagens' },
    feed_base: ['viaggi+vacanze+turismo', 'travel+tourism+vacation'],
    keyword_base: { it: ['voli low cost', 'hotel', 'vacanze'], en: ['cheap flights', 'hotel', 'vacation'], es: ['vuelos baratos', 'hotel', 'vacaciones'], de: ['Billigflüge', 'Hotel', 'Urlaub'], fr: ['vols pas chers', 'hôtel', 'vacances'], pt: ['voos baratos', 'hotel', 'férias'] } },
  { id: 'motori', nome: { it: 'Motori & Auto', en: 'Cars & Motors', es: 'Coches & Motor', de: 'Autos & Motor', fr: 'Voitures & Moteurs', pt: 'Carros & Motor' },
    feed_base: ['auto+motori+elettrico', 'car+electric+vehicle'],
    keyword_base: { it: ['auto elettrica', 'SUV', 'incentivi auto'], en: ['electric car', 'SUV', 'EV'], es: ['coche eléctrico', 'SUV', 'EV'], de: ['Elektroauto', 'SUV', 'Förderung'], fr: ['voiture électrique', 'SUV', 'subvention'], pt: ['carro elétrico', 'SUV', 'incentivos'] } },
  { id: 'gaming', nome: { it: 'Gaming & Esport', en: 'Gaming & Esports', es: 'Gaming & Esports', de: 'Gaming & Esports', fr: 'Gaming & Esports', pt: 'Gaming & Esports' },
    feed_base: ['videogiochi+gaming+ps5+xbox', 'gaming+esports+PC'],
    keyword_base: { it: ['PS5', 'Xbox', 'PC gaming'], en: ['PS5', 'Xbox', 'PC gaming'], es: ['PS5', 'Xbox', 'PC gaming'], de: ['PS5', 'Xbox', 'PC-Gaming'], fr: ['PS5', 'Xbox', 'PC gaming'], pt: ['PS5', 'Xbox', 'PC gaming'] } },
  { id: 'casa', nome: { it: 'Casa & Immobiliare', en: 'Home & Real Estate', es: 'Casa & Inmobiliaria', de: 'Haus & Immobilien', fr: 'Maison & Immobilier', pt: 'Casa & Imóveis' },
    feed_base: ['immobiliare+casa+affitto+mutuo', 'real+estate+housing'],
    keyword_base: { it: ['mutuo', 'affitto', 'ristrutturazione'], en: ['mortgage', 'rent', 'renovation'], es: ['hipoteca', 'alquiler', 'renovación'], de: ['Hypothek', 'Miete', 'Renovierung'], fr: ['hypothèque', 'loyer', 'rénovation'], pt: ['hipoteca', 'aluguel', 'renovação'] } },
  { id: 'lavoro', nome: { it: 'Lavoro & Carriera', en: 'Work & Career', es: 'Trabajo & Carrera', de: 'Arbeit & Karriere', fr: 'Travail & Carrière', pt: 'Trabalho & Carreira' },
    feed_base: ['lavoro+occupazione+stipendio', 'jobs+career+salary'],
    keyword_base: { it: ['smart working', 'stipendio', 'curriculum'], en: ['remote work', 'salary', 'resume'], es: ['teletrabajo', 'salario', 'currículum'], de: ['Homeoffice', 'Gehalt', 'Lebenslauf'], fr: ['télétravail', 'salaire', 'CV'], pt: ['trabalho remoto', 'salário', 'currículo'] } },
  { id: 'sport', nome: { it: 'Sport', en: 'Sports', es: 'Deportes', de: 'Sport', fr: 'Sports', pt: 'Esportes' },
    feed_base: ['sport+calcio+football', 'sports+football+tennis'],
    keyword_base: { it: ['Serie A', 'calcio', 'Formula 1'], en: ['football', 'NBA', 'Formula 1'], es: ['fútbol', 'La Liga', 'Fórmula 1'], de: ['Fußball', 'Bundesliga', 'Formel 1'], fr: ['football', 'Ligue 1', 'Formule 1'], pt: ['futebol', 'Brasileirão', 'Fórmula 1'] } },
  { id: 'assicurazioni', nome: { it: 'Assicurazioni', en: 'Insurance', es: 'Seguros', de: 'Versicherungen', fr: 'Assurances', pt: 'Seguros' },
    feed_base: ['assicurazione+polizza+RC', 'insurance+policy'],
    keyword_base: { it: ['assicurazione auto', 'polizza'], en: ['car insurance', 'life insurance'], es: ['seguro de coche', 'seguro de vida'], de: ['Kfz-Versicherung', 'Lebensversicherung'], fr: ['assurance auto', 'assurance vie'], pt: ['seguro de carro', 'seguro de vida'] } },
  { id: 'fisco', nome: { it: 'Fisco & Tasse', en: 'Taxes & Fiscal', es: 'Impuestos & Fiscal', de: 'Steuern & Finanzen', fr: 'Impôts & Fiscalité', pt: 'Impostos & Fiscal' },
    feed_base: ['fisco+tasse+dichiarazione', 'taxes+fiscal+IRS'],
    keyword_base: { it: ['dichiarazione dei redditi', 'tasse'], en: ['tax return', 'IRS', 'taxes'], es: ['declaración de renta', 'impuestos'], de: ['Steuererklärung', 'Steuer'], fr: ['déclaration d\'impôts', 'fiscalité'], pt: ['declaração de imposto', 'IR'] } },
  { id: 'pensioni', nome: { it: 'Pensioni', en: 'Pensions & Retirement', es: 'Pensiones & Jubilación', de: 'Rente & Ruhestand', fr: 'Retraite', pt: 'Previdência & Aposentadoria' },
    feed_base: ['pensioni+INPS+pensione', 'pension+retirement+social+security'],
    keyword_base: { it: ['pensione', 'INPS'], en: ['pension', 'retirement', 'social security'], es: ['pensión', 'jubilación'], de: ['Rente', 'Ruhestand'], fr: ['retraite', 'pension'], pt: ['aposentadoria', 'previdência'] } },
  { id: 'prestiti', nome: { it: 'Prestiti & Credito', en: 'Loans & Credit', es: 'Préstamos & Crédito', de: 'Kredite', fr: 'Prêts & Crédit', pt: 'Empréstimos & Crédito' },
    feed_base: ['prestito+finanziamento+credito', 'loan+credit+financing'],
    keyword_base: { it: ['prestito personale', 'finanziamento'], en: ['personal loan', 'credit score'], es: ['préstamo personal', 'crédito'], de: ['Kredit', 'Darlehen'], fr: ['prêt personnel', 'crédit'], pt: ['empréstimo pessoal', 'crédito'] } },
  { id: 'trading', nome: { it: 'Trading Online', en: 'Online Trading', es: 'Trading Online', de: 'Online-Trading', fr: 'Trading en ligne', pt: 'Trading Online' },
    feed_base: ['trading+borsa+azioni', 'stocks+trading+market'],
    keyword_base: { it: ['trading', 'azioni', 'borsa'], en: ['trading', 'stocks', 'market'], es: ['trading', 'acciones', 'bolsa'], de: ['Trading', 'Aktien', 'Börse'], fr: ['trading', 'actions', 'bourse'], pt: ['trading', 'ações', 'bolsa'] } },
  { id: 'cucina', nome: { it: 'Cucina & Ricette', en: 'Cooking & Recipes', es: 'Cocina & Recetas', de: 'Kochen & Rezepte', fr: 'Cuisine & Recettes', pt: 'Culinária & Receitas' },
    feed_base: ['ricette+cucina+gastronomia', 'recipes+cooking+food'],
    keyword_base: { it: ['ricette', 'cucina italiana'], en: ['recipes', 'cooking'], es: ['recetas', 'cocina'], de: ['Rezepte', 'Kochen'], fr: ['recettes', 'cuisine'], pt: ['receitas', 'culinária'] } },
  { id: 'moda', nome: { it: 'Moda & Stile', en: 'Fashion & Style', es: 'Moda & Estilo', de: 'Mode & Stil', fr: 'Mode & Style', pt: 'Moda & Estilo' },
    feed_base: ['moda+tendenze+fashion', 'fashion+style+trends'],
    keyword_base: { it: ['moda', 'tendenze', 'outfit'], en: ['fashion', 'trends', 'outfit'], es: ['moda', 'tendencias', 'outfit'], de: ['Mode', 'Trends', 'Outfit'], fr: ['mode', 'tendances', 'tenue'], pt: ['moda', 'tendências', 'look'] } },
  { id: 'bellezza', nome: { it: 'Bellezza & Cura', en: 'Beauty & Care', es: 'Belleza & Cuidado', de: 'Schönheit & Pflege', fr: 'Beauté & Soins', pt: 'Beleza & Cuidados' },
    feed_base: ['bellezza+skincare+beauty', 'beauty+skincare+makeup'],
    keyword_base: { it: ['skincare', 'trucco', 'capelli'], en: ['skincare', 'makeup', 'hair'], es: ['skincare', 'maquillaje', 'cabello'], de: ['Hautpflege', 'Make-up', 'Haare'], fr: ['soins de peau', 'maquillage', 'cheveux'], pt: ['skincare', 'maquiagem', 'cabelo'] } },
  { id: 'animali', nome: { it: 'Animali Domestici', en: 'Pets', es: 'Mascotas', de: 'Haustiere', fr: 'Animaux de Compagnie', pt: 'Animais de Estimação' },
    feed_base: ['animali+cane+gatto+veterinario', 'pets+dog+cat+vet'],
    keyword_base: { it: ['cane', 'gatto', 'veterinario'], en: ['dog', 'cat', 'vet'], es: ['perro', 'gato', 'veterinario'], de: ['Hund', 'Katze', 'Tierarzt'], fr: ['chien', 'chat', 'vétérinaire'], pt: ['cachorro', 'gato', 'veterinário'] } },
  { id: 'ambiente', nome: { it: 'Ambiente & Green', en: 'Environment & Green', es: 'Medio Ambiente', de: 'Umwelt & Nachhaltigkeit', fr: 'Environnement & Écologie', pt: 'Meio Ambiente' },
    feed_base: ['ambiente+clima+sostenibilita', 'climate+environment+sustainability'],
    keyword_base: { it: ['sostenibilità', 'clima'], en: ['sustainability', 'climate change'], es: ['sostenibilidad', 'cambio climático'], de: ['Nachhaltigkeit', 'Klimawandel'], fr: ['durabilité', 'changement climatique'], pt: ['sustentabilidade', 'mudança climática'] } },
  { id: 'startup', nome: { it: 'Startup & Business', en: 'Startup & Business', es: 'Startups & Negocios', de: 'Startups & Business', fr: 'Startups & Business', pt: 'Startups & Negócios' },
    feed_base: ['startup+imprenditoria+business', 'startup+business+entrepreneurship'],
    keyword_base: { it: ['startup', 'imprenditoria'], en: ['startup', 'entrepreneurship'], es: ['startup', 'emprendimiento'], de: ['Startup', 'Unternehmertum'], fr: ['startup', 'entrepreneuriat'], pt: ['startup', 'empreendedorismo'] } },
  { id: 'smartphone', nome: { it: 'Smartphone & App', en: 'Smartphones & Apps', es: 'Smartphones & Apps', de: 'Smartphones & Apps', fr: 'Smartphones & Apps', pt: 'Smartphones & Apps' },
    feed_base: ['smartphone+iphone+android+app', 'iPhone+Android+smartphone'],
    keyword_base: { it: ['iPhone', 'Android', 'app'], en: ['iPhone', 'Android', 'app'], es: ['iPhone', 'Android', 'app'], de: ['iPhone', 'Android', 'App'], fr: ['iPhone', 'Android', 'application'], pt: ['iPhone', 'Android', 'aplicativo'] } },
  { id: 'scienza', nome: { it: 'Scienza & Spazio', en: 'Science & Space', es: 'Ciencia & Espacio', de: 'Wissenschaft & Weltraum', fr: 'Science & Espace', pt: 'Ciência & Espaço' },
    feed_base: ['scienza+spazio+ricerca', 'science+space+NASA+research'],
    keyword_base: { it: ['scienza', 'spazio', 'NASA'], en: ['science', 'space', 'NASA'], es: ['ciencia', 'espacio', 'NASA'], de: ['Wissenschaft', 'Weltall', 'NASA'], fr: ['science', 'espace', 'NASA'], pt: ['ciência', 'espaço', 'NASA'] } },
  { id: 'psicologia', nome: { it: 'Psicologia & Mente', en: 'Psychology & Mind', es: 'Psicología & Mente', de: 'Psychologie & Mentalität', fr: 'Psychologie & Mental', pt: 'Psicologia & Mente' },
    feed_base: ['psicologia+ansia+benessere+mentale', 'psychology+mental+health+anxiety'],
    keyword_base: { it: ['ansia', 'psicologia'], en: ['anxiety', 'psychology', 'mental health'], es: ['ansiedad', 'psicología'], de: ['Angst', 'Psychologie'], fr: ['anxiété', 'psychologie'], pt: ['ansiedade', 'psicologia'] } },
  { id: 'cinema', nome: { it: 'Cinema & Serie TV', en: 'Movies & TV Shows', es: 'Cine & Series', de: 'Kino & Serien', fr: 'Cinéma & Séries', pt: 'Cinema & Séries' },
    feed_base: ['film+serie+tv+netflix', 'movies+TV+Netflix+streaming'],
    keyword_base: { it: ['film', 'serie TV', 'Netflix'], en: ['movies', 'TV shows', 'Netflix'], es: ['películas', 'series', 'Netflix'], de: ['Filme', 'Serien', 'Netflix'], fr: ['films', 'séries', 'Netflix'], pt: ['filmes', 'séries', 'Netflix'] } },
  { id: 'energia', nome: { it: 'Energia & Bollette', en: 'Energy & Bills', es: 'Energía & Facturas', de: 'Energie & Rechnungen', fr: 'Énergie & Factures', pt: 'Energia & Contas' },
    feed_base: ['bolletta+energia+gas+fotovoltaico', 'energy+electricity+solar+bills'],
    keyword_base: { it: ['bolletta luce', 'fotovoltaico'], en: ['electricity bill', 'solar panels'], es: ['factura de luz', 'paneles solares'], de: ['Stromrechnung', 'Solaranlage'], fr: ['facture d\'électricité', 'panneaux solaires'], pt: ['conta de luz', 'energia solar'] } },
];

const CONFIG = {
  articoli_per_nicchia: parseInt(process.env.ARTICLES_PER_NICHE || '1'),
  output_dir: process.env.OUTPUT_DIR || path.join(__dirname, 'notizihub-site', 'output'),
  lunghezza_articolo: 1500,
};

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80);
}
function oggi() { return new Date().toISOString().split('T')[0]; }
function hash(str) { return crypto.createHash('md5').update(str).digest('hex').substring(0, 8); }

function getOutputDir(lang) {
  if (lang === 'it') return CONFIG.output_dir;
  return path.join(CONFIG.output_dir, lang);
}

function buildGoogleFeed(query, lingua) {
  return `https://news.google.com/rss/search?q=${query}&hl=${lingua.hl}&gl=${lingua.gl}&ceid=${lingua.ceid}`;
}

async function leggiArticoliGiaGenerati(lang) {
  const dir = getOutputDir(lang);
  try { return new Set(JSON.parse(await fs.readFile(path.join(dir, '.generated.json'), 'utf-8'))); }
  catch { return new Set(); }
}
async function salvaArticoloGenerato(id, generati, lang) {
  const dir = getOutputDir(lang);
  generati.add(id);
  await fs.writeFile(path.join(dir, '.generated.json'), JSON.stringify([...generati]));
}

async function leggiFeed(nicchia, lingua) {
  const items = [];
  const dieci_giorni_fa = new Date();
  dieci_giorni_fa.setDate(dieci_giorni_fa.getDate() - 10);

  const feeds = nicchia.feed_base.map(q => buildGoogleFeed(q, lingua));

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 3)) {
        if (!item.title) continue;
        if (item.pubDate && new Date(item.pubDate) < dieci_giorni_fa) continue;
        items.push({ titolo: item.title, sommario: item.contentSnippet || '', link: item.link || '', data: item.pubDate || '' });
      }
    } catch { /* feed non raggiungibile */ }
  }
  return items.sort(() => Math.random() - 0.5).slice(0, CONFIG.articoli_per_nicchia * 2);
}

async function generaArticolo(nicchia, spunto, lingua) {
  const dataOggi = new Date().toLocaleDateString(lingua.locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const annoCorrente = new Date().getFullYear();
  const nomeNicchia = nicchia.nome[lingua.id] || nicchia.nome.en;
  const keywords = (nicchia.keyword_base[lingua.id] || nicchia.keyword_base.en).slice(0, 3).join(', ');

  const systemPrompts = {
    it: `Sei un giornalista esperto di ${nomeNicchia} che scrive per un pubblico italiano. Scrivi SOLO l'articolo in formato Markdown, senza commenti aggiuntivi. Oggi è ${dataOggi}. Anno corrente: ${annoCorrente}.`,
    en: `You are an expert journalist covering ${nomeNicchia} writing for an English-speaking audience. Write ONLY the article in Markdown format, no additional comments. Today is ${dataOggi}. Current year: ${annoCorrente}.`,
    es: `Eres un periodista experto en ${nomeNicchia} que escribe para audiencia hispanohablante. Escribe SOLO el artículo en formato Markdown, sin comentarios adicionales. Hoy es ${dataOggi}. Año actual: ${annoCorrente}.`,
    de: `Du bist ein Experte für ${nomeNicchia} und schreibst für ein deutschsprachiges Publikum. Schreibe NUR den Artikel im Markdown-Format, ohne zusätzliche Kommentare. Heute ist der ${dataOggi}. Aktuelles Jahr: ${annoCorrente}.`,
    fr: `Tu es un journaliste expert en ${nomeNicchia} qui écrit pour un public francophone. Écris UNIQUEMENT l'article en format Markdown, sans commentaires supplémentaires. Aujourd'hui nous sommes le ${dataOggi}. Année en cours: ${annoCorrente}.`,
    pt: `Você é um jornalista especialista em ${nomeNicchia} escrevendo para um público lusófono. Escreva SOMENTE o artigo em formato Markdown, sem comentários adicionais. Hoje é ${dataOggi}. Ano atual: ${annoCorrente}.`,
  };

  const userPrompts = {
    it: `Scrivi un articolo SEO di circa ${CONFIG.lunghezza_articolo} parole su:\n\nSPUNTO: "${spunto.titolo}"\nKEYWORD: ${keywords}\n\nStruttura OBBLIGATORIA:\n<!-- TLDR -->\n[2-3 frasi riassuntive]\n<!-- /TLDR -->\n\n# [H1 con keyword]\n\n[Introduzione]\n\n## [Sezione 1]\n## [Sezione 2]\n## [Sezione 3 con lista puntata]\n\n## Domande Frequenti\n**D: [domanda 1]?**\nR: [risposta]\n**D: [domanda 2]?**\nR: [risposta]\n**D: [domanda 3]?**\nR: [risposta]\n**D: [domanda 4]?**\nR: [risposta]\n**D: [domanda 5]?**\nR: [risposta]\n\n## Conclusione\n\n<!-- META: [meta description 155 caratteri] -->`,
    en: `Write a SEO article of about ${CONFIG.lunghezza_articolo} words about:\n\nTOPIC: "${spunto.titolo}"\nKEYWORDS: ${keywords}\n\nMANDATORY STRUCTURE:\n<!-- TLDR -->\n[2-3 summary sentences]\n<!-- /TLDR -->\n\n# [H1 with keyword]\n\n[Introduction]\n\n## [Section 1]\n## [Section 2]\n## [Section 3 with bullet list]\n\n## Frequently Asked Questions\n**Q: [question 1]?**\nA: [answer]\n**Q: [question 2]?**\nA: [answer]\n**Q: [question 3]?**\nA: [answer]\n**Q: [question 4]?**\nA: [answer]\n**Q: [question 5]?**\nA: [answer]\n\n## Conclusion\n\n<!-- META: [meta description 155 chars] -->`,
    es: `Escribe un artículo SEO de aproximadamente ${CONFIG.lunghezza_articolo} palabras sobre:\n\nTEMA: "${spunto.titolo}"\nPALABRAS CLAVE: ${keywords}\n\nESTRUCTURA OBLIGATORIA:\n<!-- TLDR -->\n[2-3 frases resumen]\n<!-- /TLDR -->\n\n# [H1 con keyword]\n\n[Introducción]\n\n## [Sección 1]\n## [Sección 2]\n## [Sección 3 con lista]\n\n## Preguntas Frecuentes\n**P: [pregunta 1]?**\nR: [respuesta]\n**P: [pregunta 2]?**\nR: [respuesta]\n**P: [pregunta 3]?**\nR: [respuesta]\n**P: [pregunta 4]?**\nR: [respuesta]\n**P: [pregunta 5]?**\nR: [respuesta]\n\n## Conclusión\n\n<!-- META: [meta description 155 chars] -->`,
    de: `Schreibe einen SEO-Artikel mit etwa ${CONFIG.lunghezza_articolo} Wörtern über:\n\nTHEMA: "${spunto.titolo}"\nKEYWORDS: ${keywords}\n\nOBLIGATORISCHE STRUKTUR:\n<!-- TLDR -->\n[2-3 zusammenfassende Sätze]\n<!-- /TLDR -->\n\n# [H1 mit Keyword]\n\n[Einleitung]\n\n## [Abschnitt 1]\n## [Abschnitt 2]\n## [Abschnitt 3 mit Liste]\n\n## Häufig gestellte Fragen\n**F: [Frage 1]?**\nA: [Antwort]\n**F: [Frage 2]?**\nA: [Antwort]\n**F: [Frage 3]?**\nA: [Antwort]\n**F: [Frage 4]?**\nA: [Antwort]\n**F: [Frage 5]?**\nA: [Antwort]\n\n## Fazit\n\n<!-- META: [meta description 155 Zeichen] -->`,
    fr: `Écris un article SEO d'environ ${CONFIG.lunghezza_articolo} mots sur:\n\nSUJET: "${spunto.titolo}"\nMOTS-CLÉS: ${keywords}\n\nSTRUCTURE OBLIGATOIRE:\n<!-- TLDR -->\n[2-3 phrases résumé]\n<!-- /TLDR -->\n\n# [H1 avec keyword]\n\n[Introduction]\n\n## [Section 1]\n## [Section 2]\n## [Section 3 avec liste]\n\n## Questions Fréquentes\n**Q: [question 1]?**\nR: [réponse]\n**Q: [question 2]?**\nR: [réponse]\n**Q: [question 3]?**\nR: [réponse]\n**Q: [question 4]?**\nR: [réponse]\n**Q: [question 5]?**\nR: [réponse]\n\n## Conclusion\n\n<!-- META: [meta description 155 caractères] -->`,
    pt: `Escreva um artigo SEO de aproximadamente ${CONFIG.lunghezza_articolo} palavras sobre:\n\nTEMA: "${spunto.titolo}"\nPALAVRAS-CHAVE: ${keywords}\n\nESTRUTURA OBRIGATÓRIA:\n<!-- TLDR -->\n[2-3 frases resumo]\n<!-- /TLDR -->\n\n# [H1 com keyword]\n\n[Introdução]\n\n## [Seção 1]\n## [Seção 2]\n## [Seção 3 com lista]\n\n## Perguntas Frequentes\n**P: [pergunta 1]?**\nR: [resposta]\n**P: [pergunta 2]?**\nR: [resposta]\n**P: [pergunta 3]?**\nR: [resposta]\n**P: [pergunta 4]?**\nR: [resposta]\n**P: [pergunta 5]?**\nR: [resposta]\n\n## Conclusão\n\n<!-- META: [meta description 155 caracteres] -->`,
  };

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: systemPrompts[lingua.id] || systemPrompts.en,
    messages: [{ role: 'user', content: userPrompts[lingua.id] || userPrompts.en }]
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

function parseFaqFromContent(content, lang) {
  const markers = { it: 'D:', en: 'Q:', es: 'P:', de: 'F:', fr: 'Q:', pt: 'P:' };
  const marker = markers[lang] || 'Q:';
  const sections = ['Domande Frequenti', 'Frequently Asked Questions', 'Preguntas Frecuentes', 'Häufig gestellte Fragen', 'Questions Fréquentes', 'Perguntas Frequentes'];
  const sectionRegex = new RegExp(`## (${sections.join('|')})([\s\S]*?)(?=\n## |\n<!-- META|$)`);
  const faqMatch = content.match(sectionRegex);
  if (!faqMatch) return [];
  const re = /\*\*(Q|D|P|F):\s*(.*?)\*\*\s*\n(A|R):\s*(.*?)(?=\n\*\*|\n<!-- META|$)/gs;
  const faqs = [];
  let m;
  while ((m = re.exec(faqMatch[2])) !== null) {
    faqs.push({ q: m[2].trim().replace(/\?$/, ''), a: m[4].trim() });
  }
  return faqs;
}

function extractH1(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

async function salvaMarkdown(nicchia, spunto, contenuto, lingua) {
  const data = oggi();
  const metaMatch = contenuto.match(/<!--\s*META:\s*(.+?)\s*-->/s);
  const metaDesc = metaMatch ? metaMatch[1].trim() : spunto.titolo.substring(0, 155);
  const testo = contenuto.replace(/<!--\s*META:.*?-->/s, '').trim();
  // Use the H1 title generated by Claude (not the RSS source title)
  const titoloGenerato = extractH1(testo) || spunto.titolo.replace(/\s*-\s*[^-]+$/, '').trim();
  const slug = slugify(titoloGenerato);
  const nomeNicchia = nicchia.nome[lingua.id] || nicchia.nome.en;
  const keywords = (nicchia.keyword_base[lingua.id] || nicchia.keyword_base.en).slice(0, 3);
  const frontmatter = `---\ntitle: "${titoloGenerato.replace(/"/g, "'")}"\nslug: "${slug}"\ndate: "${data}"\nnicchia: "${nicchia.id}"\nnicchia_nome: "${nomeNicchia}"\nlang: "${lingua.id}"\nmeta_description: "${metaDesc.replace(/"/g, "'")}"\ntags: [${keywords.map(k => `"${k}"`).join(', ')}]\nauto_generated: true\n---\n\n`;
  const dir = path.join(getOutputDir(lingua.id), nicchia.id);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${data}-${slug}.md`);
  await fs.writeFile(filePath, frontmatter + testo, 'utf-8');
  return { filePath, slug, id: hash(spunto.titolo + data + lingua.id), titolo: titoloGenerato };
}

async function inviaReportEmail(risultati, errori) {
  const EMAIL = process.env.GMAIL_USER;
  const PASS = process.env.GMAIL_PASSWORD;
  if (!PASS || !EMAIL) { console.log('  [!] Credenziali email non configurate, email saltata'); return; }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL, pass: PASS } });

  const perLingua = {};
  risultati.forEach(r => {
    if (!perLingua[r.lang]) perLingua[r.lang] = 0;
    perLingua[r.lang]++;
  });

  const costo = (risultati.length * 0.001).toFixed(4);
  const righeFlag = { it: '🇮🇹', en: '🇺🇸', es: '🇪🇸', de: '🇩🇪', fr: '🇫🇷', pt: '🇧🇷' };
  const righe = Object.entries(perLingua).map(([lang, n]) => `<tr><td style="padding:8px 12px;border:1px solid #dee2e6">${righeFlag[lang] || ''} ${lang.toUpperCase()}</td><td style="padding:8px 12px;border:1px solid #dee2e6;text-align:center;font-weight:bold;color:#065f46">${n}</td></tr>`).join('');

  await transporter.sendMail({
    from: `"NotiziHub Bot" <${EMAIL}>`, to: EMAIL,
    subject: `NotiziHub — ${risultati.length} articoli in 6 lingue (${oggi()})`,
    html: `<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto"><div style="background:#111;padding:20px;text-align:center;border-bottom:3px solid #e63946"><h1 style="color:#fff;margin:0">NotiziHub</h1><p style="color:#888;margin:5px 0 0">Report giornaliero multilingua — ${oggi()}</p></div><div style="padding:20px"><div style="display:flex;gap:16px;margin-bottom:20px"><div style="flex:1;background:#EAF3DE;border-radius:8px;padding:16px;text-align:center"><div style="font-size:32px;font-weight:bold;color:#065f46">${risultati.length}</div><div style="color:#3B6D11;font-size:13px">Articoli totali</div></div><div style="flex:1;background:#EBF5FF;border-radius:8px;padding:16px;text-align:center"><div style="font-size:32px;font-weight:bold;color:#1a56db">6</div><div style="color:#1a56db;font-size:13px">Lingue</div></div><div style="flex:1;background:#FEF2F2;border-radius:8px;padding:16px;text-align:center"><div style="font-size:32px;font-weight:bold;color:#991b1b">€${costo}</div><div style="color:#991b1b;font-size:13px">Costo API</div></div></div><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#111"><th style="padding:10px;border:1px solid #dee2e6;color:#fff;text-align:left">Lingua</th><th style="padding:10px;border:1px solid #dee2e6;color:#fff;text-align:center">Articoli</th></tr></thead><tbody>${righe}</tbody></table></div><div style="background:#f8f9fa;padding:12px;text-align:center;font-size:12px;color:#888">NotiziHub Auto Publisher Multilingua</div></div>`
  });
  console.log(`  [email] Report inviato a ${EMAIL}`);
}

async function main() {
  console.log(`\n=== NotiziHub Auto Publisher Multilingua — ${oggi()} ===\n`);
  await fs.mkdir(CONFIG.output_dir, { recursive: true });

  const risultati = [];
  let errori = 0;

  for (const lingua of LINGUE) {
    console.log(`\n\n=== 🌍 LINGUA: ${lingua.id.toUpperCase()} (${lingua.nome}) ===`);
    await fs.mkdir(getOutputDir(lingua.id), { recursive: true });
    const giàGenerati = await leggiArticoliGiaGenerati(lingua.id);

    for (const nicchia of NICCHIE) {
      console.log(`\n[${lingua.id}][${nicchia.id}] Leggo feed RSS...`);
      const spunti = await leggiFeed(nicchia, lingua);
      if (!spunti.length) { console.log(`  [!] Nessun spunto`); continue; }
      let generatiNicchia = 0;
      for (const spunto of spunti) {
        if (generatiNicchia >= CONFIG.articoli_per_nicchia) break;
        const spuntoId = hash(spunto.titolo + lingua.id);
        if (giàGenerati.has(spuntoId)) { console.log(`  [skip] ${spunto.titolo.substring(0, 50)}...`); continue; }
        console.log(`  [gen] ${spunto.titolo.substring(0, 60)}...`);
        try {
          const contenuto = await generaArticolo(nicchia, spunto, lingua);
          const { filePath, slug, id, titolo } = await salvaMarkdown(nicchia, spunto, contenuto, lingua);
          await salvaArticoloGenerato(spuntoId, giàGenerati, lingua.id);
          risultati.push({ lang: lingua.id, nicchia: nicchia.id, slug, titolo, file: filePath });
          generatiNicchia++;
          console.log(`  [ok]  ${path.basename(filePath)}`);
          await new Promise(r => setTimeout(r, 300));
        } catch (err) { console.error(`  [err] ${err.message}`); errori++; }
      }
    }
  }

  console.log(`\n=== Completato ===`);
  console.log(`Articoli generati: ${risultati.length} in ${LINGUE.length} lingue`);
  console.log(`Errori: ${errori}`);
  console.log(`Costo stimato: €${(risultati.length * 0.001).toFixed(4)}`);
  await inviaReportEmail(risultati, errori);
}

main()
  .then(() => process.exit(0))
  .catch(err => { console.error('Errore fatale:', err); process.exit(1); });
