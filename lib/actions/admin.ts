'use server';

import { createAdminClient } from '@/lib/supabase/admin'; 
import { revalidatePath } from 'next/cache';

/**
 * CRÉATION : Crée un compte pro avec un rôle STRICTEMENT identique au cabinet
 */
export async function createProfessionalUser(formData: FormData) {
  const supabase = createAdminClient();
  
  const email = formData.get('email') as string;
  const fullName = formData.get('full_name') as string;
  const cabinetId = formData.get('cabinet_id') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;

  try {
    // 1. RÉCUPÉRATION STRICTE de la profession du cabinet
    const { data: cabinet, error: cabError } = await supabase
      .from('cabinets')
      .select('profession')
      .eq('id', cabinetId)
      .single();

    if (cabError || !cabinet) {
      return { success: false, error: "Impossible de trouver la profession du cabinet." };
    }

    // Mapping pour transformer "Commissaire de Justice" en "huissier" (si nécessaire)
    let determinedRole = cabinet.profession.toLowerCase();
    if (determinedRole.includes('commissaire')) determinedRole = 'huissier';
    if (determinedRole.includes('notaire')) determinedRole = 'notaire';
    if (determinedRole.includes('avocat')) determinedRole = 'avocat';

    // 2. CRÉATION AUTH via ADMIN API
    // On passe le rôle dans les metadata pour que le Trigger SQL puisse le lire
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName,
        role: determinedRole 
      }
    });

    if (authError) return { success: false, error: `Auth: ${authError.message}` };

    // 3. MISE À JOUR DU PROFIL
    // On utilise .update() car le trigger a déjà créé la ligne. 
    // On force le cabinet_id et on re-confirme le rôle.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        cabinet_id: cabinetId,
        role: determinedRole, // Force le rôle du cabinet
        full_name: fullName,
        phone: phone,
        app_role: 'staff',
        active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user!.id);

    if (profileError) return { success: false, error: `Erreur Profil: ${profileError.message}` };

    revalidatePath('/superadmin/users');
    return { success: true };

  } catch (err: any) {
    return { success: false, error: "Erreur système critique lors de la création." };
  }
}

/**
 * MISE À JOUR
 */
export async function updateProfessionalUser(userId: string, data: any) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      cabinet_id: data.cabinet_id,
      role: data.role?.toLowerCase(), 
      active: data.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/superadmin/users');
  return { success: true };
}

/**
 * SUPPRESSION
 */
export async function deleteProfessionalUser(userId: string) {
  const supabase = createAdminClient();

  // Supprime l'auth (le cascade s'occupe du profil)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/superadmin/users');
  return { success: true };
}