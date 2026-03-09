"use client";

import { CONFIG_FINANCE, formatPrix } from '@/lib/config-finance';
import React, { useState } from 'react';
import { databases } from '@/lib/appwrite';
import { jsPDF } from "jspdf";
import { Query } from 'appwrite';

export default function CaissePage() {
  // --- ÉTATS (STATES) ---
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(false);
  const [eleveTrouve, setEleveTrouve] = useState<any>(null);
  const [error, setError] = useState('');

  // État de l'historique réel en BDD
  const [historiquePaye, setHistoriquePaye] = useState({
    inscription: false,
    // dossier: false, 
        // tenue: false,    
    t1: 0,
    t2: 0,
    t3: 0
  });

  // États des inputs
  const [montantT1, setMontantT1] = useState(0);
  const [montantT2, setMontantT2] = useState(0);
  const [montantT3, setMontantT3] = useState(0);

  const [inclureDossier, setInclureDossier] = useState(false);
  const [inclureTenue, setInclureTenue] = useState(false);

  // --- LOGIQUE : RECHERCHE ÉLÈVE ---
  const rechercherJeton = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeSaisi = recherche.trim().toLowerCase();
    if (!codeSaisi) return;

    setLoading(true);
    setError('');
    setEleveTrouve(null);

    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        [Query.startsWith("$id", codeSaisi)]
      );

      if (response.documents.length > 0) {
        const eleve = response.documents[0];
        setEleveTrouve(eleve);

        const h = {
          inscription: eleve.statut_paiement === "Payé",
          // dossier: !!eleve.dossier_paye, // Lecture de la nouvelle colonne
          // tenue: !!eleve.tenue_payee,     // Lecture de la nouvelle colonne
          t1: Number(eleve.tranche1) || 0,
          t2: Number(eleve.tranche2) || 0,
          t3: Number(eleve.tranche3) || 0
        };
        setHistoriquePaye(h);
        setMontantT1(h.t1);
        setMontantT2(h.t2);
        setMontantT3(h.t3);
        
        // Reset des sélections par défaut
        // setInclureDossier(false);
        // setInclureTenue(false);
      } else {
        setError(`Aucun élève trouvé avec le code : ${codeSaisi}`);
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE : CALCULS ---
  const calculerTotalSession = () => {
    const diffT1 = Math.max(0, montantT1 - historiquePaye.t1);
    const diffT2 = Math.max(0, montantT2 - historiquePaye.t2);
    const diffT3 = Math.max(0, montantT3 - historiquePaye.t3);
    
    let total = 0;
    // L'inscription de base ne s'ajoute que si elle n'a jamais été payée
    if (!historiquePaye.inscription) {
      total += CONFIG_FINANCE.frais.inscription;
    }
    
    // Le dossier et la tenue s'ajoutent SI cochés ET pas encore payés en BDD
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

  // --- LOGIQUE : ENREGISTREMENT ---
  const confirmerPaiement = async () => {
    if (!eleveTrouve) return;
    setLoading(true);

    try {
      const totalSession = calculerTotalSession();
      
      // 1. On détermine les montants réels à envoyer
      // Si déjà payé avant, on garde la valeur. Si coché maintenant, on met le prix. Sinon 0.
      const montantInscription = !historiquePaye.inscription ? CONFIG_FINANCE.frais.inscription : (Number(eleveTrouve.frais_inscription) || 0);
      // const montantDossier = (inclureDossier || historiquePaye.dossier) ? CONFIG_FINANCE.frais.dossier : 0;
      // const montantTenue = (inclureTenue || historiquePaye.tenue) ? CONFIG_FINANCE.frais.tenue : 0;

      // 2. Préparation du payload avec les valeurs explicites
      const payload = {
        statut_paiement: "Payé",
        date_paiement: new Date().toISOString(),
        
        // Tranches
        tranche1: Number(montantT1), 
        tranche2: Number(montantT2), 
        tranche3: Number(montantT3),
        
        // Valeurs financières fixes
        frais_inscription: Number(montantInscription),
        // frais_dossier: Number(montantDossier),
        // frais_tenue: Number(montantTenue),
        
        // Indicateurs de possession
        // dossier_paye: historiquePaye.dossier || inclureDossier,
        // tenue_payee: historiquePaye.tenue || inclureTenue,
        
        // Total global (Somme de tout ce qui est payé en BDD)
        // total_paye: Number(montantT1 + montantT2 + montantT3 + montantInscription + montantDossier + montantTenue)
        total_paye: Number(montantT1 + montantT2 + montantT3 + montantInscription )
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

      alert("Paiement enregistré ! Les montants sont maintenant à jour.");
      window.location.reload(); 
    } catch (err: any) {
      console.error("Erreur Appwrite:", err);
      alert("Erreur de mise à jour. Vérifiez vos colonnes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gray-50 font-sans text-brand-navy">
      <div className="max-w-2xl mx-auto">
        <div className="bg-brand-navy p-6 rounded-t-2xl text-white shadow-xl">
          <h1 className="text-xl font-black uppercase tracking-widest">Horizon Santé 2026</h1>
          <p className="text-brand-green font-bold text-[10px] uppercase">Gestion Financière Sécurisée</p>
        </div>

        <div className="bg-white p-6 border-x border-gray-100 mb-4">
          <form onSubmit={rechercherJeton} className="flex gap-2">
            <input 
              type="text" value={recherche} 
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Code Jeton..."
              className="flex-1 p-3 bg-gray-50 border-2 rounded-xl outline-none focus:border-brand-green font-bold"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 rounded-xl font-black text-xs">
              {loading ? '...' : 'VÉRIFIER'}
            </button>
          </form>
        </div>

        {eleveTrouve && (
          <div className="bg-white p-8 rounded-b-2xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-black">{eleveTrouve.nom_complet}</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase">{eleveTrouve.classe}ème — {eleveTrouve.section}</p>
            </div>

            <div className="space-y-3">
              {/* Bloc Inscription de Base */}
              <div className={`p-4 rounded-2xl border-2 flex justify-between items-center ${historiquePaye.inscription ? 'bg-gray-100 border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
                <span className="font-black text-xs uppercase">Inscription de base</span>
                <span className="font-black text-xs text-orange-600">{historiquePaye.inscription ? "✓ RÉGLÉ" : formatPrix(CONFIG_FINANCE.frais.inscription) + " FC"}</span>
              {/* <span className="font-black text-xs text-orange-600">{historiquePaye.tenue ? "✓ RÉGLÉ" : formatPrix(CONFIG_FINANCE.frais.tenue) + " FC"}</span> */}
              {/* <span className="font-black text-xs text-orange-600">{historiquePaye.dossier ? "✓ RÉGLÉ" : formatPrix(CONFIG_FINANCE.frais.dossier) + " FC"}</span> */}
              </div>

              {/* Bloc Options - Apparaît si l'un des deux n'est pas payé */}
              {/* {(!historiquePaye.dossier || !historiquePaye.tenue) && (
                <div className="grid grid-cols-2 gap-3">
                  {!historiquePaye.dossier && (
                    <button onClick={() => setInclureDossier(!inclureDossier)} className={`p-3 rounded-xl border-2 transition-all flex flex-col ${inclureDossier ? 'border-brand-green bg-green-50' : 'border-gray-100 opacity-50'}`}>
                      <span className="text-[9px] font-black italic">DOSSIER</span>
                      <span className="text-xs font-bold">{formatPrix(CONFIG_FINANCE.frais.dossier)} FC</span>
                    </button>
                  )}
                  {!historiquePaye.tenue && (
                    <button onClick={() => setInclureTenue(!inclureTenue)} className={`p-3 rounded-xl border-2 transition-all flex flex-col ${inclureTenue ? 'border-brand-green bg-green-50' : 'border-gray-100 opacity-50'}`}>
                      <span className="text-[9px] font-black italic">TENUE</span>
                      <span className="text-xs font-bold">{formatPrix(CONFIG_FINANCE.frais.tenue)} FC</span>
                    </button>
                  )}
                </div>
              )} */}
            </div>

            {/* Tranches */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400">Tranches Trimestrielles</h3>
              {[
                { id: 't1', field: 'tranche1', label: 'Tranche 1', val: montantT1, set: setMontantT1, max: CONFIG_FINANCE.tranches.t1 },
                { id: 't2', field: 'tranche2', label: 'Tranche 2', val: montantT2, set: setMontantT2, max: CONFIG_FINANCE.tranches.t2 },
                { id: 't3', field: 'tranche3', label: 'Tranche 3', val: montantT3, set: setMontantT3, max: CONFIG_FINANCE.tranches.t3 },
              ].map((tranche) => {
                const payeBDD = Number(eleveTrouve[tranche.field]) || 0;
                const estSolde = payeBDD >= tranche.max;

                return (
                  <div key={tranche.id} className={`p-5 rounded-2xl border-2 ${estSolde ? 'bg-gray-100' : 'bg-white border-blue-50'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-xs">{tranche.label}</span>
                      <span className="text-[10px] font-bold text-gray-400 italic">Max: {formatPrix(tranche.max)} FC</span>
                    </div>
                    <div className="relative mt-2">
                      <input 
                        type="number" disabled={estSolde} value={tranche.val}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v >= payeBDD && v <= tranche.max) {
                            tranche.set(v);
                          } else if (v > tranche.max) {
                            tranche.set(tranche.max);
                          }
                        }}
                        className={`w-full p-3 rounded-xl font-black text-sm ${estSolde ? 'text-gray-400' : 'bg-gray-50 border-2 border-transparent focus:border-brand-green outline-none'}`}
                      />
                      {estSolde && <span className="absolute right-3 top-3 text-[9px] bg-green-500 text-white px-2 py-1 rounded font-black">SOLDE</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400">Total à percevoir ce jour</span>
                <span className="text-3xl font-black text-brand-green">{formatPrix(calculerTotalSession())} FC</span>
              </div>
              <button 
                onClick={confirmerPaiement}
                disabled={loading || (calculerTotalSession() === 0)}
                className="w-full py-4 bg-brand-navy text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Traitement...' : '✓ Valider & Imprimer Reçu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}