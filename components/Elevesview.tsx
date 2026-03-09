"use client";

import React, { useState, useEffect } from 'react';
import { Search, Printer, AlertCircle } from 'lucide-react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import jsPDF from 'jspdf';
import FicheDetaillee from '@/components/Fichedetaillee'; 
import MobileNav from '@/components/Mobilenav';
import TrimestreSelector from '@/components/Trimestreselector'; 
import { CONFIG_FINANCE, formatPrix } from '@/lib/config-finance';

type OngletType = 'stats' | 'paiements' | 'eleves' | 'impayes' | 'admissions';

interface EleveViewProps {
  onClose?: () => void; 
  activeView?: OngletType;
}

export default function EleveView({ onClose, activeView }: EleveViewProps) {
  const [recherche, setRecherche] = useState('');
  const [classe, setClasse] = useState('');
  const [section, setSection] = useState('');
  const [trimestre, setTrimestre] = useState(1);
  const [filtreStatut, setFiltreStatut] = useState<'Tous' | 'À jour' | 'Impayés'>('Tous');
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- ÉTAT MANQUANT AJOUTÉ ICI ---
  const [eleveSelectionne, setEleveSelectionne] = useState<any | null>(null);

  // --- RECHERCHE ET FILTRAGE ---
  useEffect(() => {
    const chargerEleves = async () => {
      setLoading(true);
      try {
        let queries = [];
        if (classe) queries.push(Query.equal('classe', classe));
        if (section) queries.push(Query.equal('section', section));
        if (recherche) queries.push(Query.search('nom_complet', recherche));

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_COLLECTION_ID!,
          queries
        );

        const resultatsFiltrés = response.documents.filter(doc => {
          let paye = 0;
          let objectif = 0;

          if (trimestre === 0) { 
            paye = Number(doc.frais_inscription || 0); 
            objectif = CONFIG_FINANCE.frais.inscription; 
          }
          else if (trimestre === 1) { paye = Number(doc.tranche1 || 0); objectif = CONFIG_FINANCE.tranches.t1; }
          else if (trimestre === 2) { paye = Number(doc.tranche2 || 0); objectif = CONFIG_FINANCE.tranches.t2; }
          else if (trimestre === 3) { paye = Number(doc.tranche3 || 0); objectif = CONFIG_FINANCE.tranches.t3; }
          else if (trimestre === 4) {
             paye = Number(doc.frais_inscription || 0) + Number(doc.tranche1 || 0) + Number(doc.tranche2 || 0) + Number(doc.tranche3 || 0);
             objectif = CONFIG_FINANCE.totalGeneral;
          }
          
          if (filtreStatut === 'À jour') return paye >= objectif;
          if (filtreStatut === 'Impayés') return paye < objectif;
          return true;
        });

        setEleves(resultatsFiltrés);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    chargerEleves();
  }, [classe, section, recherche, trimestre, filtreStatut]);

  // --- LOGIQUE IMPRESSION : LISTE PROF ---
  const imprimerListeProf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold").text("HORIZON SANTÉ 2026", 105, 15, { align: "center" });
    doc.setFontSize(10).text(`LISTE DE CLASSE : ${classe}ème ${section}`, 105, 22, { align: "center" });
    
    let y = 35;
    doc.setFontSize(9).text("N°", 10, y);
    doc.text("NOM COMPLET", 30, y);
    doc.text("SEXE", 140, y);
    doc.text("JETON", 165, y);
    doc.line(10, y+2, 200, y+2);

    y += 10;
    eleves.forEach((e, i) => {
      doc.setFont("helvetica", "normal").setFontSize(8);
      doc.text(`${i + 1}`, 10, y);
      doc.text(e.nom_complet.toUpperCase(), 30, y);
      doc.text(e.sexe || "-", 140, y);
      doc.text(e.$id.substring(0, 8).toUpperCase(), 165, y);
      y += 8;
    });
    doc.save(`Liste_Prof_${classe}_${section}.pdf`);
  };

  // --- LOGIQUE IMPRESSION : RECOUVREMENT ---
  const imprimerRecouvrement = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold").text("FICHE DE RECOUVREMENT - HORIZON SANTÉ 2026", 148, 15, { align: "center" });
    doc.setFontSize(10).text(`Classe: ${classe}ème ${section} | Trimestre: ${trimestre}`, 148, 22, { align: "center" });

    let y = 35;
    const cols = { n: 10, nom: 25, insc: 130, t1: 160, t2: 190, t3: 220, reste: 250 };
    doc.setFontSize(8).setFont("helvetica", "bold");
    doc.text("N°", cols.n, y); doc.text("NOM COMPLET", cols.nom, y);
    doc.text("INSCR.", cols.insc, y); doc.text("T1", cols.t1, y);
    doc.text("T2", cols.t2, y); doc.text("T3", cols.t3, y);
    doc.text("RESTE", cols.reste, y);
    doc.line(10, y+2, 285, y+2);

    y += 10;
    eleves.forEach((e, i) => {
      const payeTotal = Number(e.frais_inscription || 0) + Number(e.tranche1 || 0) + 
                        Number(e.tranche2 || 0) + Number(e.tranche3 || 0);
      const reste = CONFIG_FINANCE.totalGeneral - payeTotal;
      
      doc.setFont("helvetica", "normal").setFontSize(7);
      doc.text(`${i+1}`, cols.n, y);
      doc.text(e.nom_complet.toUpperCase(), cols.nom, y);
      doc.text(formatPrix(Number(e.frais_inscription || 0)), cols.insc, y);
      doc.text(formatPrix(Number(e.tranche1 || 0)), cols.t1, y);
      doc.text(formatPrix(Number(e.tranche2 || 0)), cols.t2, y);
      doc.text(formatPrix(Number(e.tranche3 || 0)), cols.t3, y);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatPrix(reste)}`, cols.reste, y);
      y += 7;
      if (y > 190) { doc.addPage(); y = 20; }
    });
    doc.save(`Recouvrement_${classe}_${section}_T${trimestre}.pdf`);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          {eleveSelectionne ? (
            <FicheDetaillee 
              eleve={eleveSelectionne} 
              onBack={() => setEleveSelectionne(null)} 
            />
          ) : (
            <>
              <h1 className="text-2xl font-black text-slate-800 mb-6 uppercase">Liste des Élèves</h1>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="Rechercher..." 
                      className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={recherche} onChange={(e) => setRecherche(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select value={classe} onChange={(e) => setClasse(e.target.value)} className="w-1/2 p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-600">
                      <option value="">Classes</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n.toString()}>{n}ème</option>)}
                    </select>
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="w-1/2 p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-600">
                      <option value="">Sections</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>

                  <TrimestreSelector value={trimestre} onChange={setTrimestre} />
                </div>

                <div className="flex gap-3 mt-6">
                  {['Tous', 'À jour', 'Impayés'].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setFiltreStatut(s as any)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtreStatut === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mb-4">
                <button onClick={imprimerListeProf} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all">
                  <Printer size={16} /> Liste Prof
                </button>
                <button onClick={imprimerRecouvrement} className="flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-800 transition-all">
                  <Printer size={16} /> Recouvrement
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
                {eleves.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Élève</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Classe</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eleves.map((e) => (
                        <tr key={e.$id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="p-4">
                            <p className="font-bold text-slate-700 text-sm uppercase">{e.nom_complet}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{e.$id.substring(0, 8).toUpperCase()}</p>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-600 text-sm">{e.classe}ème {e.section}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => setEleveSelectionne(e)}
                              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Aucun élève trouvé.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <MobileNav 
        current={activeView || 'eleves'} 
        setOnglet={(val) => {
          if (val === 'stats' && onClose) {
            onClose(); 
          }
        }} 
      />
    </>
  );
}