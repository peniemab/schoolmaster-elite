export interface Portefeuille {
  inscription: boolean;
  tranche1: number; // Montant payé
  tranche2: number;
  tranche3: number;
  totalPaye: number;
  soldeRestant: number;
}

export interface Eleve {
  id: string;
  nom: string;
  postnom: string;
  classe: string; 
  section: 'A' | 'B';
  portefeuille: Portefeuille;
  dateInscription: Date;
}

export interface Classe {
  nom: string;
  effectifA: number;
  effectifB: number;
}