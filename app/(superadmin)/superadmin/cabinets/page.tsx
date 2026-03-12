import { createClient } from "@/lib/supabase/server";
import { AddCabinetModal } from "@/components/AddCabinetModal";
import { CabinetCard } from "@/components/CabinetCard"; // Nouvel import

export default async function CabinetsPage() {
  const supabase = createClient();

  const [{ data: cabinets }, { data: plans }] = await Promise.all([
    supabase.from("cabinets").select("*").order("created_at", { ascending: false }),
    supabase.from("subscription_plans").select("*").order("created_at", { ascending: false })
  ]);

  return (
    <main className="p-10 space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Cabinets</h1>
          <p className="text-slate-500 font-medium">Répertoire interactif des partenaires NumaLex.</p>
        </div>
        <AddCabinetModal />
      </header>

      <section className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-slate-800 italic uppercase tracking-tighter">Annuaire Professionnel</h2>
            <span className="ml-auto text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                {cabinets?.length || 0} ENREGISTRÉS
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cabinets?.map((cabinet) => (
            <CabinetCard 
              key={cabinet.id} 
              cabinet={cabinet} 
              plans={plans || []} 
            />
          ))}
        </div>
      </section>
    </main>
  );
}