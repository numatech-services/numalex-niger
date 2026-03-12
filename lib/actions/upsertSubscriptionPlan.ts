"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/utils/session";
import type { ActionState } from "@/lib/actions/types";
import { revalidatePath } from "next/cache";

export async function upsertSubscriptionPlan(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    // 1. Vérification du rôle Superadmin
    const actor = await getSessionUser();
    if (actor?.role !== "superadmin") {
      return { ok: false, message: "Accès interdit : privilèges insuffisants" };
    }

    // 2. Extraction et conversion des données (noms correspondant au formulaire)
    const name = String(formData.get("name") || "");
    const monthly_price = Number(formData.get("monthly_price") || 0);
    const user_limit = Number(formData.get("user_limit") || 0);
    const storage_gb = Number(formData.get("storage_gb") || 0);

    // 3. Validation de base
    if (!name || monthly_price < 0 || user_limit <= 0 || storage_gb <= 0) {
      return { ok: false, message: "Veuillez remplir tous les champs avec des valeurs valides." };
    }

    // 4. Enregistrement dans Supabase
    // Nous utilisons upsert. Si un ID était fourni, il mettrait à jour, sinon il crée.
    const { error } = await supabase
      .from("subscription_plans")
      .upsert({
        name,
        monthly_price,
        user_limit,
        storage_gb,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Erreur Supabase Plan: - upsertSubscriptionPlan.ts:45", error);
      return { ok: false, message: "Erreur lors de l'enregistrement du plan : " + error.message };
    }

    // 5. Mise à jour de l'interface
    revalidatePath("/superadmin");
    
    return { ok: true, message: `Le plan "${name}" a été enregistré avec succès.` };

  } catch (error) {
    console.error("[upsertSubscriptionPlan] - upsertSubscriptionPlan.ts:55", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erreur technique imprévue"
    };
  }
}