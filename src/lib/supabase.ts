// Browser Supabase client. Only the publishable key is used here: row-level security in
// supabase/schema.sql decides what each signed-in account may read and write.
// Never put the secret key in the website.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const SUPABASE_ENABLED = Boolean(URL && KEY);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!SUPABASE_ENABLED) throw new Error('Supabase is not configured (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_PUBLISHABLE_KEY).');
  client ??= createClient(URL!, KEY!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

export type Role = 'admin' | 'editor' | 'fellow' | 'contributor';
export interface Profile { id: string; email: string | null; full_name: string | null; role: Role; person_slug: string | null; author_key: string | null }

export async function currentProfile(): Promise<Profile | null> {
  if (!SUPABASE_ENABLED) return null;
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  return (data as Profile | null) ?? { id: session.user.id, email: session.user.email ?? null, full_name: null, role: 'contributor', person_slug: null, author_key: null };
}
export const isStaff = (p: Profile | null) => p?.role === 'admin' || p?.role === 'editor';
