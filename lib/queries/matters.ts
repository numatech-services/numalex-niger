// ============================================================
// NumaLex — Couche d'accès aux données : Dossiers (Matters)
//
// FIX C2 : Sanitisation du paramètre `search`
// FIX C7 : Utilisation de .maybeSingle() pour éviter le crash 406
// ============================================================

import { createClient } from '@/lib/supabase/server';
import type { Matter, MatterStatus, PaginationMeta, Profile } from '@/types';

const PAGE_SIZE = 10;

interface FetchMattersParams {
  page: number;
  status?: MatterStatus;
  search?: string;
}

interface FetchMattersResult {
  matters: Matter[];
  pagination: PaginationMeta;
}

/**
 * Échappe les caractères spéciaux PostgREST
 */
function sanitizeSearch(raw: string): string {
  return raw
    .replace(/[,()]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .trim()
    .slice(0, 100);
}

/**
 * Récupère les dossiers paginés
 */
export async function fetchMatters({
  page,
  status,
  search,
}: FetchMattersParams): Promise<FetchMattersResult> {
  const supabase = createClient();

  let query = supabase
    .from('matters')
    .select(
      `
      *,
      client:clients!matters_client_id_fkey ( id, full_name ),
      assignee:profiles!matters_assigned_to_fkey ( id, full_name )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (search && search.trim()) {
    const safe = sanitizeSearch(search);
    if (safe.length > 0) {
      query = query.or(
        `title.ilike.%${safe}%,reference.ilike.%${safe}%,parties_adverses.ilike.%${safe}%`
      );
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    // On retourne un tableau vide au lieu de crash le serveur
    console.error(`[fetchMatters] Erreur : ${error.message} - matters.ts:80`);
    return {
      matters: [],
      pagination: { page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 }
    };
  }

  const total = count ?? 0;

  return {
    matters: (data as Matter[]) ?? [],
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  };
}

/**
 * Récupère le profil de l'utilisateur connecté.
 * CORRECTIF CRITIQUE : Utilise .maybeSingle() pour éviter le crash 406 (JSON Coercion)
 */
export async function fetchCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  // 1. On récupère la session auth (cookie)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // 2. On cherche la ligne correspondante dans 'profiles'
  const { data, error } = await supabase
    .from('profiles')
    .select('id, cabinet_id, role, full_name, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle(); // <--- Empêche le crash si la ligne n'existe pas

  if (error) {
    console.error("Erreur technique profil (): - matters.ts:122", error.message);
    return null;
  }

  // On caste en Profile si data existe, sinon null
  return data as Profile | null;
}