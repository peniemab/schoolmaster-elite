"use client";

import React from 'react';
import { ArrowLeft, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { CONFIG_FINANCE, formatPrix } from '@/lib/config-finance';
import jsPDF from 'jspdf';

interface FicheDetailleeProps {
  eleve: any;
  onBack: () => void;
}

export default function FicheDetaillee({ eleve, onBack }: FicheDetailleeProps) {
  // Calculs financiers
  const details = [
    { label: "Inscription", du: CONFIG_FINANCE.frais.inscription, paye: Number(eleve.frais_inscription || 0) },
    { label: "Tranche 1", du: CONFIG_FINANCE.tranches.t1, paye: Number(eleve.tranche1 || 0) },
    { label: "Tranche 2", du: CONFIG_FINANCE.tranches.t2, paye: Number(eleve.tranche2 || 0) },
    { label: "Tranche 3", du: CONFIG_FINANCE.tranches.t3, paye: Number(eleve.tranche3 || 0) },
  ];

  const totalPaye = details.reduce((acc, curr) => acc + curr.paye, 0);
  const resteGlobal = CONFIG_FINANCE.totalGeneral - totalPaye;

  // --- LOGIQUE D'IMPRESSION DU REÇU INDIVIDUEL ---
  const genererRecuPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const date = new Date().toLocaleDateString('fr-FR');

    // Design du reçu (Cadre et Entête)
    doc.setDrawColor(200);
    doc.rect(5, 5, 200, 120); // Un cadre pour faire "reçu"
    
    doc.setFont("helvetica", "bold").setFontSize(16).text("HORIZON SANTÉ 2026", 105, 15, { align: "center" });
    doc.setFontSize(10).text("REÇU DE PAIEMENT SCOLAIRE", 105, 22, { align: "center" });
    doc.setFont("helvetica", "normal").text(`Date: ${date}`, 190, 15, { align: "right" });

    // Infos Élève
    doc.setFontSize(11).setFont("helvetica", "bold").text("ÉLÈVE :", 15, 35);
    doc.setFont("helvetica", "normal").text(`${eleve.nom_complet.toUpperCase()}`, 40, 35);
    doc.text(`CLASSE : ${eleve.classe}ème ${eleve.section}`, 15, 42);
    doc.text(`ID : ${eleve.$id.toUpperCase()}`, 15, 49);

    // Tableau des paiements
    let y = 60;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont("helvetica", "bold").setFontSize(9);
    doc.text("DESIGNATION", 20, y + 5);
    doc.text("MONTANT DÛ", 100, y + 5);
    doc.text("MONTANT PAYÉ", 150, y + 5);
    
    y += 12;
    details.forEach(item => {
        doc.setFont("helvetica", "normal");
        doc.text(item.label, 20, y);
        doc.text(`${formatPrix(item.du)} ${CONFIG_FINANCE.devise}`, 100, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatPrix(item.paye)} ${CONFIG_FINANCE.devise}`, 150, y);
        doc.line(15, y+2, 195, y+2);
        y += 8;
    });

    // Total et Reste
    y += 5;
    doc.setFillColor(240, 247, 255);
    doc.rect(130, y, 65, 20, 'F');
    doc.setFontSize(10).text("TOTAL VERSÉ:", 135, y + 7);
    doc.text(`${formatPrix(totalPaye)} ${CONFIG_FINANCE.devise}`, 190, y + 7, { align: "right" });
    
    doc.setTextColor(200, 0, 0);
    doc.text("RESTE À PAYER:", 135, y + 15);
    doc.text(`${formatPrix(resteGlobal)} ${CONFIG_FINANCE.devise}`, 190, y + 15, { align: "right" });

    // Signature
    doc.setTextColor(0);
    doc.setFontSize(8).text("La Direction / Comptabilité (Cachet)", 150, y + 35);

    doc.save(`Recu_${eleve.nom_complet.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Barre de navigation interne */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-3 bg-white shadow-sm rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 group"
          >
            <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase leading-none">{eleve.nom_complet}</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">
              Classe : {eleve.classe}ème {eleve.section} | ID : {eleve.$id.substring(0,8)}
            </p>
          </div>
        </div>
        
        {resteGlobal === 0 && (
          <div className="hidden md:flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 size={14} /> Dossier en règle
          </div>
        )}
      </div>

      {/* Résumé Financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
          <p className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest">Total déjà versé</p>
          <p className="text-4xl font-black">{formatPrix(totalPaye)} <span className="text-lg font-medium">{CONFIG_FINANCE.devise}</span></p>
        </div>
        
        <div className={`p-6 rounded-[2.5rem] shadow-xl ${resteGlobal > 0 ? 'bg-white border border-red-100 shadow-red-50' : 'bg-slate-800 text-white shadow-slate-200'}`}>
          <p className={`text-[10px] font-bold uppercase mb-1 tracking-widest ${resteGlobal > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            Reste à recouvrer
          </p>
          <p className={`text-4xl font-black ${resteGlobal > 0 ? 'text-slate-800' : 'text-white'}`}>
            {formatPrix(resteGlobal)} <span className="text-lg font-medium">{CONFIG_FINANCE.devise}</span>
          </p>
        </div>
      </div>

      {/* Tableau des Tranches */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Libellé des Frais</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right tracking-widest">Montant Dû</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right tracking-widest">Versé</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-right tracking-widest">Solde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {details.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6 text-sm font-bold text-slate-700">{item.label}</td>
                <td className="p-6 text-sm text-right text-slate-400 font-medium">{formatPrix(item.du)}</td>
                <td className="p-6 text-sm text-right font-bold text-slate-800">{formatPrix(item.paye)}</td>
                <td className={`p-6 text-sm text-right font-black ${item.paye >= item.du ? 'text-green-500' : 'text-blue-600'}`}>
                  {item.paye >= item.du ? "SOLDÉ" : `-${formatPrix(item.du - item.paye)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <button 
          onClick={genererRecuPDF} 
          className="flex-1 bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          <Printer size={18} /> Imprimer Historique des paiements de l'élève
        </button>
      </div>
    </div>
  );
}