"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/utils/session";
import type { ActionState } from "@/lib/actions/types";
import { revalidatePath } from "next/cache";

export async function assignPlan(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    // 1. Vérification Superadmin
    const actor = await getSessionUser();
    if (actor?.role !== "superadmin") {
      return { ok: false, message: "Accès interdit" };
    }

    const cabinetId = formData.get("cabinetId") as string;
    const planId = formData.get("planId") as string;

    if (!cabinetId || !planId) {
      return { ok: false, message: "Données manquantes" };
    }

    // 2. Récupérer les détails du plan (prix notamment)
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return { ok: false, message: "Plan introuvable" };
    }

    // 3. UPSERT de l'abonnement
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        cabinet_id: cabinetId,
        plan_id: planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'cabinet_id' });

    if (subError) throw subError;

    // 4. CRÉATION DE LA LIGNE DANS LE JOURNAL (Invoices)
    const { error: invError } = await supabase
      .from("subscription_invoices")
      .insert({
        cabinet_id: cabinetId,
        plan_id: planId,
        amount: plan.monthly_price,
        status: 'unpaid', // Par défaut impayée jusqu'à confirmation
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (invError) throw invError;

    revalidatePath("/superadmin/cabinets");
    revalidatePath("/superadmin/billing"); // On rafraîchit aussi la page facturation
    
    return { ok: true, message: `Abonnement "${plan.name}" activé et facture générée.` };

  } catch (error: any) {
    console.error("❌ Erreur Billing: - assignPlan.ts:73", error);
    return { ok: false, message: error.message || "Erreur lors de l'opération" };
  }
}