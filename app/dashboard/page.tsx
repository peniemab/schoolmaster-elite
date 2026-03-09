"use client";

import React, { useEffect, useState } from 'react';
import MobileNav from '@/components/Mobilenav'; // Ajuste le chemin selon ton dossier
import { databases, account } from '@/lib/appwrite';
import { Query } from 'appwrite';
import TrimestreSelector from '@/components/Trimestreselector';
import { formatPrix } from '@/lib/config-finance';
import AdmissionView from '@/components/Admissionview';
import Modal from '@/components/Modal'; // Vérifie bien le nom du fichier (Modal.tsx)
// Si tu n'as pas encore ces fichiers, on va les simuler plus bas
import ImpayesView from '@/components/Impayesview'; 
import ElevesView from '@/components/Elevesview';
import CaisseView from '@/components/Caisseview';
import { CONFIG_FINANCE } from '@/lib/config-finance';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, AlertCircle, CheckCircle, LogOut, 
  LayoutDashboard, UserPlus, CreditCard, Clock, List, 
  TrendingUp, School 
} from 'lucide-react';

export type OngletType = 'stats' | 'paiements' | 'eleves' | 'impayes' | 'admissions';


export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ongletActif, setOngletActif] = useState<OngletType>('stats');
  const [vueFullActive, setVueFullActive] = useState<OngletType | null>(null);
  
  // Ajoute cet état spécifique pour la caisse
  const [isCaisseOpen, setIsCaisseOpen] = useState(false);


const [trimestre, setTrimestre] = useState(1); 
  const [stats, setStats] = useState({
    totalCollecte: 0,
    nbEleves: 0,
    totalImpaye: 0,
    elevesAJour: 0,
    elevesImpayes: 0,
    tauxRecouvrement: 0,
    details: { inscription: 0, dossier: 0, tenue: 0, tranches: 0 },
    repartition: [] as any[] // Pour stocker les données du tableau du bas
  });

  const chargerDonneesDuJour = async () => {
  setLoading(true);
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_COLLECTION_ID!
    );

    // 1. Définition de l'objectif SPECIFIQUE (non cumulé pour T1, T2, T3)
    let objectifUnique = 0;
    if (trimestre === 0) objectifUnique = CONFIG_FINANCE.frais.inscription;
    if (trimestre === 1) objectifUnique = CONFIG_FINANCE.tranches.t1;
    if (trimestre === 2) objectifUnique = CONFIG_FINANCE.tranches.t2;
    if (trimestre === 3) objectifUnique = CONFIG_FINANCE.tranches.t3;
    if (trimestre === 4) objectifUnique = CONFIG_FINANCE.totalGeneral; // Pour la vue globale

    let cumulCollecteFiltre = 0; 
    let cumulDetteFiltre = 0;
    let nbAjour = 0;
    let nbImpayes = 0;

    response.documents.forEach((doc: any) => {
      // 2. Sélection de la colonne précise selon le trimestre
      let payePourCeCompartiment = 0;
      if (trimestre === 0) {
        payePourCeCompartiment = Number(doc.frais_inscription || 0);
      }
      else if (trimestre === 1) payePourCeCompartiment = Number(doc.tranche1 || 0);
      else if (trimestre === 2) payePourCeCompartiment = Number(doc.tranche2 || 0);
      else if (trimestre === 3) payePourCeCompartiment = Number(doc.tranche3 || 0);
      else if (trimestre === 4) {
        // Pour la vue globale, on cumule tout
        payePourCeCompartiment = Number(doc.frais_inscription || 0) + 
                                 Number(doc.tranche1 || 0) + 
                                 Number(doc.tranche2 || 0) + 
                                 Number(doc.tranche3 || 0);
      }
      cumulCollecteFiltre += payePourCeCompartiment;

      // 3. Calcul de la dette
      // Un élève est à jour si ce qu'il a payé est supérieur ou égal à l'objectif
      const detteSurCompartiment = Math.max(0, objectifUnique - payePourCeCompartiment);
      
      if (payePourCeCompartiment >= objectifUnique) {
        nbAjour++;
      } else {
        nbImpayes++;
        cumulDetteFiltre += detteSurCompartiment;
      }
    });

    const objectifTotalEcole = response.documents.length * objectifUnique;
    let resultatTaux = objectifTotalEcole > 0 ? (cumulCollecteFiltre / objectifTotalEcole) * 100 : 0;
    
    if (resultatTaux > 100) resultatTaux = 100;

    setStats(prev => ({
      ...prev,
      totalCollecte: cumulCollecteFiltre,
      nbEleves: response.documents.length,
      totalImpaye: cumulDetteFiltre,
      elevesAJour: nbAjour,
      elevesImpayes: nbImpayes,
      tauxRecouvrement: Number(resultatTaux.toFixed(1))
    }));

  } catch (error) {
    console.error("Erreur stats:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const init = async () => {
    try {
      await account.get();
      await chargerDonneesDuJour(); 
    } catch (error) {
      router.push('/login');
    }
  };
  init();
}, [trimestre]); 

  const handleLogout = async () => {
    await account.deleteSession('current');
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-900 font-black uppercase tracking-widest">
        Initialisation SchoolMaster...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter">SchoolMaster Elite</h1>
<p className="text-[10px] text-slate-500 font-bold">{stats.nbEleves} élèves • {stats.tauxRecouvrement}% recouvrement</p>          </div>
        </div>

       <div className="hidden lg:flex items-center gap-6">
  <button 
    onClick={() => setOngletActif('stats')}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      ongletActif === 'stats' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <LayoutDashboard size={14} /> Tableau de Bord
  </button>

  <button 
    onClick={() => setOngletActif('admissions')}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      ongletActif === 'admissions' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <UserPlus size={14} /> Admission
  </button>

  <button 
    onClick={() => setOngletActif('paiements')}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      ongletActif === 'paiements' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <CreditCard size={14} /> Paiements
  </button>

  <button 
    onClick={() => setOngletActif('impayes')}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      ongletActif === 'impayes' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <Clock size={14} /> Impayés
  </button>
  <button 
    onClick={() => setOngletActif('eleves')}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      ongletActif === 'eleves' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <List size={14} /> Liste des Élèves
  </button>
</div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase">Directeur</p>
            <p className="text-xs font-bold">Administrateur</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>
<main className="p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
  {ongletActif === 'stats' && (
    <>        
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Tableau de Bord</h2>
            <p className="text-slate-500 font-medium">Vue d'ensemble de l'établissement</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
  <TrimestreSelector 
    value={trimestre} 
    onChange={setTrimestre} 
  />
</div>

        {/* GRILLE DES CARTES (Design exact photo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TOTAL ELEVES */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-blue-600 mb-4 inline-block">
                  <Users size={24} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Élèves</p>
                <h3 className="text-4xl font-black mt-1">{stats.nbEleves}</h3>
              </div>
            </div>
          </div>

          {/* TOTAL COLLECTE */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-green-600 mb-4 inline-block">
                  <Wallet size={24} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Collecté</p>
                <h3 className="text-4xl font-black mt-1">{formatPrix(stats.totalCollecte)} <span className="text-lg text-slate-400">FC</span></h3>
              </div>
            </div>
          </div>

          {/* TOTAL IMPAYÉ */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-red-600 mb-4 inline-block">
                  <AlertCircle size={24} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Impayé</p>
                <h3 className="text-4xl font-black mt-1 text-red-600">{formatPrix(stats.totalImpaye)} <span className="text-lg">FC</span></h3>
              </div>
            </div>
          </div>

          {/* ÉLÈVES À JOUR */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-emerald-600 mb-4 inline-block">
                  <CheckCircle size={24} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Élèves à Jour</p>
                <h3 className="text-4xl font-black mt-1">{stats.elevesAJour}</h3>
              </div>
            </div>
          </div>
          
          {/* DEUXIÈME LIGNE DE CARTES (Tes nouvelles demandes) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-red-600 mb-4 inline-block">
                  <AlertCircle size={24} />
                </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Élèves Impayés</p>
            <h3 className="text-4xl font-black mt-1 text-red-600">{stats.elevesImpayes}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-slate-50 p-3 rounded-xl text-red-600 mb-4 inline-block">
                  <TrendingUp size={24} />  
                </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Taux Recouvrement</p>
            <h3 className="text-4xl font-black mt-1 text-blue-800">{stats.tauxRecouvrement}%</h3>
              </div>
            </div>
          </div>
        </div>
        </>)}
      </main>
<Modal 
  isOpen={vueFullActive !== null} 
  onClose={() => {
    setVueFullActive(null); 
    chargerDonneesDuJour(); 
  }} 
  title={
    vueFullActive === 'paiements' ? "Caisse & Encaissements" :
    vueFullActive === 'impayes' ? "Liste des Impayés" :
    vueFullActive === 'admissions' ? "Admission Nouvel Élève" :
    vueFullActive === 'eleves' ? "Registre des Étèves" : "Admission"
  }
>
  {/* Tes composants CaisseView, ImpayesView, etc. */}
  {vueFullActive === 'paiements' && (
  <CaisseView 
    vueFullActive={vueFullActive}
    onClose={() => {
      setVueFullActive(null); // Ferme la modale
      chargerDonneesDuJour(); // Rafraîchit les stats
    }} 
  />
)}
{vueFullActive === 'admissions' && (
  <AdmissionView 
    onSuccess={() => chargerDonneesDuJour()} 
    onClose={() => setVueFullActive(null)} 
  />
)}
  {vueFullActive === 'impayes' && <ImpayesView />}
  {vueFullActive === 'eleves' && (
    <ElevesView 
      onClose={() => setVueFullActive(null)} 
      activeView={vueFullActive} 
    />)}
</Modal>

    <MobileNav 
  current={vueFullActive || 'stats'} 
  setOnglet={(val) => {
    if (val === 'stats') {
      setVueFullActive(null);
      chargerDonneesDuJour();     } else {
      setVueFullActive(val);
    }
  }} 
/>
  </div>
  ); 

}

