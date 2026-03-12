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
  ShieldCheck
} from "lucide-react"; // Utilise des SVG si tu n'as pas lucide-react

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin-login");
    router.refresh();
  };

  const menuItems = [
    { name: "Vue d'ensemble", href: "/superadmin", icon: LayoutDashboard },
    { name: "Cabinets", href: "/superadmin/cabinets", icon: Building2 },
    { name: "Facturation", href: "/superadmin/billing", icon: CreditCard },
    { name: "Demandes démo", href: "/superadmin/requests", icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          N
        </div>
        <span className="text-white font-bold tracking-tight text-lg">NumaLex Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Administrateur</p>
          <p className="text-xs text-white truncate font-medium">{userEmail}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
        >
          <LogOut size={20} />
          Déconnecter
        </button>
      </div>
    </aside>
  );
}