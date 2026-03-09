"use client";

import { CONFIG_FINANCE, formatPrix } from '@/lib/config-finance';
import React, { useState } from 'react';
import { databases } from '@/lib/appwrite';
import { jsPDF } from "jspdf";
import MobileNav from '@/components/Mobilenav';
import { Query } from 'appwrite';
import { Search, CheckCircle, Receipt, Loader2 } from 'lucide-react';
type OngletType = 'stats' | 'paiements' | 'eleves' | 'impayes' | 'admissions';

interface CaisseViewProps {
  onClose: () => void;
  vueFullActive?: OngletType | null; 
}
export default function CaisseView({ onClose, vueFullActive }: CaisseViewProps) {
      const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(false);
  const [eleveTrouve, setEleveTrouve] = useState<any>(null);
  const [error, setError] = useState('');

  const [historiquePaye, setHistoriquePaye] = useState({
    inscription: false,
    dossier: false,
    tenue: false,
    t1: 0, t2: 0, t3: 0
  });

  const [montantT1, setMontantT1] = useState(0);
  const [montantT2, setMontantT2] = useState(0);
  const [montantT3, setMontantT3] = useState(0);
  const [inclureDossier, setInclureDossier] = useState(false);
  const [inclureTenue, setInclureTenue] = useState(false);

  const resetVues = () => {
    setEleveTrouve(null);
    setRecherche('');
    setError('');
  };

  const rechercherJeton = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeSaisi = recherche.trim().toLowerCase();
    if (!codeSaisi) return;
    setLoading(true);
    setError('');

    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        [Query.startsWith("$id", codeSaisi)],
      );

      if (response.documents.length > 0) {
        const eleve = response.documents[0];
        setEleveTrouve(eleve);
        const h = {
          inscription: eleve.statut_paiement === "Payé",
          dossier: !!eleve.dossier_paye,
          tenue: !!eleve.tenue_payee,
          t1: Number(eleve.tranche1) || 0,
          t2: Number(eleve.tranche2) || 0,
          t3: Number(eleve.tranche3) || 0
        };
        setHistoriquePaye(h);
        setMontantT1(h.t1); setMontantT2(h.t2); setMontantT3(h.t3);
      } else {
        setError(`Code inconnu : ${codeSaisi}`);
      }
    } catch (err) {
      setError("Erreur de connexion Appwrite.");
    } finally {
      setLoading(false);
    }
  };

  const calculerTotalSession = () => {
    const diffT1 = Math.max(0, montantT1 - historiquePaye.t1);
    const diffT2 = Math.max(0, montantT2 - historiquePaye.t2);
    const diffT3 = Math.max(0, montantT3 - historiquePaye.t3);
    let total = 0;
    if (!historiquePaye.inscription) total += CONFIG_FINANCE.frais.inscription;
    // if (inclureDossier && !historiquePaye.dossier) total += CONFIG_FINANCE.frais.dossier;
    // if (inclureTenue && !historiquePaye.tenue) total += CONFIG_FINANCE.frais.tenue;
    return total + diffT1 + diffT2 + diffT3;
  };

    // --- LOGIQUE : PDF ---
    const genererRecuPDF = (eleve: any, totalSession: number, versement: any) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 180] });
      const centre = 40;
      
      doc.setFont("helvetica", "bold").setFontSize(11);
      doc.text("HORIZON SANTÉ 2026", centre, 10, { align: "center" });
      doc.setFontSize(8).text("REÇU OFFICIEL DE CAISSE", centre, 15, { align: "center" });
      doc.line(5, 18, 75, 18);
      
      doc.setFontSize(7).setFont("helvetica", "bold");
      doc.text(`ÉLÈVE : ${eleve.nom_complet.toUpperCase()}`, 5, 24);
      doc.setFont("helvetica", "normal");
      doc.text(`CLASSE : ${eleve.classe}ème ${eleve.section}`, 5, 28); 
      doc.text(`ID : ${eleve.$id.substring(0, 12)}`, 5, 32);
      doc.text(`DATE : ${new Date().toLocaleString('fr-FR')}`, 5, 36);
      doc.line(5, 39, 75, 39);
  
      doc.setFont("helvetica", "bold").text("DÉTAILS DU PAIEMENT", centre, 44, { align: "center" });
      let y = 50;
  
      // Affichage dynamique des frais de base
      if (!historiquePaye.inscription) {
        doc.setFont("helvetica", "normal");
        doc.text("- Frais Inscription Base", 5, y);
        doc.text(`${formatPrix(CONFIG_FINANCE.frais.inscription)}`, 75, y, { align: "right" });
        y += 5;
      }
      if (inclureDossier) {
          doc.text("- Frais de Dossier", 5, y);
          // doc.text(`${formatPrix(CONFIG_FINANCE.frais.dossier)}`, 75, y, { align: "right" });
          y += 5;
      }
      if (inclureTenue) {
          doc.text("- Tenue Scolaire", 5, y);
          // doc.text(`${formatPrix(CONFIG_FINANCE.frais.tenue)}`, 75, y, { align: "right" });
          y += 5;
      }
  
      // Tranches
      doc.setFont("helvetica", "normal");
      if (versement.t1 > 0) { doc.text("- Versement Tranche 1", 5, y); doc.text(formatPrix(versement.t1), 75, y, { align: "right" }); y += 5; }
      if (versement.t2 > 0) { doc.text("- Versement Tranche 2", 5, y); doc.text(formatPrix(versement.t2), 75, y, { align: "right" }); y += 5; }
      if (versement.t3 > 0) { doc.text("- Versement Tranche 3", 5, y); doc.text(formatPrix(versement.t3), 75, y, { align: "right" }); y += 5; }
  
      doc.line(40, y + 2, 75, y + 2);
      doc.setFont("helvetica", "bold").setFontSize(10);
      doc.text("TOTAL PAYÉ :", 5, y + 8);
      doc.text(`${formatPrix(totalSession)} FC`, 75, y + 8, { align: "right" });
  
      y += 18;
      doc.setLineDashPattern([1, 1], 0);
      doc.line(5, y, 75, y);
      doc.setFontSize(7).text("SITUATION GÉNÉRALE APRÈS PAIEMENT", centre, y + 5, { align: "center" });
      y += 11;
      
      const recap = [
        { label: "Tranche 1", actuel: montantT1, max: CONFIG_FINANCE.tranches.t1 },
        { label: "Tranche 2", actuel: montantT2, max: CONFIG_FINANCE.tranches.t2 },
        { label: "Tranche 3", actuel: montantT3, max: CONFIG_FINANCE.tranches.t3 },
      ];
  
      doc.setFont("helvetica", "normal").setFontSize(6);
      recap.forEach(r => {
        const reste = r.max - r.actuel;
        doc.text(`${r.label}: ${formatPrix(r.actuel)} / ${formatPrix(r.max)}`, 5, y);
        doc.text(`Reste: ${formatPrix(reste)}`, 75, y, { align: "right" });
        y += 4;
      });
  
      doc.save(`Recu_${eleve.nom_complet.replace(/\s+/g, '_')}.pdf`);
    };
  

  const confirmerPaiement = async () => {
    if (!eleveTrouve) return;
    setLoading(true);
          const montantInscription = !historiquePaye.inscription ? CONFIG_FINANCE.frais.inscription : (Number(eleveTrouve.frais_inscription) || 0);
    
    try {
      const totalSession = calculerTotalSession();
      const payload = {
        statut_paiement: "Payé",
        date_paiement: new Date().toISOString(),
        tranche1: Number(montantT1),
        tranche2: Number(montantT2),
                frais_inscription: Number(montantInscription),

        tranche3: Number(montantT3),
        dossier_paye: historiquePaye.dossier || inclureDossier,
        tenue_payee: historiquePaye.tenue || inclureTenue,
        total_paye: Number(montantT1 + montantT2 + montantT3 + (montantInscription || 0)) 
      };

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        eleveTrouve.$id,
        payload
      );
      // Le reste ne change pas (PDF et Alert)
      genererRecuPDF(eleveTrouve, totalSession, {
        t1: montantT1 - historiquePaye.t1,
        t2: montantT2 - historiquePaye.t2,
        t3: montantT3 - historiquePaye.t3,
      });

      alert("Paiement validé !");
      resetVues(); // On reset sans recharger la page
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barre de recherche style Dashboard */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={rechercherJeton} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" value={recherche} 
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un élève par ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Vérifier"}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{error}</p>}
      </div>

      {eleveTrouve && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Colonne de gauche : Infos & Frais Fixes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-slate-800 uppercase">{eleveTrouve.nom_complet}</h2>
              <p className="text-blue-600 font-bold text-xs">{eleveTrouve.classe}ème {eleveTrouve.section}</p>
              
              <div className="mt-6 space-y-3">
                <div className={`p-4 rounded-xl border flex justify-between items-center ${historiquePaye.inscription ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
                  <span className="font-bold text-slate-600">Inscription</span>
                  <span className={`text-xs font-black ${historiquePaye.inscription ? 'text-slate-400' : 'text-blue-600'}`}>
                    {historiquePaye.inscription ? "RÉGLÉ" : formatPrix(CONFIG_FINANCE.frais.inscription) + " FC"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => !historiquePaye.dossier && setInclureDossier(!inclureDossier)} 
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col ${inclureDossier ? 'border-blue-600 bg-blue-50' : 'border-slate-50 opacity-60'}`}>
                      <span className="text-[10px] font-black text-slate-400">DOSSIER</span>
                      {/* <span className="font-bold text-slate-700">{formatPrix(CONFIG_FINANCE.frais.dossier)} FC</span> */}
                    </button>
                    <button onClick={() => !historiquePaye.tenue && setInclureTenue(!inclureTenue)} 
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col ${inclureTenue ? 'border-blue-600 bg-blue-50' : 'border-slate-50 opacity-60'}`}>
                      <span className="text-[10px] font-black text-slate-400">TENUE</span>
                      {/* <span className="font-bold text-slate-700">{formatPrix(CONFIG_FINANCE.frais.tenue)} FC</span> */}
                    </button>
                </div>
              </div>
            </div>

            {/* Tranches */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
               {['t1', 't2', 't3'].map((t, index) => {
                 const field = t === 't1' ? 'tranche1' : t === 't2' ? 'tranche2' : 'tranche3';
                 const max = CONFIG_FINANCE.tranches[t as keyof typeof CONFIG_FINANCE.tranches];
                 const val = t === 't1' ? montantT1 : t === 't2' ? montantT2 : montantT3;
                 const setter = t === 't1' ? setMontantT1 : t === 't2' ? setMontantT2 : setMontantT3;
                 const payeBDD = Number(eleveTrouve[field]) || 0;

                 return (
                   <div key={t} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Tranche {index+1}</p>
                        <input 
                          type="number" value={val} disabled={payeBDD >= max}
                          onChange={(e) => setter(Math.min(max, Math.max(payeBDD, Number(e.target.value))))}
                          className="w-full bg-transparent font-bold text-slate-700 outline-none"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400">Reste</p>
                        <p className="text-xs font-black text-blue-600">{formatPrix(max - val)} FC</p>
                      </div>
                   </div>
                 )
               })}
            </div>
          </div>

          {/* Colonne de droite : Résumé & Action */}
          <div className="space-y-4">
             <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
                <p className="text-[10px] font-bold opacity-80 uppercase">Total à percevoir</p>
                <h3 className="text-3xl font-black mt-1">{formatPrix(calculerTotalSession())} <span className="text-sm">FC</span></h3>
                <button 
                  onClick={confirmerPaiement}
                  disabled={calculerTotalSession() === 0 || loading}
                  className="w-full mt-6 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  Valider Paiement
                </button>
             </div>
          </div>
        </div>
      )}
       <MobileNav 
  current={vueFullActive || 'paiements'} 
  setOnglet={(val) => {
    if (val === 'stats') {
      onClose(); 
    }
  }} 
/> 
    </div>
    
  );
}