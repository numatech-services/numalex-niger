"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, Trash2, Save, Edit3 } from "lucide-react";
import { VerifyCabinetForm } from "./VerifyCabinetForm";
import { AssignPlanForm } from "./AssignPlanForm";

export function CabinetCard({ cabinet, plans }: { cabinet: any, plans: any[] }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: cabinet.name, 
    profession: cabinet.profession 
  });
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from("cabinets")
      .update({
        name: formData.name,
        profession: formData.profession,
        updated_at: new Date().toISOString()
      })
      .eq("id", cabinet.id);

    if (!error) {
      setIsEditOpen(false);
      router.refresh();
    } else {
      alert("Erreur lors de la modification : " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm(`⚠️ Supprimer définitivement le cabinet ${cabinet.name} ? Cette action est irréversible.`)) {
      setLoading(true);
      const { error } = await supabase.from("cabinets").delete().eq("id", cabinet.id);
      if (!error) router.refresh();
      setLoading(false);
    }
  };

  return (
    <>
      {/* CARTE VISIBLE DANS LA LISTE */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start mb-6">
          <div 
            onClick={() => setIsEditOpen(true)} 
            className="cursor-pointer group flex items-center gap-2"
          >
            <div>
              <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tighter">
                {cabinet.name}
              </h3>
              <p className="text-[10px] font-bold text-blue-500 uppercase">{cabinet.profession}</p>
            </div>
            <Edit3 size={14} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
            cabinet.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100'
          }`}>
            {cabinet.is_verified ? "Vérifié" : "En attente"}
          </span>
        </div>
        
        {/* Ton composant de décision de statut */}
        <div className="space-y-6">
           <VerifyCabinetForm cabinetId={cabinet.id} currentNotes={cabinet.verification_notes} />
           
           <div className="pt-4 border-t border-slate-50">
             <AssignPlanForm
               cabinetId={cabinet.id}
               plans={plans?.map((p) => ({ id: p.id, name: p.name })) || []}
             />
           </div>
        </div>
      </div>

      {/* MODAL DE MODIFICATION / SUPPRESSION */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 italic">Modifier les infos</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom commercial</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corps de métier</label>
                <select 
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 appearance-none"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                >
                  <option value="avocat">Avocat</option>
                  <option value="notaire">Notaire</option>
                  <option value="commissaire_justice">Commissaire de Justice</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                >
                  <Save size={16} /> {loading ? "Mise à jour..." : "Enregistrer"}
                </button>
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all group"
                  title="Supprimer le cabinet"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}