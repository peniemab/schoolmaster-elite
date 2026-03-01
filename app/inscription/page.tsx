// app/inscription/page.tsx
"use client";

import React, { useState } from 'react';
import { determinerSection } from '@/lib/admission';
import { jsPDF } from "jspdf";
import { Classe } from '@/types';
import { databases, ID } from '@/lib/appwrite';

export default function InscriptionPage() {
  const anneeScolaire = "2025 - 2026";
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    nomComplet: '',
    dateNaissance: '',
    sexe: '',
    ecoleProvenance: '',
    classe: '',
    email: '',
    tuteurNom: '',
    tuteurProfession: '',
    tuteurTel: '',
    tutriceNom: '',
    tutriceProfession: '',
    tutriceTel: '',
    adresse: ''
  });

  const [sectionAttribution, setSectionAttribution] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);
  const [jetonGenere, setJetonGenere] = useState<string | null>(null);
const imprimerJeton = () => {
  window.print(); 
};
const genererPDFJeton = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 100] // Format petit coupon (80mm x 100mm)
  });

  // Design du reçu
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SCHOOLMASTER ELITE", 40, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("JETON D'INSCRIPTION", 40, 25, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(10, 30, 70, 30); // Ligne de séparation

  doc.setFontSize(22);
  doc.setFont("courier", "bold");
  // On affiche le jeton en gros
  doc.text(jetonGenere?.toUpperCase().substring(0, 8) || "", 40, 50, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Candidat: ${formData.nomComplet}`, 10, 65);
  doc.text(`Classe: ${formData.classe} - Section ${sectionAttribution}`, 10, 72);
  doc.text(`Date: ${new Date().toLocaleString()}`, 10, 85);

  doc.setFontSize(7);
  doc.text("Horizon Santé 2026 Tech", 40, 95, { align: "center" });

  // Télécharge le fichier directement
  doc.save(`Jeton_${formData.nomComplet.replace(/\s+/g, '_')}.pdf`);
};

  const simulationClasses: Record<string, Classe> = {
    "1": { nom: "1ère", effectifA: 10, effectifB: 12 },
    "2": { nom: "2ème", effectifA: 15, effectifB: 15 },
  };

  const handleAdmissionAutomatique = (classeId: string) => {
    setFormData({ ...formData, classe: classeId });
    if (simulationClasses[classeId]) {
      const section = determinerSection(simulationClasses[classeId]);
      setSectionAttribution(section);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentId = ID.unique();
      
      const payload = {
        nom_complet: formData.nomComplet,
        date_naissance: formData.dateNaissance,
        sexe: formData.sexe,
        ecole_provenance: formData.ecoleProvenance,
        classe: formData.classe,
        section: sectionAttribution,
        email_eleve: formData.email,
        tuteur_nom: formData.tuteurNom,
        tuteur_tel: formData.tuteurTel,
        adresse_domicile: formData.adresse,
        
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLECTION_ID!,
        documentId,
        payload
      );

      setJetonGenere(documentId); // On stocke l'ID pour l'afficher
      
      // Reset du formulaire
      setFormData({
        nomComplet: '', dateNaissance: '', sexe: '', ecoleProvenance: '',
        classe: '', email: '', tuteurNom: '', tuteurProfession: '',
        tuteurTel: '', tutriceNom: '', tutriceProfession: '',
        tutriceTel: '', adresse: ''
      });
      setSectionAttribution(null);

    } catch (error) {
      console.error("Erreur Appwrite:", error);
      alert("Erreur lors de l'enregistrement. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-school-slate p-4 md:p-10 relative">
      
      {/* MODAL DE SUCCÈS (Le Jeton) */}
      {/* MODAL DE SUCCÈS (Le Jeton Imprimable) */}
{jetonGenere && (
  <div className="fixed inset-0 bg-school-navy/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
    <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border-2 border-gray-100 print:shadow-none print:border-none">
      
      {/* Contenu Imprimable */}
      <div id="section-a-imprimer">
        <div className="mb-4 text-school-navy font-bold text-xl uppercase tracking-tighter">
          SchoolMaster <span className="text-school-emerald">Elite</span>
        </div>
        <div className="w-16 h-16 bg-school-emerald/10 text-school-emerald rounded-full flex items-center justify-center mx-auto mb-4 text-3xl print:hidden">✓</div>
        
        <h2 className="text-2xl font-bold text-school-navy mb-2">Jeton d'Inscription</h2>
        <p className="text-gray-500 text-xs mb-4">Présentez ce code à la caisse pour régulariser votre situation.</p>
        
        <div className="bg-gray-100 p-6 rounded-xl font-mono text-3xl font-black text-school-navy border-2 border-dashed border-gray-400 mb-4 print:bg-white">
          {jetonGenere.toUpperCase().substring(0, 8)}
        </div>
        
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
          Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Boutons d'Action - Cachés à l'impression */}
      <div className="space-y-3 print:hidden">
        <button 
          onClick={imprimerJeton}
          className="w-full bg-school-emerald text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <span>🖨️ Imprimer le Jeton</span>
        </button>
        
        <button 
          onClick={() => setJetonGenere(null)}
          className="w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Fermer & Nouveau
        </button>
      </div>
    </div>
  </div>
)}

      <div className="max-w-5xl mx-auto">
        <div className="bg-school-navy p-8 rounded-t-2xl text-white flex justify-between items-center border-b-4 border-school-emerald">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Formulaire D'inscription</h1>
            <p className="text-blue-200 text-sm">Année Scolaire : {anneeScolaire}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-b-2xl p-6 md:p-10 space-y-10">
          <section>
            <h2 className="text-school-navy font-bold mb-6 border-l-4 border-school-emerald pl-3 italic">
              Informations Générales de l'Elève Candidat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Nom, Post nom & Prénom de l'élève *</label>
                <input required type="text" value={formData.nomComplet} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-school-emerald" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Date de Naissance *</label>
                <input required type="date" value={formData.dateNaissance} onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sexe *</label>
                <select required value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-lg outline-none">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nom de l'école de provenance *</label>
                <input required type="text" value={formData.ecoleProvenance} onChange={(e) => setFormData({...formData, ecoleProvenance: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Classe d'inscription *</label>
                <select required value={formData.classe} onChange={(e) => handleAdmissionAutomatique(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-school-navy rounded-lg outline-none">
                  <option value="">Sélectionner la classe</option>
                  <option value="1">1ère Année</option>
                  <option value="2">2ème Année</option>
                </select>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-school-navy font-bold mb-6 border-l-4 border-school-emerald pl-3 italic">
              Informations des Responsables (Tuteurs)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input required placeholder="Nom & Prénom du Tuteur *" value={formData.tuteurNom} onChange={(e) => setFormData({...formData, tuteurNom: e.target.value})} className="p-3 bg-gray-50 border rounded-lg outline-none" />
              <input required placeholder="Profession *" value={formData.tuteurProfession} onChange={(e) => setFormData({...formData, tuteurProfession: e.target.value})} className="p-3 bg-gray-50 border rounded-lg outline-none" />
              <input required placeholder="Téléphone Tuteur *" value={formData.tuteurTel} onChange={(e) => setFormData({...formData, tuteurTel: e.target.value})} className="p-3 bg-gray-50 border rounded-lg outline-none" />
            </div>
            <textarea required placeholder="Adresse domicile *" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} rows={2} className="w-full p-3 bg-gray-50 border rounded-lg outline-none" />
          </section>

          {sectionAttribution && (
            <div className="bg-school-emerald/10 border-2 border-school-emerald p-4 rounded-xl flex items-center justify-between animate-pulse">
              <span className="text-school-navy font-bold uppercase text-sm">Section Attribuée :</span>
              <span className="text-4xl font-black text-school-emerald">{sectionAttribution}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-school-navy'} text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest shadow-xl`}
          >
            {loading ? 'Enregistrement...' : "Enregistrer l'inscription"}
          </button>
        </form>
      </div>
    </div>
  );
}