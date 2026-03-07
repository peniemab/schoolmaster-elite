"use client";

import React, { useState } from 'react';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { ID } from 'appwrite';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Création du compte
      await account.create(ID.unique(), email, password, name);
      
      // 2. Connexion immédiate après création
      await account.createEmailPasswordSession(email, password);
      
      // 3. Direction le Dashboard
      window.location.assign('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center text-white font-black uppercase tracking-widest">
          Créer un Compte Admin
        </div>
        <form onSubmit={handleRegister} className="p-8 space-y-4">
          <input 
            type="text" placeholder="Nom complet" 
            className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-blue-700 rounded-xl outline-none font-bold"
            onChange={(e) => setName(e.target.value)} required 
          />
          <input 
            type="email" placeholder="Email" 
            className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-blue-700 rounded-xl outline-none font-bold"
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Mot de passe (8 caractères min)" 
            className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-blue-700 rounded-xl outline-none font-bold"
            onChange={(e) => setPassword(e.target.value)} required 
          />
          {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
          <button className="w-full bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg uppercase text-xs">
            {loading ? 'Création...' : 'S\'inscrire et Entrer'}
          </button>
        </form>
      </div>
    </div>
  );
}