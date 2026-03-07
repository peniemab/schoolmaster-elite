"use client";
import { X, ArrowLeft } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-300">
      {/* Header fixe en haut */}
      <div className="h-16 border-b border-slate-100 flex justify-between items-center px-6 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
        </div>
        <div className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">
          Horizon Santé 2026
        </div>
      </div>

      {/* Contenu qui prend tout le reste de la place */}
      <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 md:p-8 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}