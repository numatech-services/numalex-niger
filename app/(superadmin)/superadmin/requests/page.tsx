import { createClient } from "@/lib/supabase/server";

export default async function RequestsPage() {
  const supabase = createClient();
  const { data: requests } = await supabase
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="p-10 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Demandes de Démo</h1>
        <p className="text-slate-500">Suivez les prospects intéressés par NumaLex.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {requests?.map((req) => (
          <div key={req.id} className="bg-slate-900 rounded-[28px] p-8 text-white shadow-xl hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <p className="font-black text-2xl tracking-tighter">{req.full_name}</p>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-blue-400 font-mono text-sm mb-4">{req.phone}</p>
            <div className="pt-4 border-t border-slate-800 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <p className="text-slate-300">{req.cabinet_name || "Indépendant"}</p>
              <p>{req.city || "Niger"}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}