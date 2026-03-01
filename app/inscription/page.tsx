// app/inscription/page.tsx
"use client";

import React, { useState } from 'react';
import { determinerSection } from '@/lib/admission';
import { Classe } from '@/types';

export default function InscriptionPage() {
  const anneeScolaire = "2025 - 2026"; // Dynamique selon ton projet
  const [sectionAttribution, setSectionAttribution] = useState<'A' | 'B' | null>(null);

  // Simulation pour l'algo A/B
  const simulationClasses: Record<string, Classe> = {
    "1": { nom: "1ère", effectifA: 10, effectifB: 12 },
    "2": { nom: "2ème", effectifA: 15, effectifB: 15 },
  };

  const handleAdmissionAutomatique = (classeId: string) => {
    if (simulationClasses[classeId]) {
      const section = determinerSection(simulationClasses[classeId]);
      setSectionAttribution(section);
    }
  };

  return (
    <div className="min-h-screen bg-school-slate p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-school-navy p-8 rounded-t-2xl text-white flex justify-between items-center border-b-4 border-school-emerald">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Formulaire D'inscription</h1>
            <p className="text-blue-200 text-sm">Année Scolaire : {anneeScolaire}</p>
          </div>
          <div className="hidden md:block text-right">
             <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-school-emerald font-mono">SchoolMaster Elite v1.0</span>
          </div>
        </div>

        <form className="bg-white shadow-2xl rounded-b-2xl p-6 md:p-10 space-y-10">
          
          {/* SECTION 1 : ÉLÈVE */}
          <section>
            <h2 className="text-school-navy font-bold flex items-center gap-2 mb-6 border-l-4 border-school-emerald pl-3 italic">
              Informations Générales de l'Elève Candidat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom, Post nom & Prénom de l'élève *</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-emerald outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date de Naissance *</label>
                <input required type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-emerald outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Sexe *</label>
                <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-emerald outline-none">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom de l'école de provenance *</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-emerald outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Classe d'inscription *</label>
                <select 
                  required 
                  onChange={(e) => handleAdmissionAutomatique(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-2 border-school-navy rounded-lg focus:ring-2 focus:ring-school-emerald outline-none"
                >
                  <option value="">Sélectionner la classe</option>
                  <option value="1">1ère Année</option>
                  <option value="2">2ème Année</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Adresse e-mail de l'élève (Optionnel)</label>
                <input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-emerald outline-none" />
              </div>
            </div>
          </section>

          {/* SECTION 2 : TUTEURS */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-school-navy font-bold flex items-center gap-2 mb-6 border-l-4 border-school-emerald pl-3 italic">
              Informations des Responsables (Tuteurs)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom & Prénom du Tuteur *</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Profession *</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Téléphone Tuteur *</label>
                <input required type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 text-gray-400">
                <label className="block text-sm font-semibold mb-2">Nom & Prénom de la Tutrice</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div className="text-gray-400">
                <label className="block text-sm font-semibold mb-2">Profession</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div className="text-gray-400">
                <label className="block text-sm font-semibold mb-2">Téléphone Tutrice</label>
                <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Adresse domicile *</label>
              <textarea required rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-school-emerald" />
            </div>
          </section>

          {/* Attribution Section Automatique (Visuel) */}
          {sectionAttribution && (
            <div className="bg-school-emerald/10 border-2 border-school-emerald p-4 rounded-xl flex items-center justify-between">
              <span className="text-school-navy font-bold uppercase text-sm tracking-widest">Section Attribuée par l'algorithme :</span>
              <span className="text-4xl font-black text-school-emerald">Section {sectionAttribution}</span>
            </div>
          )}

          <button type="submit" className="w-full bg-school-navy text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl">
            Enregistrer l'inscription
          </button>
        </form>
      </div>
    </div>
  );
}