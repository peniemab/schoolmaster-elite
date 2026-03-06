"use client";

import React, { useState } from 'react';
import { determinerSection } from '@/lib/admission';
import { jsPDF } from "jspdf";
import { Query } from 'appwrite';
import { Classe } from '@/types';
import { databases, ID } from '@/lib/appwrite';

export default function InscriptionPage() {
  const anneeScolaire = "2025 - 2026";
  
   const [formData, setFormData] = useState({
    nomComplet: '',
    dateNaissance: '',
    sexe: '',
    ecoleProvenance: '',
    classe: '',
    tuteurNom: '',
    tuteurProfession: '',
    tuteurTel: '+243',
    tutriceNom: '',
    tutriceProfession: '',
    tutriceTel: '+243',
    adresse: '',
    statut_paiement: 'En attente'

  });

  const [sectionAttribution, setSectionAttribution] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);
  const [jetonGenere, setJetonGenere] = useState<string | null>(null);

  const imprimerJeton = () => { window.print(); };

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

  try {
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

    console.log("Tentative de création avec :", payload);

    await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_COLLECTION_ID!,
      documentId,
      payload
    );

    setJetonGenere(documentId);
    
    setFormData({
      nomComplet: '', dateNaissance: '', sexe: '', ecoleProvenance: '',
      classe: '', tuteurNom: '', tuteurProfession: '',
      tuteurTel: '+243', tutriceNom: '', tutriceProfession: '',
      tutriceTel: '+243', adresse: '', statut_paiement: "En attente"
    });
    setSectionAttribution(null);

  } catch (error: any) {
    console.error("Erreur détaillée Appwrite :", error.response);
    alert(`Erreur d'enregistrement : ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen p-4 md:p-10">
      
      {/* MODAL DE SUCCÈS (Jeton) */}
      {jetonGenere && (
        <div className="fixed inset-0 bg-brand-navy/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl print:shadow-none">
            <div className="mb-4 text-brand-navy font-black text-xl uppercase">
              SchoolMaster <span className="text-brand-green">Elite</span>
            </div>
            <h2 className="text-xl font-black text-brand-navy mb-2">Jeton d'Inscription</h2>
            <div className="bg-gray-100 p-6 rounded-xl font-mono text-3xl font-black text-brand-navy border-2 border-dashed border-brand-slate/30 mb-4 print:bg-white">
              {jetonGenere.toUpperCase().substring(0, 8)}
            </div>
            <div className="text-[10px] text-brand-slate uppercase mb-6">
              Généré le {new Date().toLocaleDateString()}
            </div>
            <div className="space-y-3 print:hidden">
              <button onClick={imprimerJeton} className="w-full bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest">
                Imprimer
              </button>
              <button onClick={() => setJetonGenere(null)} className="w-full border-2 bg-red-700 border-gray-500 text-brand-slate py-3 rounded-xl font-black uppercase text-xs tracking-widest">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header simple */}
        <div className="bg-brand-navy px-3 rounded-t-2xl text-white">
          <h1 className="text-lg font-black uppercase tracking-tight">FORMULAIRE D'INSCRIPTION</h1>
          <p className="text-brand-green font-bold text-xs uppercase p-1">Annee Scolaire {anneeScolaire}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-b-2xl p-6 md:p-10 space-y-10 border-x border-b border-gray-100">
          <section>
            <h2 className="text-brand-navy font-black mb-6 border-l-4 border-brand-green pl-3 italic text-xs uppercase">
              Identité de l'élève
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-brand-slate uppercase mb-1">Nom complet</label>
                <input required type="text" value={formData.nomComplet} onChange={(e) => setFormData({...formData, nomComplet: e.target.value})} className="w-full p-3 bg-gray-50 uppercase border border-gray-500 rounded-lg outline-none focus:border-brand-green" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate uppercase mb-1">Date de naissance</label>
                <input required type="date" value={formData.dateNaissance} onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none focus:border-brand-green" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate uppercase mb-1">Sexe</label>
                <select required value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none focus:border-brand-green">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate uppercase mb-1">Classe</label>
                <select required value={formData.classe} onChange={(e) => handleAdmissionAutomatique(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-brand-navy rounded-lg outline-none">
                  <option value="">Choisir la classe</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}è Année</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-slate uppercase mb-1">École de provenance</label>
                <input required type="text" value={formData.ecoleProvenance} onChange={(e) => setFormData({...formData, ecoleProvenance: e.target.value})} className="w-full uppercase p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none focus:border-brand-green" />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-brand-navy font-black mb-6 border-l-4 border-brand-green pl-3 italic text-xs uppercase">
              Responsables & Adresse
            </h2>
            <div className="grid grid-cols-1 font-black md:grid-cols-3 gap-4 mb-6">
              <input required placeholder="Nom & Prénom du Tuteur" value={formData.tuteurNom} onChange={(e) => setFormData({...formData, tuteurNom: e.target.value})} className="p-3 uppercase bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />
              <input required placeholder="Profession du Tuteur" value={formData.tuteurProfession} onChange={(e) => setFormData({...formData, tuteurProfession: e.target.value})} className="p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />
              <input required placeholder="Téléphone Tuteur" value={formData.tuteurTel} onChange={(e) => {
    const value = e.target.value;
    if (!value.startsWith('+243')) {
      setFormData({...formData, tuteurTel: '+243'});
    } else {
      setFormData({...formData, tuteurTel: value});
    }
  }}  className="p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />
                <input required placeholder="Nom & Prénom du Tutrice" value={formData.tutriceNom} onChange={(e) => setFormData({...formData, tutriceNom: e.target.value})} className="p-3 uppercase bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />

              <input required placeholder="Profession du tutrice" value={formData.tutriceProfession} onChange={(e) => setFormData({...formData, tutriceProfession: e.target.value})} className="p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />

              <input required placeholder="Téléphone Tutrice" value={formData.tutriceTel} onChange={(e) => {
    const value = e.target.value;
    if (!value.startsWith('+243')) {
      setFormData({...formData, tutriceTel: '+243'});
    } else {
      setFormData({...formData, tutriceTel: value});
    }
  }} className="p-3 bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />
            </div>
            <textarea required placeholder="Adresse complète (Commune, Quartier, Avenue, N°)" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} rows={2} className="w-full p-4 bg-gray-50 border border-gray-500 rounded-lg outline-none text-xs focus:border-brand-green" />
          </section>

          {sectionAttribution && (
            <div className="bg-brand-green/10 border-2 p-2 rounded-xl flex items-center justify-between">
              <span className="text-brand-navy font-black uppercase text-xs">Section attribuée :</span>
              <span className="text-xl font-black text-brand-green">{sectionAttribution}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'opacity-70' : ''} bg-blue-700 text-white font-black p-4 text-xs rounded-xl uppercase tracking-widest shadow-lg transition-transform active:scale-95`}
          >
            {loading ? 'Enregistrement en cours...' : "Enregistrer l'inscription"}
          </button>
        </form>
      </div>
    </div>
  );
}