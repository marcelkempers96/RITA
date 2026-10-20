// Contributor submissions API (front-end only, BUILD-SPEC §0.4 and §5 "Submission").
// Sign-in, storage, editorial workflow and notifications are a separate back-end build.
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

const API = (import.meta.env.PUBLIC_SUBMISSIONS_API as string | undefined)?.replace(/\/$/, '');
export const DEMO_MODE = !API;
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

export async function listSubmissions(): Promise<Submission[]> {
  if (DEMO_MODE) return readStore().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return request<Submission[]>('');
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
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
  if (DEMO_MODE) return upsert(data, 'draft');
  const id = data.id ?? newId();
  return request<Submission>(`/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id, status: 'draft' }),
  });
}

/** Submits for editorial review. `files` carries the body upload and header image. */
export async function submitForReview(data: Partial<Submission>, files?: FormData): Promise<Submission> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return upsert(data, 'submitted');
  }
  const body = files ?? new FormData();
  body.set('submission', JSON.stringify({ ...data, status: 'submitted' }));
  return request<Submission>('', { method: 'POST', body });
}
