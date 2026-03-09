export const CONFIG_FINANCE = {
  devise: "FC",
  frais: {
    inscription: 50000,
    // dossier: 10000,
    // tenue: 25000,
  },
  // On ajoute les tranches ici
  tranches: {
    t1: 150000, 
    t2: 100000, 
    t3: 75000,  
  },
  get totalInscription() {
    return this.frais.inscription 
    // return this.frais.inscription + this.frais.dossier + this.frais.tenue;
  },
  // Optionnel : Total général de l'année (Inscription + toutes les tranches)
  get totalGeneral() {
    return this.totalInscription + this.tranches.t1 + this.tranches.t2 + this.tranches.t3;
  }
};

// Fonction utilitaire pour formater les prix proprement (ex: 50.000)
export const formatPrix = (montant: number) => {
  return montant.toLocaleString('fr-FR');
};