import { redirect } from 'next/navigation';
import { fetchCurrentProfile } from '@/lib/queries/matters';
import { Sidebar } from '@/components/dashboard/sidebar';
import { LogoutButton } from '@/components/dashboard/logout-button';
import { GlobalSearch } from '@/components/dashboard/global-search';
import { ToastProvider } from '@/components/ui/toast';
import { AutoLogout } from '@/components/dashboard/AutoLogout'; // <-- Ajoute cet import

const ROLE_LABELS: Record<string, string> = {
  avocat: 'Avocat',
  huissier: 'Huissier',
  notaire: 'Notaire',
  admin: 'Administrateur',
  superadmin: 'Super Admin' // Ajouté pour ton compte actuel
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await fetchCurrentProfile();

  if (!profile) {
    return redirect('/login');
  }

  const userName = profile.full_name || 'Utilisateur Numatech';
  const roleLabel = ROLE_LABELS[profile.role || 'avocat'] || 'Membre';

  return (
    <ToastProvider>
      {/* 🚀 On place le surveillant d'inactivité ici */}
      <AutoLogout /> 

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar 
          userName={userName} 
          userRole={profile.role || 'avocat'} 
          roleLabel={roleLabel} 
        />

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <div className="w-10 lg:hidden" />
            <div className="hidden flex-1 sm:block">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700 sm:block">
                {roleLabel}
              </span>
              <LogoutButton />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}