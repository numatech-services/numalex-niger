"use server";

import { createClient } from "@/lib/supabase/server";
import { cabinetSchema } from "@/lib/validators/cabinet";
import type { ActionState } from "@/lib/actions/types";
import { toFieldErrors } from "@/lib/utils/zod";
import { getSessionUser } from "@/lib/utils/session";
import { revalidatePath } from "next/cache";

export async function createCabinet(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();
    
    // 1. Vérification du rôle Superadmin via la session Supabase
    const actor = await getSessionUser();
    if (actor?.role !== "superadmin") {
      return { ok: false, message: "Accès refusé" };
    }

    // 2. Validation des données avec Zod
    const rawData = Object.fromEntries(formData.entries());
    const parsed = cabinetSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Validation échouée",
        fieldErrors: toFieldErrors(parsed.error)
      };
    }

    // 3. Vérifier si l'admin existe déjà (dans la table profiles)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", parsed.data.adminPhone)
      .single();

    if (existingUser) {
      return { ok: false, message: "Ce numéro de téléphone est déjà lié à un compte." };
    }

    // 4. Création du cabinet dans la table 'cabinets'
    // Note: 'id' est un text, assure-toi de générer un ID ou de laisser Supabase le faire s'il est en uuid
    const slug = parsed.data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const { data: cabinet, error: cabError } = await supabase
      .from("cabinets")
      .insert([{
        id: crypto.randomUUID(), // Génération d'un ID text unique
        name: parsed.data.name,
        slug: slug,
        profession: (parsed.data.profession as 'avocat' | 'notaire' | 'commissaire_justice') || 'avocat',
        type: parsed.data.type || 'standard'
      }])
      .select()
      .single();

    if (cabError) throw new Error(`Erreur Cabinet: ${cabError.message}`);

    // 5. Mise à jour du profil utilisateur pour devenir Admin de ce cabinet
    const { error: profError } = await supabase
      .from("profiles")
      .update({
        role: "admin_cabinet",
        cabinet_id: cabinet.id,
        full_name: "Admin " + cabinet.name
      })
      .eq("phone", parsed.data.adminPhone);

    if (profError) throw new Error(`Erreur Profil: ${profError.message}`);

    revalidatePath("/superadmin");
    return { ok: true, message: `Le cabinet ${cabinet.name} a été créé avec succès.` };

  } catch (error) {
    console.error("[createCabinet] - createCabinet.ts:80", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Une erreur imprévue est survenue."
    };
  }
}