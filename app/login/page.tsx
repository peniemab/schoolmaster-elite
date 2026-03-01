// app/login/page.tsx
"use client";

import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-school-slate flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header du Login */}
        <div className="bg-school-navy p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            SchoolMaster <span className="text-school-emerald">Elite</span>
          </h1>
          <p className="text-blue-200 mt-2 text-sm uppercase tracking-widest">
            Portail d'Administration
          </p>
        </div>

        {/* Formulaire */}
        <form className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-school-navy mb-2">
              Adresse Email
            </label>
            <input 
              type="email" 
              placeholder="admin@ecole.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-school-emerald focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-school-navy mb-2">
              Mot de passe
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-100 focus:ring-2 focus:ring-school-emerald focus:border-transparent outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-school-navy hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-emerald-900/20 transition-all transform active:scale-[0.98]"
          >
            Se Connecter
          </button>

          <div className="text-center">
            <a href="#" className="text-xs text-gray-400 hover:text-school-emerald transition-colors">
              Mot de passe oublié ? Contactez l'administrateur système.
            </a>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
            Propulsé par Horizon Santé 2026 Technologies
          </p>
        </div>
      </div>
    </div>
  );
}