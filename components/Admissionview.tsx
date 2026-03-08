"use client";

import React, { useState } from 'react';
import MobileNav from '@/components/Mobilenav';
import { determinerSection } from '@/lib/admission';
import jsPDF from 'jspdf';
import { Query } from 'appwrite';
import { databases, ID } from '@/lib/appwrite';

interface AdmissionViewProps {
  onSuccess?: () => void;
  onClose?: () => void; // Ajouté pour corriger l'erreur de référence
}

export default function AdmissionView({ onSuccess, onClose }: AdmissionViewProps) {
  const anneeScolaire = "2025 - 2026";
  
  const [formData, setFormData] = useState({
    nomComplet: '', dateNaissance: '', sexe: '', ecoleProvenance: '',
    classe: '', tuteurNom: '', tuteurProfession: '',
    tuteurTel: '+243', tutriceNom: '', tutriceProfession: '',
    tutriceTel: '+243', adresse: '', statut_paiement: 'En attente'
  });

  const [sectionAttribution, setSectionAttribution] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);
  const [jetonGenere, setJetonGenere] = useState<string | null>(null);

  // --- LOGIQUE : GÉNÉRATION AUTO DU PDF (Format identique à la caisse) ---
  const genererJetonPDF = (documentId: string, data: any, section: string | null) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 150] });
    const centre = 40;
    const codeHuit = documentId.substring(0, 8).toUpperCase();
    
    // Header
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text("HORIZON SANTÉ 2026", centre, 10, { align: "center" });
    doc.setFontSize(8).text("JETON D'ADMISSION OFFICIEL", centre, 15, { align: "center" });
    doc.line(5, 18, 75, 18);
    
    // Infos Élève
    doc.setFontSize(7).setFont("helvetica", "bold");
    doc.text(`ÉLÈVE : ${data.nomComplet.toUpperCase()}`, 5, 25);
    doc.setFont("helvetica", "normal");
    doc.text(`CLASSE : ${data.classe}ème ${section || ''}`, 5, 30);
    doc.text(`DATE : ${new Date().toLocaleString('fr-FR')}`, 5, 35);
    doc.line(5, 40, 75, 40);

    // Le Jeton (Bien visible)
    doc.setFont("helvetica", "bold").setFontSize(9);
    doc.text("VOTRE CODE DE RÉFÉRENCE :", centre, 50, { align: "center" });
    
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 55, 60, 15, 'F');
    doc.setFontSize(16);
    doc.text(codeHuit, centre, 65, { align: "center" });

    // Footer instructions
    doc.setFontSize(6).setFont("helvetica", "italic");
    doc.text("Présentez ce code au guichet pour", centre, 80, { align: "center" });
    doc.text("finaliser l'inscription et le paiement.", centre, 83, { align: "center" });
    
    doc.line(5, 90, 75, 90);
    doc.setFontSize(5).text("Généré par SchoolMaster Elite", centre, 95, { align: "center" });

    // Téléchargement automatique
    doc.save(`Jeton_${data.nomComplet.replace(/\s+/g, '_')}.pdf`);
  };

  const handleAdmissionAutomatique = async (classeId: string) => {
    setFormData({ ...formData, classe: classeId });
    if (!classeId) { setSectionAttribution(null); return; }
    try {
      const resultats = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        [Query.equal('classe', classeId)]
      );
      const effectifA = resultats.documents.filter(doc => doc.section === 'A').length;
      const effectifB = resultats.documents.filter(doc => doc.section === 'B').length;
      const sectionChoisie = determinerSection({ nom: `${classeId}ème`, effectifA, effectifB });
      setSectionAttribution(sectionChoisie);
    } catch (error) {
      setSectionAttribution(Math.random() < 0.5 ? 'A' : 'B');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const documentId = ID.unique();
    const payload = {
      nom_complet: formData.nomComplet,
      date_naissance: formData.dateNaissance,
      sexe: formData.sexe,
      ecole_provenance: formData.ecoleProvenance,
      classe: formData.classe,
      section: sectionAttribution,
      tuteur_nom: formData.tuteurNom,
      tuteur_tel: formData.tuteurTel,
      tuteur_profession: formData.tuteurProfession,
      tutrice_nom: formData.tutriceNom,
      tutrice_tel: formData.tutriceTel,
      tutrice_profession: formData.tutriceProfession,
      adresse_domicile: formData.adresse,
      statut_paiement: "En attente" 
    };

    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        documentId,
        payload
      );

      // --- DÉCLENCHEMENT DU TÉLÉCHARGEMENT AUTO ---
      genererJetonPDF(documentId, formData, sectionAttribution);

      setJetonGenere(documentId);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      alert("Erreur Appwrite : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen p-4 md:p-10">
      

      <form onSubmit={handleSubmit} className="space-y-10 pb-24 md:pb-10">
        {/* SECTION IDENTITÉ */}
        <section className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
          <h2 className="text-slate-800 font-black mb-6 border-l-4 border-blue-600 pl-3 text-xs uppercase tracking-widest">
            1. Informations de l'élève
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nom complet de l'élève</label>
              <input required type="text" placeholder="EX: KASSONGO LUKUSA JEAN" value={formData.nomComplet} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 uppercase font-semibold text-slate-700 transition-all" />
            </div>
            
            <div className="w-full">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Date de Naissance</label>
              <input required type="date" value={formData.dateNaissance} onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Sexe</label>
              <select required value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium">
                <option value="">Choisir...</option>
                <option value="M">Masculin (M)</option>
                <option value="F">Féminin (F)</option>
              </select>
            </div>

            <div className="w-full sm:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Classe sollicitée</label>
              <select required value={formData.classe} onChange={(e) => handleAdmissionAutomatique(e.target.value)} className="w-full p-4 bg-white border-2 border-blue-600 rounded-2xl outline-none font-black text-blue-600 focus:ring-2 focus:ring-blue-200">
                <option value="">Sélectionner la classe</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}ème Année</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">École de provenance</label>
              <input required type="text" placeholder="Nom de l'ancienne école" value={formData.ecoleProvenance} onChange={(e) => setFormData({...formData, ecoleProvenance: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 uppercase text-slate-700" />
            </div>
          </div>
        </section>

        {/* SECTION RESPONSABLES */}
<section className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
  <h2 className="text-slate-800 font-black mb-6 border-l-4 border-blue-600 pl-3 text-xs uppercase tracking-widest">
    2. Responsables & Adresse
  </h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {/* BLOC TUTEUR (PAPA) */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Nom du Tuteur</label>
      <input required placeholder="NOM & PRÉNOM" value={formData.tuteurNom} onChange={(e) => setFormData({...formData, tuteurNom: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs uppercase outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Profession Tuteur</label>
      <input required placeholder="EX: AGENT DE L'ÉTAT" value={formData.tuteurProfession} onChange={(e) => setFormData({...formData, tuteurProfession: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Téléphone Tuteur</label>
      <input required placeholder="+243..." value={formData.tuteurTel} onChange={(e) => setFormData({...formData, tuteurTel: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    {/* BLOC TUTRICE (MAMAN) */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Nom de la Tutrice</label>
      <input required placeholder="NOM & PRÉNOM" value={formData.tutriceNom} onChange={(e) => setFormData({...formData, tutriceNom: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs uppercase outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Profession Tutrice</label>
      <input required placeholder="EX: COMMERÇANTE" value={formData.tutriceProfession} onChange={(e) => setFormData({...formData, tutriceProfession: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Téléphone Tutrice</label>
      <input required placeholder="+243..." value={formData.tutriceTel} onChange={(e) => setFormData({...formData, tutriceTel: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    {/* ADRESSE (PREND TOUTE LA LARGEUR SUR PC) */}
    <div className="sm:col-span-2 lg:col-span-3 mt-2">
      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Adresse Domiciliaire Complète</label>
      <textarea required placeholder="Commune, Quartier, Avenue et N°" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} rows={2} className="w-full p-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  </div>
</section>

        {/* SECTION ATTRIBUTION ET VALIDATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {sectionAttribution ? (
            <div className="bg-blue-600 p-5 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-100">
              <div>
                <p className="text-blue-100 font-bold uppercase text-[9px]">Section Attribuée</p>
                <p className="text-white text-xs font-medium opacity-80">Basé sur les effectifs réels</p>
              </div>
              <span className="text-4xl font-black text-white px-6 border-l border-blue-400/30">{sectionAttribution}</span>
            </div>
          ) : (
            <div className="hidden lg:block text-slate-400 italic text-xs">
              * La section sera attribuée automatiquement après le choix de la classe.
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-700 text-white font-black p-5 rounded-3xl uppercase text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </span>
            ) : "Valider l'inscription"}
          </button>
        </div>
      </form>
    </div>
         <MobileNav 
  current={'admissions'} 
  
  setOnglet={(val) => {
    if (val === 'stats' && onClose) {
      onClose(); 
    }
  }} 
/>
    </>
  );
}