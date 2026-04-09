// ============================================================
// NumaLex — Tableau de bord principal (CORRIGÉ & SÉCURISÉ)
// Route : /dashboard
// ============================================================

import { redirect } from 'next/navigation';
import { fetchCurrentProfile } from '@/lib/queries/matters';
import {
  fetchDashboardKpis,
  fetchRecentMatters,
  fetchTodayEvents,
  fetchRecentAlerts,
  fetchPendingTasks,
  fetchRecentDocuments,
} from '@/lib/queries/dashboard';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { RecentMatters } from '@/components/dashboard/recent-matters';
import { TodayAgenda } from '@/components/dashboard/today-agenda';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { TasksList } from '@/components/dashboard/tasks-list';
import { OpenDocuments } from '@/components/dashboard/open-documents';

export const metadata = { title: 'Tableau de bord' };

export default async function DashboardPage() {
  // 1. Récupération du profil sans bloc try/catch bloquant
  const profile = await fetchCurrentProfile();

  // Si vraiment aucun utilisateur n'est retourné (session expirée)
  if (!profile) {
    return redirect('/login');
  }

  const cid = profile.cabinet_id;
  const isSuperAdmin = profile.role === 'superadmin';

  // 2. Chargement des données avec une sécurité totale
  // On s'assure que même si une fonction est bloquée par la RLS, le reste s'affiche
  const [kpis, recentMatters, todayEvents, alerts, tasks, documents] = await Promise.all([
    fetchDashboardKpis(cid).catch(() => ({ total_matters: 0, active_clients: 0, pending_tasks: 0, revenue: 0 })),
    fetchRecentMatters(cid).catch(() => []),
    fetchTodayEvents(cid).catch(() => []),
    fetchRecentAlerts(cid).catch(() => []),
    fetchPendingTasks(cid).catch(() => []),
    fetchRecentDocuments(cid).catch(() => []),
  ]);

  const greeting = getGreeting();
  const displayName = profile.full_name ? profile.full_name.split(' ')[0] : 'Maître';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Debug: Si tu vois ce texte mais rien d'autre, c'est un composant enfant qui crash */}
      <span className="sr-only">Rendu Dashboard Actif</span>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting}, {displayName}
          </h1>
          {isSuperAdmin && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
              Mode Admin
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {cid 
            ? "Voici le résumé de votre cabinet pour aujourd'hui." 
            : "Vue d'ensemble administrateur (aucun cabinet lié)."}
        </p>
      </div>

      {/* Condition d'affichage : soit on a un cabinet, soit on est superadmin */}
      {!cid && !isSuperAdmin ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
             <span className="text-xl">⚖️</span>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Cabinet non configuré</h3>
          <p className="mt-1 text-sm text-slate-500">
            Votre profil doit être rattaché à un cabinet pour accéder aux dossiers.
          </p>
        </div>
      ) : (
        <>
          {/* Section KPIs */}
          <KpiCards kpis={kpis} />

          {/* Grille principale */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <RecentMatters matters={recentMatters || []} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <OpenDocuments documents={documents || []} />
                 <TasksList tasks={tasks || []} />
              </div>
            </div>
            
            <div className="space-y-6">
              <TodayAgenda events={todayEvents || []} />
              <AlertsPanel alerts={alerts || []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}