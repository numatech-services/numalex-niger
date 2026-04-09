'use client';
import { User, Briefcase, Gavel, Scale, Mail, Phone, Trash2, Edit3 } from "lucide-react";
import { deleteProfessionalUser } from "@/lib/actions/admin";

interface UserCardProps {
  profile: any;
}

export function UserCard({ profile }: UserCardProps) {
  // Configuration des rôles (Spécifique au contexte juridique du Niger)
  const roleConfig = {
    avocat: {
      label: "Avocat",
      color: "bg-blue-50 text-blue-700 border-blue-100",
      icon: <Scale size={14} />,
    },
    huissier: {
      label: "Huissier",
      color: "bg-purple-50 text-purple-700 border-purple-100",
      icon: <Gavel size={14} />,
    },
    notaire: {
      label: "Notaire",
      color: "bg-orange-50 text-orange-700 border-orange-100",
      icon: <Briefcase size={14} />,
    },
    superadmin: {
      label: "Super Admin",
      color: "bg-slate-900 text-white border-slate-900",
      icon: <User size={14} />,
    }
  };

  const config = roleConfig[profile.role as keyof typeof roleConfig] || roleConfig.avocat;

  const handleDelete = async () => {
    if (confirm(`Voulez-vous vraiment supprimer l'accès de ${profile.full_name} ?`)) {
      const result = await deleteProfessionalUser(profile.id);
      if (!result.success) {
        alert("Erreur lors de la suppression : " + result.error);
      }
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <User size={24} />
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 truncate text-lg tracking-tight">
          {profile.full_name || "Utilisateur sans nom"}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-medium text-slate-400">Cabinet:</span> 
          <span className="text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded">
            {profile.cabinets?.name || "Non assigné"}
          </span>
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 space-y-2.5">
        <div className="flex items-center gap-2.5 text-[11px] text-slate-600 font-medium">
          <div className="p-1 bg-slate-50 rounded">
            <Mail size={12} className="text-slate-400" />
          </div>
          <span className="truncate">{profile.email || "Pas d'email"}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-slate-600 font-medium">
          <div className="p-1 bg-slate-50 rounded">
            <Phone size={12} className="text-slate-400" />
          </div>
          <span>{profile.phone || "+227 -- -- -- --"}</span>
        </div>
      </div>

      {/* Barre d'actions qui apparaît au survol */}
      <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <button 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-wider"
        >
          <Edit3 size={14} />
          Modifier
        </button>
        
        <button 
          onClick={handleDelete}
          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
          title="Supprimer l'utilisateur"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}