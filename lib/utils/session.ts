import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = createClient();
  
  // 1. Récupérer l'utilisateur authentifié via Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // 2. Récupérer son profil détaillé dans ta table 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile;
}