"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/utils/session";
import type { ActionState } from "@/lib/actions/types";
import { revalidatePath } from "next/cache";

export async function verifyCabinet(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();

    // 1. Vérification du rôle Superadmin
    const actor = await getSessionUser();
    if (actor?.role !== "superadmin") {
      return { ok: false, message: "Accès refusé : privilèges insuffisants" };
    }

    // 2. Extraction des données du formulaire
    const cabinetId = formData.get("cabinetId") as string;
    const isVerified = formData.get("is_verified") === "true";
    const verificationNotes = formData.get("verification_notes") as string;

    if (!cabinetId) {
      return { ok: false, message: "ID du cabinet manquant" };
    }

    // 3. Mise à jour dans Supabase
    const { data: cabinet, error } = await supabase
      .from("cabinets")
      .update({
        is_verified: isVerified,
        verification_notes: verificationNotes,
        verified_at: isVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", cabinetId)
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase Verification: - verifyCabinet.ts:44", error);
      return { ok: false, message: "Erreur lors de la mise à jour : " + error.message };
    }

    if (!cabinet) {
      return { ok: false, message: "Cabinet introuvable dans la base de données" };
    }

    // 4. Rafraîchir les données de la page Superadmin
    revalidatePath("/superadmin");

    return { 
      ok: true, 
      message: isVerified 
        ? `Le cabinet "${cabinet.name}" a été validé.` 
        : `Le statut du cabinet "${cabinet.name}" a été mis en attente.` 
    };

  } catch (error) {
    console.error("[verifyCabinet] - verifyCabinet.ts:63", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Une erreur technique est survenue"
    };
  }
}