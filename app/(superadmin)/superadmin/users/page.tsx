// app/superadmin/users/page.tsx
import { createClient } from "@/lib/supabase/server";
import { AddUserModal } from "@/components/AddUserModal";
import { UserCard } from "@/components/UserCard";

export default async function UsersPage() {
  const supabase = createClient();

  // On récupère les profils et les cabinets en parallèle pour plus de rapidité
  const [profilesResponse, cabinetsResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, cabinets(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("cabinets")
      .select("id, name")
  ]);

  const profiles = profilesResponse.data || [];
  const cabinets = cabinetsResponse.data || [];

  return (
    <main className="p-10 space-y-10 min-h-screen bg-slate-50/30">
      {/* Header avec bouton d'ajout */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500 font-medium">
            Contrôle des accès professionnels (Avocats, Huissiers, Notaires).
          </p>
        </div>
        <AddUserModal cabinets={cabinets} />
      </header>

      {/* Liste des utilisateurs */}
      <section className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold text-slate-800 italic uppercase tracking-tighter">
            Membres Actifs
          </h2>
          <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
            {profiles.length} Utilisateurs Enregistrés
          </span>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <UserCard 
                key={profile.id} 
                profile={profile} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
            <p className="text-slate-400 font-medium italic">
              Aucun utilisateur trouvé. Commencez par en ajouter un.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}