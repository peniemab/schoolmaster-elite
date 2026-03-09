"use client";

import React from 'react';
import { LayoutDashboard, UserPlus, CreditCard, Clock, List } from 'lucide-react';
import { OngletType } from '@/app/dashboard/page'; 

interface MobileNavProps {
  setOnglet: (val: OngletType) => void; 
  current: OngletType; 
}


export default function MobileNav({ setOnglet, current }: MobileNavProps) {
  
  const getStyle = (id: string) => current === id ? "text-blue-600" : "text-slate-400";

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 flex lg:hidden items-center justify-around px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">      

      {/* Admission */}
      <button 
        onClick={() => setOnglet('admissions')}
        className={`flex flex-col items-center gap-1 transition-colors ${getStyle('admissions')}`}
      >
        <UserPlus size={20} />
        <span className="text-[10px] font-bold uppercase">Admission</span>
      </button>

      {/* Paiements */}
      <button 
        onClick={() => setOnglet('paiements')}
        className={`flex flex-col items-center gap-1 transition-colors ${getStyle('paiements')}`}
      >
        <CreditCard size={20} />
        <span className="text-[10px] font-bold uppercase">Paiements</span>
      </button>

      {/* Dashboard */}
      <button 
        onClick={() => setOnglet('stats')}
        className={`flex flex-col items-center gap-1 transition-colors ${getStyle('stats')}`}
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-black uppercase">Dashboard</span>
      </button>

      {/* Impayés */}
      <button 
        onClick={() => setOnglet('impayes')}
        className={`flex flex-col items-center gap-1 transition-colors ${getStyle('impayes')}`}
      >
        <Clock size={20} />
        <span className="text-[10px] font-bold uppercase">Impayés</span>
      </button>

      {/* Élèves */}
      <button 
        onClick={() => setOnglet('eleves')}
        className={`flex flex-col items-center gap-1 transition-colors ${getStyle('eleves')}`}
      >
        <List size={20} />
        <span className="text-[10px] font-bold uppercase">Élèves</span>
      </button>
      
    </div>
  );
}