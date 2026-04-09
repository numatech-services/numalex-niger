"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Users, 
  LogOut,
  UserCog // Icône plus adaptée pour la gestion des utilisateurs
} from "lucide-react";

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // ✅ Redirection vers la page de login centrale
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { name: "Vue d'ensemble", href: "/superadmin", icon: LayoutDashboard },
    { name: "Cabinets", href: "/superadmin/cabinets", icon: Building2 },
    { name: "Facturation", href: "/superadmin/billing", icon: CreditCard },
    { name: "Demandes démo", href: "/superadmin/requests", icon: Users },
    { name: "Utilisateurs", href: "/superadmin/users", icon: UserCog }, // Changé en UserCog pour différencier
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">
          N
        </div>
        <span className="text-white font-black tracking-tighter text-lg uppercase italic">NumaLex Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={18} className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`} />
              <span className="font-bold text-[13px] uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-4">
          <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Session Admin</p>
          <p className="text-[11px] text-blue-400 truncate font-bold italic">{userEmail}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black text-[12px] uppercase tracking-widest"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}