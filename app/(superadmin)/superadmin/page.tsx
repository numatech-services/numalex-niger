import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/utils/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { CreditCard, Users, Zap, Target, ArrowUpRight } from "lucide-react";

export default async function SuperadminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin") redirect("/admin-login");

  const supabase = createClient();

  const [
    { data: requests },
    { data: cabinets },
    { data: invoices }
  ] = await Promise.all([
    supabase.from("demo_requests").select("id").order("created_at", { ascending: false }),
    supabase.from("cabinets").select("id, name, created_at").order("created_at", { ascending: false }),
    supabase.from("subscription_invoices").select("*").order("created_at", { ascending: false })
  ]);

  const cabinetMap = new Map((cabinets || []).map((c) => [c.id, c.name]));

  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const unpaidCount = invoices?.filter(i => i.status === 'unpaid').length || 0;
  const activeCabinets = cabinets?.length || 0;
  const totalProspects = requests?.length || 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar fixe à gauche */}
      <AdminSidebar email={user.email || ""} />

      {/* Conteneur principal qui remplit tout l'espace restant sans marge inutile */}
      <main className="flex-1 p-10 space-y-8 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          {/* HEADER */}
          <header className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">NumaLex Admin</h1>
              <p className="text-slate-500 font-medium">Global Overview & Control Center (Niger)</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-right">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Dernière mise à jour</p>
               <p className="font-mono text-sm font-bold text-slate-900">{new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </header>

          {/* 1. STATISTIQUES (WIDGETS) : w-full pour occuper toute la largeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <StatWidget label="Revenu Total" value={`${totalRevenue.toLocaleString()} F`} sub="Encaissé" icon={<CreditCard size={22} />} color="text-green-600" bg="bg-green-50" />
            <StatWidget label="Cabinets" value={activeCabinets} sub="Actifs" icon={<Users size={22} />} color="text-blue-600" bg="bg-blue-50" />
            <StatWidget label="Impayés" value={unpaidCount} sub="Relances Airtel/Moov" icon={<Zap size={22} />} color="text-amber-500" bg="bg-amber-50" />
            <StatWidget label="Prospects" value={totalProspects} sub="En attente démo" icon={<Target size={22} />} color="text-slate-600" bg="bg-slate-100" />
          </div>

          {/* 2. VUE GLOBALE DÉTAILLÉE */}
          <div className="grid grid-cols-12 gap-8 w-full items-start">
            {/* JOURNAL (8/12) */}
            <section className="col-span-12 xl:col-span-8 bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-800 italic tracking-tight underline decoration-blue-500 underline-offset-8">Derniers Encaissements</h2>
                <button className="px-5 py-2 rounded-xl bg-slate-50 text-[11px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-colors">Voir Finances →</button>
              </div>
              
              <div className="space-y-4 font-bold">
                {invoices?.slice(0, 6).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50/50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight text-lg italic">{cabinetMap.get(invoice.cabinet_id) || "Client"}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(invoice.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-black text-slate-900 italic tracking-tighter">{invoice.amount.toLocaleString()} F</p>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {invoice.status === 'paid' ? 'Payé' : 'Impayé'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CABINETS (4/12) */}
            <section className="col-span-12 xl:col-span-4 bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl">
              <h2 className="text-xl font-bold mb-10 italic tracking-tight">Nouveaux Cabinets</h2>
              <div className="space-y-8">
                {cabinets?.slice(0, 5).map((cabinet) => (
                  <div key={cabinet.id} className="group cursor-pointer border-l-2 border-slate-700 pl-6 py-1 hover:border-blue-500 transition-colors">
                    <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-1">Inscrit le {new Date(cabinet.created_at).toLocaleDateString()}</p>
                    <p className="font-bold text-lg group-hover:translate-x-2 transition-transform">{cabinet.name}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-12 py-4 rounded-[20px] bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all">
                Gestion des Cabinets
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatWidget({ label, value, sub, icon, color, bg }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all w-full group">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-2">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter mb-1">{value}</h3>
      <p className="text-[11px] text-slate-500 font-medium">{sub}</p>
    </div>
  );
}