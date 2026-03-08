import React from 'react';
import { Clock } from 'lucide-react';

interface TrimestreSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

export default function TrimestreSelector({ value, onChange }: TrimestreSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto">
      <Clock size={16} className="text-slate-400 ml-2" />
      <select 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent outline-none text-xs font-bold text-slate-600 cursor-pointer pr-4 uppercase tracking-wider"
      >
        <option value={0}>Inscription Uniquement</option>
        <option value={1}>Objectif Trimestre 1</option>
        <option value={2}>Objectif Trimestre 2</option>
        <option value={3}>Objectif Trimestre 3</option>
        <option value={4}>Vue Globale (Année complète)</option>
      </select>
    </div>
  );
}