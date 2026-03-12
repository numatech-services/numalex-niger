"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SuperadminCreateCabinetForm } from "./SuperadminCreateCabinetForm";

export function AddCabinetModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        <Plus size={20} />
        Inscrire un cabinet
      </button>

      {/* Overlay & Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header du Modal */}
            <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Nouveau Cabinet</h2>
                <p className="text-sm text-slate-500 font-medium">Remplissez les informations du partenaire</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Corps du Modal (Ton formulaire) */}
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <SuperadminCreateCabinetForm onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}