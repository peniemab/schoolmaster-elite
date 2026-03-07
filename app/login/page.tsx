"use client";

import React, { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Vérification au chargement : si déjà connecté, on dégage vers le dashboard
  useEffect(() => {
    account.get()
      .then(() => router.push('/dashboard'))
      .catch(() => console.log("Prêt pour la connexion"));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await account.createEmailPasswordSession(email, password);
      window.location.href = '/dashboard'; // Utilisation de window pour forcer le rafraîchissement
    } catch (err: any) {
      if (err.code === 401 && err.message.includes("prohibited")) {
        // Cas où la session existe déjà mais le cookie était mal lu
        window.location.href = '/dashboard';
      } else {
        setError("Email ou mot de passe incorrect.");
        console.error("Erreur login:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Horizon Santé 2026</h1>
          <p className="text-blue-400 text-[10px] font-bold uppercase mt-1">Administration</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecole.com"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-700 rounded-xl outline-none font-bold transition-all text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-700 rounded-xl outline-none font-bold transition-all text-slate-900"
              required
            />
          </div>

          {error && <p className="text-red-600 text-[10px] font-black text-center uppercase">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase text-xs"
          >
            {loading ? 'Vérification...' : 'Se Connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}