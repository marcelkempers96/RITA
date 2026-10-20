// Contributor submissions API (front-end only, BUILD-SPEC §0.4 and §5 "Submission").
// Back-end: Supabase (PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_PUBLISHABLE_KEY, see supabase/schema.sql).
// Alternative: a custom API at PUBLIC_SUBMISSIONS_API.
// Set PUBLIC_SUBMISSIONS_API (e.g. https://api.rita.africa) and these functions call
//   GET  {api}/api/submissions          → Submission[]
//   GET  {api}/api/submissions/:id      → Submission
//   PUT  {api}/api/submissions/:id      → Submission   (save draft)
//   POST {api}/api/submissions          → Submission   (submit for review, multipart/form-data)
// When the variable is unset (local dev, preview) everything runs in demo mode against localStorage.

export type SubmissionFormat = 'policy-insight' | 'blog-op-ed' | 'policy-brief' | 'working-paper';
export type SubmissionStatus = 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'scheduled' | 'published';

export interface SubmissionImage {
  file?: string; // file name (the binary travels in the multipart body)
  caption?: string;
  credit: string;
  alt: string;
  rightsConfirmed: boolean;
}

export interface Submission {
  id: string;
  format: SubmissionFormat;
  programme: string; // IND | MIN | EN | INN
  title: string; // ≤ 90 characters
  standfirst: string; // ≤ 40 words
  author: string;
  coAuthors: string[];
  tags: string[];
  body?: string;
  file?: string; // uploaded .docx / PDF file name
  references?: string;
  images: SubmissionImage[];
  declarations: { original: boolean; coi: boolean; coiText?: string; editingConsent: boolean };
  status: SubmissionStatus;
  updatedAt: string; // ISO
}

export const FORMAT_LABEL: Record<SubmissionFormat, string> = {
  'policy-insight': 'Policy Insight',
  'blog-op-ed': 'Blog / op-ed',
  'policy-brief': 'Policy brief',
  'working-paper': 'Working paper',
};

/** Word limits per format; null = no word limit shown. */
export const WORD_LIMITS: Record<SubmissionFormat, [number, number] | null> = {
  'policy-insight': [600, 900],
  'blog-op-ed': [800, 1200],
  'policy-brief': null, // 4 pages
  'working-paper': null, // PDF upload
};

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  scheduled: 'Scheduled',
  published: 'Published',
};

import { SUPABASE_ENABLED, supabase } from '../supabase';

const API = (import.meta.env.PUBLIC_SUBMISSIONS_API as string | undefined)?.replace(/\/$/, '');
/** Demo mode: no back-end configured, submissions live in this browser only. */
export const DEMO_MODE = !SUPABASE_ENABLED && !API;
const STORE = 'rita-submissions-demo';

function readStore(): Submission[] {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]') as Submission[]; } catch { return []; }
}
function writeStore(list: Submission[]) {
  try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* storage unavailable */ }
}
const newId = () => `sub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/api/submissions${path}`, { credentials: 'include', ...init });
  if (!res.ok) throw new Error(`Submissions API: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Supabase mapping (table public.submissions) ──────────────────────────────
type Row = {
  id: string; format: SubmissionFormat; programme: string | null; title: string; standfirst: string; author: string;
  co_authors: string[]; tags: string[]; body: string | null; references_text: string | null; file_path: string | null;
  image: (SubmissionImage & { path?: string }) | null; declarations: Submission['declarations']; status: SubmissionStatus | 'declined'; updated_at: string;
};
const fromRow = (r: Row): Submission => ({
  id: r.id, format: r.format, programme: r.programme ?? '', title: r.title, standfirst: r.standfirst, author: r.author,
  coAuthors: r.co_authors ?? [], tags: r.tags ?? [], body: r.body ?? undefined, file: r.file_path ?? undefined,
  references: r.references_text ?? undefined, images: r.image ? [r.image] : [], declarations: r.declarations ?? { original: false, coi: false, editingConsent: false },
  status: (r.status === 'declined' ? 'changes_requested' : r.status) as SubmissionStatus, updatedAt: r.updated_at,
});
const toRow = (d: Partial<Submission>) => ({
  ...(d.format ? { format: d.format } : {}), programme: d.programme ?? null, title: d.title ?? '', standfirst: d.standfirst ?? '',
  author: d.author ?? '', co_authors: d.coAuthors ?? [], tags: d.tags ?? [], body: d.body ?? null, references_text: d.references ?? null,
  image: d.images?.[0] ?? null, declarations: d.declarations ?? {},
});
const isUuid = (id?: string) => Boolean(id && /^[0-9a-f-]{36}$/i.test(id));

/** True when submitting needs a signed-in account (Supabase mode). */
export async function needsSignIn(): Promise<boolean> {
  if (!SUPABASE_ENABLED) return false;
  const { data } = await supabase().auth.getSession();
  return !data.session;
}

async function sbUpsert(data: Partial<Submission>, status: 'draft' | 'submitted'): Promise<Submission> {
  const sb = supabase();
  const row = { ...toRow(data), status };
  const q = isUuid(data.id)
    ? sb.from('submissions').update(row).eq('id', data.id!).select().single()
    : sb.from('submissions').insert(row).select().single();
  const { data: saved, error } = await q;
  if (error) throw error;
  return fromRow(saved as Row);
}

async function sbUpload(id: string, file: File, kind: string) {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  const path = `${user!.id}/${id}/${kind}-${file.name.replace(/[^\w.-]+/g, '_')}`;
  const { error } = await sb.storage.from('submissions').upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function listSubmissions(): Promise<Submission[]> {
  if (SUPABASE_ENABLED) {
    const sb = supabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('submissions').select('*').eq('author_id', user.id).order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  }
  if (DEMO_MODE) return readStore().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return request<Submission[]>('');
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  if (SUPABASE_ENABLED) {
    const { data } = await supabase().from('submissions').select('*').eq('id', id).maybeSingle();
    return data ? fromRow(data as Row) : undefined;
  }
  if (DEMO_MODE) return readStore().find((s) => s.id === id);
  return request<Submission>(`/${encodeURIComponent(id)}`);
}

function upsert(data: Partial<Submission>, status: SubmissionStatus): Submission {
  const list = readStore();
  const existing = data.id ? list.find((s) => s.id === data.id) : undefined;
  const item = {
    coAuthors: [], tags: [], images: [], declarations: { original: false, coi: false, editingConsent: false },
    format: 'policy-insight', programme: '', title: '', standfirst: '', author: '',
    ...existing, ...data, id: existing?.id ?? data.id ?? newId(), status, updatedAt: new Date().toISOString(),
  } as Submission;
  writeStore([item, ...list.filter((s) => s.id !== item.id)]);
  return item;
}

/** Saves a draft (autosave and the "Save draft" button). */
export async function saveDraft(data: Partial<Submission>): Promise<Submission> {
  if (SUPABASE_ENABLED) {
    if (await needsSignIn()) return upsert(data, 'draft'); // not signed in yet: keep the draft locally
    return sbUpsert(data, 'draft');
  }
  if (DEMO_MODE) return upsert(data, 'draft');
  const id = data.id ?? newId();
  return request<Submission>(`/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id, status: 'draft' }),
  });
}

/** Submits for editorial review. `files` carries the body upload ("file") and header image ("image"). */
export async function submitForReview(data: Partial<Submission>, files?: FormData): Promise<Submission> {
  if (SUPABASE_ENABLED) {
    if (await needsSignIn()) throw new Error('sign-in required');
    let saved = await sbUpsert(data, 'draft');
    const patch: Record<string, unknown> = {};
    const file = files?.get('file');
    if (file instanceof File && file.size) patch.file_path = await sbUpload(saved.id, file, 'body');
    const image = files?.get('image');
    if (image instanceof File && image.size) patch.image = { ...(data.images?.[0] ?? {}), path: await sbUpload(saved.id, image, 'image') };
    const { data: done, error } = await supabase().from('submissions').update({ ...patch, status: 'submitted' }).eq('id', saved.id).select().single();
    if (error) throw error;
    saved = fromRow(done as Row);
    return saved;
  }
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return upsert(data, 'submitted');
  }
  const body = files ?? new FormData();
  body.set('submission', JSON.stringify({ ...data, status: 'submitted' }));
  return request<Submission>('', { method: 'POST', body });
}
