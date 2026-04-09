'use client';

import { useState } from 'react';
import { UserPlus, X, ShieldCheck, Info } from 'lucide-react';
import { createProfessionalUser } from '@/lib/actions/admin';

export function AddUserModal({ cabinets }: { cabinets: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createProfessionalUser(formData);
    
    setLoading(false);
    
    if (result?.success) {
      setIsOpen(false);
      // On pourrait utiliser un toast ici pour plus d'élégance
      alert("Accès professionnel créé avec succès !");
    } else {
      alert(result?.error || "Une erreur est survenue lors de la création.");
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
      >
        <UserPlus size={20} />
        Nouveau Professionnel
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Ajouter un Membre</h2>
            <p className="text-xs text-slate-500 font-medium font-serif italic">Enregistrement d'un nouvel officier de droit.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            
            {/* Nom Complet */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Nom Complet</label>
              <input 
                name="full_name" 
                required 
                type="text" 
                placeholder="Ex: Me. Abdoulaye Mamane" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300" 
              />
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Email Pro</label>
                    <input name="email" required type="email" placeholder="contact@cabinet.ne" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Téléphone</label>
                    <input name="phone" type="tel" placeholder="+227 00 00 00 00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" />
                </div>
            </div>

            {/* Cabinet (Détermine le rôle auto) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Assigner un Cabinet</label>
              <select 
                name="cabinet_id" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 appearance-none cursor-pointer"
              >
                <option value="">Sélectionner une structure...</option>
                {cabinets.map(cab => (
                  <option key={cab.id} value={cab.id}>{cab.name}</option>
                ))}
              </select>
              <p className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-500 font-bold italic">
                <Info size={12} />
                Le rôle (Avocat/Notaire) sera défini par le cabinet choisi.
              </p>
            </div>

            {/* Mot de passe provisoire */}
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Mot de passe provisoire</label>
                <input name="password" required type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" />
            </div>
          </div>

          {/* Bouton de validation */}
          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Valider l'Accès Professionnel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}