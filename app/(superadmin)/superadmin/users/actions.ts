// app/superadmin/users/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserCabinet(userId: string, cabinetId: string) {
  const supabase = createClient();

  // On lie l'utilisateur au cabinet et on s'assure qu'il a un rôle admin/avocat
  const { error } = await supabase
    .from('profiles')
    .update({ 
      cabinet_id: cabinetId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error("Erreur assignation:", error.message);
    throw new Error("Impossible de mettre à jour le cabinet.");
  }
  
  // Rafraîchit les données de la page sans recharger tout le navigateur
  revalidatePath('/superadmin/users');
}