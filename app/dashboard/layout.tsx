import { redirect } from 'next/navigation';
import { fetchCurrentProfile } from '@/lib/queries/matters';
import { Sidebar } from '@/components/dashboard/sidebar';
import { LogoutButton } from '@/components/dashboard/logout-button';
import { GlobalSearch } from '@/components/dashboard/global-search';
import { ToastProvider } from '@/components/ui/toast';

const ROLE_LABELS: Record<string, string> = {
  avocat: 'Avocat',
  huissier: 'Huissier',
  notaire: 'Notaire',
  admin: 'Administrateur'
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile;
  try {
    profile = await fetchCurrentProfile();
    if (!profile) throw new Error("No profile");
  } catch (err) {
    console.error("Layout Profile Error:", err);
    return redirect('/login');
  }

  // Sécurité sur les noms et rôles
  const userName = profile.full_name || profile.first_name || 'Utilisateur';
  const roleLabel = ROLE_LABELS[profile.role || 'avocat'] || 'Utilisateur';

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar 
          userName={userName} 
          userRole={profile.role || 'avocat'} 
          roleLabel={roleLabel} 
        />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <div className="w-10 lg:hidden" />
            <div className="hidden flex-1 sm:block">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:block">
                {roleLabel}
              </span>
              <LogoutButton />
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}