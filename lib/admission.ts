import { Classe } from '../types';

/**
  Détermine la section (A ou B) d'un nouvel élève pour équilibrer les effectifs.
 */
export function determinerSection(classeData: Classe): 'A' | 'B' {
  const { effectifA, effectifB } = classeData;

  // Cas 1 : La section A est moins chargée
  if (effectifA < effectifB) {
    return 'A';
  }

  // Cas 2 : La section B est moins chargée
  if (effectifB < effectifA) {
    return 'B';
  }

  return Math.random() < 0.5 ? 'A' : 'B';
}