export const LINGUE = [
  { id: 'it', nome: 'Italiano', flag: '🇮🇹', locale: 'it-IT', hl: 'it', gl: 'IT', ceid: 'IT:it' },
  { id: 'en', nome: 'English',  flag: '🇺🇸', locale: 'en-US', hl: 'en', gl: 'US', ceid: 'US:en' },
  { id: 'es', nome: 'Español',  flag: '🇪🇸', locale: 'es-ES', hl: 'es', gl: 'ES', ceid: 'ES:es' },
  { id: 'de', nome: 'Deutsch',  flag: '🇩🇪', locale: 'de-DE', hl: 'de', gl: 'DE', ceid: 'DE:de' },
  { id: 'fr', nome: 'Français', flag: '🇫🇷', locale: 'fr-FR', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  { id: 'pt', nome: 'Português',flag: '🇧🇷', locale: 'pt-BR', hl: 'pt', gl: 'BR', ceid: 'BR:pt' },
];

export function getLingua(id) {
  return LINGUE.find(l => l.id === id) || LINGUE[0];
}

export const LINGUE_IDS = LINGUE.map(l => l.id);
