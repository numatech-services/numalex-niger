import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Client Admin : À utiliser UNIQUEMENT dans les Server Actions de SuperAdmin.
 * Ce client outrepasse les politiques RLS et permet de gérer les comptes Auth.
 */
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Ta clé secrète (commence par ey...)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};