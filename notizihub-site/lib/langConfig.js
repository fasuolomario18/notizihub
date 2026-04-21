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
