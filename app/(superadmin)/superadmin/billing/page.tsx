import { createClient } from "@/lib/supabase/server";
import { SubscriptionPlanForm } from "@/components/SubscriptionPlanForm";
import { SubscriptionInvoiceActions } from "@/components/SubscriptionInvoiceActions";
import { SubscriptionPlansTable } from "@/components/SubscriptionPlansTable"; // Import du nouveau composant

export default async function BillingPage() {
  const supabase = createClient();

  const [{ data: invoices }, { data: plans }, { data: cabinets }] = await Promise.all([
    supabase.from("subscription_invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("subscription_plans").select("*").order("created_at", { ascending: false }),
    supabase.from("cabinets").select("id, name")
  ]);

  const cabinetMap = new Map((cabinets || []).map((c) => [c.id, c.name]));

  return (
    <main className="p-10 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finances & Plans</h1>
        <p className="text-slate-500">Gérez les offres SaaS et le suivi des factures.</p>
      </header>

      {/* SECTION : GESTION DES OFFRES */}
      <section className="space-y-6">
        <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 font-serif tracking-tight">Configuration des Offres</h2>
          <SubscriptionPlanForm />
        </div>

        {/* Affichage des plans sous forme de cartes */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Offres Actives</h2>
          <SubscriptionPlansTable plans={plans || []} />
        </div>
      </section>

      {/* SECTION : JOURNAL DES FACTURES */}
      <section className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Journal des Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="pb-4">Cabinet</th>
                <th className="pb-4">Montant (XOF)</th>
                <th className="pb-4">Statut</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[10px] font-bold uppercase text-slate-300 tracking-widest">
                    Aucune facture dans le journal
                  </td>
                </tr>
              ) : (
                invoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-slate-700">
                      {cabinetMap.get(invoice.cabinet_id) || "Inconnu"}
                    </td>
                    <td className="font-mono font-black text-slate-900 italic">
                      {invoice.amount.toLocaleString()} F
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 
                        invoice.status === 'void' ? 'bg-slate-100 text-slate-400' : 'bg-red-100 text-red-600'
                      }`}>
                        {invoice.status === 'paid' ? 'Payée' : invoice.status === 'void' ? 'Annulée' : 'Impayée'}
                      </span>
                    </td>
                    <td className="text-right">
                      <SubscriptionInvoiceActions invoiceId={invoice.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}