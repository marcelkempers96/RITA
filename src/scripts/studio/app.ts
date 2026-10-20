// RITA Studio: sign in, review submissions, edit site content, manage users and publish the website.
// Hash routes: #/ · #/submissions · #/submission/<id> · #/content/<collection> · #/edit/<collection>/<slug>
//              #/new/<collection> · #/users · #/account
import type { Session } from '@supabase/supabase-js';
import { SUPABASE_ENABLED, supabase, type Profile, type Role } from '../../lib/supabase';
import { BASE } from '../../lib/base';
import { COLLECTIONS, getPath, setPath, slugify, type Field } from './fields';

const root = document.querySelector<HTMLElement>('[data-studio]')!;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const STATUS: Record<string, string> = { draft: 'Draft', submitted: 'Submitted', in_review: 'In review', changes_requested: 'Changes requested', scheduled: 'Scheduled', published: 'Published', declined: 'Declined' };
const FORMAT: Record<string, string> = { 'policy-insight': 'Policy Insight', 'blog-op-ed': 'Blog / op-ed', 'policy-brief': 'Policy brief', 'working-paper': 'Working paper' };
const ROLES: Role[] = ['admin', 'editor', 'fellow', 'contributor'];
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

let session: Session | null = null;
let me: Profile | null = null;
const staff = () => me?.role === 'admin' || me?.role === 'editor';
const admin = () => me?.role === 'admin';

function flash(msg: string, kind: 'ok' | 'error' = 'ok') {
  const el = document.querySelector<HTMLElement>('[data-flash]');
  if (!el) return;
  el.className = kind === 'ok' ? 'form-success flash' : 'form-error-banner flash';
  el.textContent = msg;
  el.hidden = false;
  el.focus();
  window.setTimeout(() => (el.hidden = true), 6000);
}

// ── Shell ────────────────────────────────────────────────────────────────────
function shell(inner: string, active = '') {
  const tab = (href: string, label: string, key: string) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ''}>${label}</a>`;
  root.innerHTML = `
    <div class="studio-bar">
      <div class="between">
        <p class="label mute">Signed in as <strong>${esc(me?.full_name || me?.email)}</strong> · ${esc(me?.role)}</p>
        <div class="row">
          ${staff() ? '<button type="button" class="btn btn-sm" data-publish>Publish website</button>' : ''}
          <a class="btn btn-sm btn-secondary" href="#/account">Account</a>
          <button type="button" class="btn btn-sm btn-secondary" data-signout>Sign out</button>
        </div>
      </div>
      <nav class="tabs mt-16" aria-label="Studio">
        ${tab('#/', 'Overview', 'home')}
        ${tab('#/submissions', staff() ? 'Submissions' : 'My submissions', 'submissions')}
        ${me?.role !== 'contributor' ? tab('#/content/publications', 'Content', 'content') : ''}
        ${admin() ? tab('#/users', 'Users', 'users') : ''}
      </nav>
    </div>
    <div class="form-success flash" data-flash hidden tabindex="-1" role="status"></div>
    <div class="studio-main">${inner}</div>`;
  root.querySelector('[data-signout]')?.addEventListener('click', async () => { await supabase().auth.signOut(); location.hash = '#/'; });
  root.querySelector('[data-publish]')?.addEventListener('click', publishSite);
}

async function publishSite(e: Event) {
  const b = e.currentTarget as HTMLButtonElement;
  if (!confirm('Rebuild the public website with all published content? It goes live in 2–5 minutes.')) return;
  b.disabled = true; b.textContent = 'Publishing…';
  const { data, error } = await supabase().rpc('publish_site');
  b.disabled = false; b.textContent = 'Publish website';
  if (error) flash(`Could not publish: ${error.message}`, 'error');
  else flash(`Website rebuild started (${data}). Changes are live in a few minutes.`);
}

// ── Sign in ──────────────────────────────────────────────────────────────────
function loginView(mode: 'signin' | 'signup' | 'magic' | 'reset' | 'newpass' = 'signin') {
  const titles = { signin: 'Sign in', signup: 'Create an account', magic: 'Email me a sign-in link', reset: 'Reset your password', newpass: 'Choose a new password' };
  root.innerHTML = `
    <div class="login">
      <h2 class="h2">${titles[mode]}</h2>
      <p class="mute mt-8">${mode === 'signup' ? 'For RITA researchers, fellows and invited contributors.' : 'RITA Studio: submissions and site content.'}</p>
      <form class="form mt-24" data-login novalidate>
        <div data-error-summary hidden></div>
        ${mode === 'signup' ? '<div class="field"><label for="l-name">Full name<span class="req">*</span></label><input id="l-name" class="input" name="name" autocomplete="name" required></div>' : ''}
        ${mode !== 'newpass' ? '<div class="field"><label for="l-email">Email<span class="req">*</span></label><input id="l-email" class="input" type="email" name="email" autocomplete="email" inputmode="email" required></div>' : ''}
        ${['signin', 'signup', 'newpass'].includes(mode) ? `<div class="field"><label for="l-pass">${mode === 'newpass' ? 'New password' : 'Password'}<span class="req">*</span></label><input id="l-pass" class="input" type="password" name="password" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" minlength="8" required></div>` : ''}
        <button class="btn" type="submit">${titles[mode]}</button>
      </form>
      <p class="small mt-24 links">
        ${mode !== 'signin' ? '<a href="#/" data-mode="signin">Sign in with password</a>' : ''}
        ${mode !== 'magic' ? '<a href="#/" data-mode="magic">Email me a sign-in link</a>' : ''}
        ${mode !== 'signup' ? '<a href="#/" data-mode="signup">Create an account</a>' : ''}
        ${mode !== 'reset' ? '<a href="#/" data-mode="reset">Forgot password?</a>' : ''}
      </p>
    </div>`;
  root.querySelectorAll<HTMLAnchorElement>('[data-mode]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); loginView(a.dataset.mode as typeof mode); }));
  const form = root.querySelector<HTMLFormElement>('[data-login]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(window as any).ritaForms.validateForm(form)) return;
    const f = new FormData(form);
    const email = String(f.get('email') ?? ''), password = String(f.get('password') ?? '');
    const redirectTo = `${location.origin}${BASE}/studio/`;
    const sb = supabase();
    const btn = form.querySelector('button')!; btn.disabled = true;
    let error: { message: string } | null = null; let note = '';
    if (mode === 'signin') ({ error } = await sb.auth.signInWithPassword({ email, password }));
    if (mode === 'signup') {
      ({ error } = await sb.auth.signUp({ email, password, options: { data: { full_name: String(f.get('name')) }, emailRedirectTo: redirectTo } }));
      note = 'Check your inbox to confirm your email, then sign in.';
    }
    if (mode === 'magic') { ({ error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })); note = 'Check your inbox for a sign-in link.'; }
    if (mode === 'reset') { ({ error } = await sb.auth.resetPasswordForEmail(email, { redirectTo })); note = 'Check your inbox for a reset link.'; }
    if (mode === 'newpass') { ({ error } = await sb.auth.updateUser({ password })); note = 'Password updated.'; }
    btn.disabled = false;
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.className = error ? 'form-error-banner mt-16' : 'form-success mt-16';
    box.textContent = error ? error.message : note;
    form.querySelector('.form-error-banner, .form-success')?.remove();
    if (error || note) form.append(box);
    if (!error && mode === 'newpass') route();
  });
}

// ── Overview ─────────────────────────────────────────────────────────────────
async function homeView() {
  const sb = supabase();
  const subs = sb.from('submissions').select('id,title,status,format,updated_at,author').order('updated_at', { ascending: false }).limit(8);
  const [{ data: list }, { count: waiting }] = await Promise.all([
    staff() ? subs.neq('status', 'draft') : subs.eq('author_id', me!.id),
    sb.from('submissions').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'in_review']),
  ]);
  const mine = me?.role === 'fellow' ? (await sb.from('content').select('collection,slug,data,updated_at').contains('owners', [me.id]).order('updated_at', { ascending: false }).limit(10)).data ?? [] : [];
  shell(`
    <h1 class="h1">Studio</h1>
    <div class="grid g3 mt-32">
      ${staff() ? `<a class="tile" href="#/submissions"><span class="label">Waiting for review</span><span class="big">${waiting ?? 0}</span></a>` : ''}
      <a class="tile" href="${BASE}/submit/new"><span class="label">Write</span><span class="h3">New submission →</span></a>
      ${me?.role !== 'contributor' ? `<a class="tile" href="#/content/${me?.role === 'fellow' ? 'publications' : 'insights'}"><span class="label">Content</span><span class="h3">${staff() ? 'Edit the site →' : 'Edit your work →'}</span></a>` : ''}
    </div>
    <h2 class="h3 mt-48">${staff() ? 'Latest submissions' : 'Your submissions'}</h2>
    ${subTable(list ?? [])}
    ${mine.length ? `<h2 class="h3 mt-48">Your work on the site</h2><ul class="nolist plain">${mine.map((c: any) => `<li><a href="#/edit/${c.collection}/${c.slug}">${esc(c.data.title ?? c.data.name)}</a> <span class="mute small">${esc(COLLECTIONS[c.collection]?.label)}</span></li>`).join('')}</ul>` : ''}
    ${me?.role === 'contributor' ? '<p class="mute mt-32">Fellows and editors can also edit content on the site. Ask an admin to upgrade your account.</p>' : ''}
  `, 'home');
}

function subTable(list: any[]) {
  if (!list.length) return '<p class="mute mt-16">Nothing here yet.</p>';
  return `<table class="table mt-16"><thead><tr><th>Title</th><th>Format</th>${staff() ? '<th>Author</th>' : ''}<th>Status</th><th>Updated</th></tr></thead><tbody>
    ${list.map((s) => `<tr><td><a href="#/submission/${s.id}">${esc(s.title || 'Untitled')}</a></td><td>${FORMAT[s.format] ?? ''}</td>${staff() ? `<td>${esc(s.author)}</td>` : ''}
      <td><span class="status status-${s.status}">${STATUS[s.status] ?? s.status}</span></td><td class="mono small">${date(s.updated_at)}</td></tr>`).join('')}
  </tbody></table>`;
}

// ── Submissions ──────────────────────────────────────────────────────────────
async function submissionsView() {
  const filter = new URLSearchParams(location.hash.split('?')[1] ?? '').get('status') ?? (staff() ? 'open' : 'all');
  let q = supabase().from('submissions').select('id,title,status,format,updated_at,author').order('updated_at', { ascending: false });
  if (!staff()) q = q.eq('author_id', me!.id);
  if (filter === 'open') q = q.in('status', ['submitted', 'in_review', 'changes_requested', 'scheduled']);
  else if (filter !== 'all') q = q.eq('status', filter);
  const { data, error } = await q;
  const chips = [['open', 'Open'], ['all', 'All'], ...Object.entries(STATUS)].filter(([k]) => staff() || k !== 'open');
  shell(`
    <div class="between"><h1 class="h1">${staff() ? 'Submissions' : 'My submissions'}</h1><a class="btn" href="${BASE}/submit/new">New submission +</a></div>
    <div class="chips mt-24">${chips.map(([k, l]) => `<a class="chip ${k === filter ? 'is-on' : ''}" href="#/submissions?status=${k}">${l}</a>`).join('')}</div>
    ${error ? `<div class="form-error-banner mt-16">${esc(error.message)}</div>` : subTable(data ?? [])}
  `, 'submissions');
}

async function submissionView(id: string) {
  const sb = supabase();
  const { data: s, error } = await sb.from('submissions').select('*').eq('id', id).maybeSingle();
  if (error || !s) { shell(`<p class="form-error-banner">Submission not found.</p>`, 'submissions'); return; }
  const { data: comments } = await sb.from('submission_comments').select('*').eq('submission_id', id).order('created_at');
  const ids = [...new Set([s.author_id, ...(comments ?? []).map((c: any) => c.author_id)])];
  const { data: names } = staff() ? await sb.from('profile_names').select('id,full_name,email').in('id', ids) : { data: [] as any[] };
  const who = (uid: string) => (uid === me!.id ? 'You' : (names ?? []).find((n: any) => n.id === uid)?.full_name ?? 'Editor');
  const fileLink = s.file_path ? (await sb.storage.from('submissions').createSignedUrl(s.file_path, 3600)).data?.signedUrl : null;
  const imageUrl = s.image?.path ? (await sb.storage.from('submissions').createSignedUrl(s.image.path, 3600)).data?.signedUrl : null;
  const words = (s.body ?? '').trim() ? s.body.trim().split(/\s+/).length : 0;
  shell(`
    <p><a href="#/submissions" class="link-arrow">← Submissions</a></p>
    <p class="label mute mt-24">${FORMAT[s.format] ?? ''} · ${esc(s.programme)} · <span class="status status-${s.status}">${STATUS[s.status]}</span></p>
    <h1 class="h1 mt-8">${esc(s.title || 'Untitled')}</h1>
    ${s.standfirst ? `<p class="lead mt-16">${esc(s.standfirst)}</p>` : ''}
    <p class="mute mt-16">${esc(s.author)}${s.co_authors?.length ? `, ${esc(s.co_authors.join(', '))}` : ''} · ${words} words · submitted ${date(s.submitted_at) || '—'}</p>
    <div class="with-aside mt-32">
      <div>
        ${imageUrl ? `<figure class="sub-img"><img src="${imageUrl}" alt="${esc(s.image?.alt)}"><figcaption class="small mute">${esc(s.image?.caption)} ${esc(s.image?.credit)}</figcaption></figure>` : ''}
        ${s.body ? `<div class="prose sub-body">${esc(s.body).split(/\n\s*\n/).map((p: string) => `<p>${p}</p>`).join('')}</div>` : '<p class="mute">No text in the editor.</p>'}
        ${fileLink ? `<p class="mt-24"><a class="btn btn-secondary" href="${fileLink}" target="_blank" rel="noopener">Download uploaded file ↗</a></p>` : ''}
        ${s.references_text ? `<h2 class="h3 mt-32">References</h2><pre class="cite-text">${esc(s.references_text)}</pre>` : ''}
        ${s.tags?.length ? `<p class="mt-24 small">Tags: ${esc(s.tags.join(', '))}</p>` : ''}
        ${s.declarations?.coiText ? `<p class="mt-8 small">Conflicts of interest: ${esc(s.declarations.coiText)}</p>` : ''}
      </div>
      <aside class="stack">
        ${staff() ? `
          <div class="box-sand">
            <h2 class="label">Editorial status</h2>
            <select class="select mt-8" data-status aria-label="Status">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}" ${k === s.status ? 'selected' : ''}>${l}</option>`).join('')}</select>
            <button class="btn btn-sm mt-16" data-save-status>Update status</button>
          </div>
          <div class="box-sand">
            <h2 class="label">Publish on the site</h2>
            ${s.published_ref ? `<p class="mt-8">Published as <a href="#/edit/${s.published_ref.replace(':', '/')}">${esc(s.published_ref)}</a>.</p>` : `
            <p class="small mt-8">Creates a draft ${s.format === 'policy-insight' ? 'Policy Insight' : s.format === 'policy-brief' ? 'policy brief' : s.format === 'working-paper' ? 'working paper' : 'blog post'} from this submission for final edits.</p>
            <button class="btn btn-sm mt-16" data-convert>Create draft on site</button>`}
          </div>` : ''}
        ${!staff() && ['draft', 'changes_requested'].includes(s.status) ? `<a class="btn" href="${BASE}/submit/new">Continue editing</a>` : ''}
      </aside>
    </div>
    <section class="mt-48">
      <h2 class="h3">Comments</h2>
      <ol class="nolist comments mt-16">${(comments ?? []).map((c: any) => `<li><p class="label mute">${esc(who(c.author_id))} · ${date(c.created_at)}</p><p>${esc(c.body)}</p></li>`).join('') || '<li class="mute">No comments yet.</li>'}</ol>
      <form class="form mt-16" data-comment><div class="field"><label for="c-body">Add a comment</label><textarea id="c-body" class="textarea" name="body" required data-label="comment"></textarea></div><button class="btn btn-sm" type="submit">Post comment</button></form>
    </section>`, 'submissions');

  root.querySelector('[data-save-status]')?.addEventListener('click', async () => {
    const status = root.querySelector<HTMLSelectElement>('[data-status]')!.value;
    const { error: e } = await sb.from('submissions').update({ status }).eq('id', id);
    e ? flash(e.message, 'error') : (flash('Status updated.'), submissionView(id));
  });
  root.querySelector('[data-convert]')?.addEventListener('click', () => convertSubmission(s));
  root.querySelector<HTMLFormElement>('[data-comment]')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = String(new FormData(e.currentTarget as HTMLFormElement).get('body') ?? '').trim();
    if (!body) return;
    const { error: ce } = await sb.from('submission_comments').insert({ submission_id: id, body });
    ce ? flash(ce.message, 'error') : submissionView(id);
  });
}

async function convertSubmission(s: any) {
  const sb = supabase();
  const year = new Date().getFullYear();
  const ym = new Date().toISOString().slice(0, 7);
  const authorNames = [s.author, ...(s.co_authors ?? [])].filter(Boolean);
  let collection = 'opeds'; let data: Record<string, unknown>;
  const { data: author } = await sb.from('profiles').select('person_slug').eq('id', s.author_id).maybeSingle();
  const nextNumber = async (c: string) => {
    const { data: rows } = await sb.from('content').select('data').eq('collection', c);
    return Math.max(0, ...(rows ?? []).map((r: any) => Number(r.data.number) || 0)) + 1;
  };
  if (s.format === 'policy-insight') {
    collection = 'insights';
    data = { title: s.title, number: await nextNumber('insights'), programme: s.programme || 'IND', year, date: new Date().toISOString().slice(0, 10),
      body: s.body ?? '', topics: s.tags ?? [], ...(author?.person_slug ? { authors: [author.person_slug] } : { authors: [], byline: authorNames.join(', ') }) };
  } else if (s.format === 'policy-brief') {
    collection = 'briefs';
    data = { title: s.title, number: await nextNumber('briefs'), programme: s.programme || 'IND', authors: authorNames, date: ym, issue: s.standfirst, evidence: s.body ?? '', recommendations: [], basedOn: [] };
  } else if (s.format === 'working-paper') {
    collection = 'publications';
    let pdf: string | undefined;
    if (s.file_path) {
      const dest = `working-papers/${s.id}-${s.file_path.split('/').pop()}`;
      const { error: ce } = await sb.storage.from('submissions').copy(s.file_path, dest, { destinationBucket: 'media' });
      if (!ce) pdf = sb.storage.from('media').getPublicUrl(dest).data.publicUrl;
    }
    data = { title: s.title, type: 'working-paper', programmes: s.programme ? [s.programme] : [], authors: authorNames.map((n: string) => n.split(' ').pop()),
      publisher: 'RITA Working Paper', year, summary: s.standfirst, ...(pdf ? { pdf } : {}) };
  } else {
    data = { title: s.title, kind: 'research-blog', outlet: 'RITA', date: ym, authors: authorNames, programme: s.programme || undefined, summary: s.standfirst, body: s.body ?? '' };
  }
  const slug = (collection === 'insights' ? `no-${data.number}-` : '') + slugify(s.title || 'untitled');
  const { error } = await sb.from('content').insert({ collection, slug, data, status: 'draft', owners: [s.author_id] });
  if (error) { flash(error.message, 'error'); return; }
  await sb.from('submissions').update({ status: 'scheduled', published_ref: `${collection}:${slug}` }).eq('id', s.id);
  location.hash = `#/edit/${collection}/${slug}`;
}

// ── Content ──────────────────────────────────────────────────────────────────
async function contentView(collection: string) {
  const conf = COLLECTIONS[collection];
  if (!conf) { location.hash = '#/content/publications'; return; }
  const params = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const term = (params.get('q') ?? '').toLowerCase();
  const onlyMine = params.get('mine') === '1' || me?.role === 'fellow';
  let q = supabase().from('content').select('slug,data,status,updated_at,owners').eq('collection', collection).order('updated_at', { ascending: false });
  if (onlyMine) q = q.contains('owners', [me!.id]);
  const { data, error } = await q;
  const rows = (data ?? []).filter((r: any) => !term || JSON.stringify(r.data).toLowerCase().includes(term));
  shell(`
    <div class="between"><h1 class="h1">${conf.label}</h1>${staff() ? `<a class="btn" href="#/new/${collection}">New ${conf.singular} +</a>` : ''}</div>
    <div class="chips mt-24">${Object.entries(COLLECTIONS).map(([k, c]) => `<a class="chip ${k === collection ? 'is-on' : ''}" href="#/content/${k}">${c.label}</a>`).join('')}</div>
    <form class="row mt-24" data-search role="search">
      <label for="s-q" class="sr-only">Search ${conf.label}</label>
      <input id="s-q" class="input search" name="q" type="search" placeholder="Search ${conf.label.toLowerCase()}…" value="${esc(term)}">
      ${staff() ? `<label class="check"><input type="checkbox" name="mine" value="1" ${onlyMine ? 'checked' : ''}> Only mine</label>` : ''}
      <button class="btn btn-sm btn-secondary">Search</button>
    </form>
    ${error ? `<div class="form-error-banner mt-16">${esc(error.message)}</div>` : rows.length ? `
    <table class="table mt-24"><thead><tr><th>Title</th><th>Status</th><th>Updated</th></tr></thead><tbody>
      ${rows.map((r: any) => `<tr><td><a href="#/edit/${collection}/${r.slug}">${esc(getPath(r.data, conf.titleKey) ?? r.slug)}</a></td>
        <td><span class="status status-${r.status === 'published' ? 'published' : 'draft'}">${r.status}</span></td><td class="mono small">${date(r.updated_at)}</td></tr>`).join('')}
    </tbody></table>` : `<p class="mute mt-24">${me?.role === 'fellow' ? 'Nothing here is linked to your account yet. Ask an admin to link your account to your profile.' : 'Nothing found.'}</p>`}
  `, 'content');
  root.querySelector<HTMLFormElement>('[data-search]')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const p = new URLSearchParams();
    if (f.get('q')) p.set('q', String(f.get('q')));
    if (f.get('mine')) p.set('mine', '1');
    location.hash = `#/content/${collection}${p.toString() ? `?${p}` : ''}`;
  });
}

function fieldHtml(f: Field, value: unknown) {
  const id = `f-${f.key.replace(/\./g, '-')}`;
  const req = f.required ? '<span class="req">*</span>' : '';
  const help = f.help ? `<p class="hint">${esc(f.help)}</p>` : '';
  const label = `<label for="${id}">${esc(f.label)}${req}</label>${help}`;
  const attrs = `id="${id}" name="${f.key}" ${f.required ? 'required' : ''} data-label="${esc(f.label.toLowerCase())}"`;
  switch (f.type) {
    case 'textarea': return `<div class="field">${label}<textarea class="textarea" ${attrs} rows="4">${esc(value)}</textarea></div>`;
    case 'markdown': return `<div class="field">${label}<textarea class="textarea md" ${attrs} rows="18">${esc(value)}</textarea></div>`;
    case 'list': return `<div class="field">${label}<textarea class="textarea" ${attrs} rows="4">${esc(Array.isArray(value) ? value.join('\n') : value)}</textarea></div>`;
    case 'pairs': return `<div class="field">${label}<textarea class="textarea" ${attrs} rows="5">${esc(Array.isArray(value) ? value.map((r: any) => `${r.text} | ${r.why}`).join('\n') : '')}</textarea></div>`;
    case 'number': return `<div class="field">${label}<input class="input" type="number" inputmode="numeric" ${attrs} value="${esc(value)}"></div>`;
    case 'bool': return `<div class="field"><label class="check"><input type="checkbox" id="${id}" name="${f.key}" ${value ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
    case 'select': return `<div class="field">${label}<select class="select" ${attrs}>${(f.options ?? []).map((o) => `<option value="${o}" ${o === (value ?? '') ? 'selected' : ''}>${o || '—'}</option>`).join('')}</select></div>`;
    case 'image': return `<div class="field">${label}<div class="row"><input class="input" type="url" ${attrs} value="${esc(value)}" placeholder="https://…"><label class="btn btn-sm btn-secondary upload">Upload<input type="file" accept="image/*" data-upload="${f.key}" hidden></label></div>${value ? `<img class="thumb" src="${esc(value)}" alt="">` : ''}</div>`;
    default: return `<div class="field">${label}<input class="input" type="${f.type === 'url' ? 'url' : 'text'}" ${attrs} value="${esc(value)}"></div>`;
  }
}

function readField(f: Field, form: HTMLFormElement): unknown {
  const el = form.elements.namedItem(f.key) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (!el) return undefined;
  const v = 'value' in el ? el.value.trim() : '';
  switch (f.type) {
    case 'bool': return (el as HTMLInputElement).checked;
    case 'number': return v === '' ? undefined : Number(v);
    case 'list': return v.split('\n').map((x) => x.trim()).filter(Boolean);
    case 'pairs': return v.split('\n').map((x) => x.trim()).filter(Boolean).map((line) => { const [text, ...why] = line.split('|'); return { text: text.trim(), why: why.join('|').trim() }; });
    default: return v === '' ? undefined : v;
  }
}

async function editView(collection: string, slug: string | null) {
  const conf = COLLECTIONS[collection];
  const sb = supabase();
  let row: any = { data: {}, status: 'draft', owners: [] };
  if (slug) {
    const { data } = await sb.from('content').select('*').eq('collection', collection).eq('slug', slug).maybeSingle();
    if (!data) { shell('<p class="form-error-banner">Not found, or you do not have access.</p>', 'content'); return; }
    row = data;
  }
  const canEdit = staff() || row.owners?.includes(me!.id);
  const known = new Set(conf.fields.map((f) => f.key.split('.')[0]));
  const extra = Object.fromEntries(Object.entries(row.data).filter(([k]) => !known.has(k)));
  const live = row.status === 'published' && slug ? publicUrl(collection, slug) : null;
  shell(`
    <p><a href="#/content/${collection}" class="link-arrow">← ${conf.label}</a></p>
    <div class="between mt-24"><h1 class="h1">${slug ? esc(getPath(row.data, conf.titleKey) ?? slug) : `New ${conf.singular}`}</h1>
      ${live ? `<a class="link-arrow" href="${live}" target="_blank" rel="noopener">View on site ↗</a>` : ''}</div>
    ${!canEdit ? '<div class="box-sand mt-16">You can view this item but not edit it.</div>' : ''}
    <form class="form edit mt-32" data-edit novalidate>
      <div data-error-summary hidden></div>
      ${!slug ? `<div class="field"><label for="f-slug">Web address (slug)<span class="req">*</span></label><p class="hint">Lower case, words joined with hyphens. Filled from the title.</p><input class="input" id="f-slug" name="__slug" required data-label="slug" pattern="[a-z0-9-]+"></div>` : ''}
      ${conf.fields.map((f) => fieldHtml(f, getPath(row.data, f.key))).join('')}
      <details class="adv"><summary>Advanced: other fields (JSON)</summary>
        <div class="field mt-16"><label for="f-extra">Fields not shown above</label><textarea id="f-extra" class="textarea mono" name="__extra" rows="8">${esc(JSON.stringify(extra, null, 2))}</textarea></div>
      </details>
      ${staff() ? `<fieldset class="field"><legend>Visibility</legend>
        <label class="check"><input type="radio" name="__status" value="published" ${row.status === 'published' ? 'checked' : ''}> Published (live after the next website publish)</label>
        <label class="check"><input type="radio" name="__status" value="draft" ${row.status !== 'published' ? 'checked' : ''}> Draft (hidden from the website)</label></fieldset>` : ''}
      ${canEdit ? `<div class="row"><button class="btn" type="submit">Save</button>${admin() && slug ? '<button type="button" class="btn btn-secondary" data-delete>Delete</button>' : ''}</div>` : ''}
      <p class="small mute">${slug ? `Last saved ${date(row.updated_at)}. Every save is kept in the history.` : ''} ${staff() ? 'Saved changes appear on the website after <strong>Publish website</strong>.' : 'An editor publishes your changes to the website.'}</p>
    </form>`, 'content');

  const form = root.querySelector<HTMLFormElement>('[data-edit]')!;
  if (!canEdit) form.querySelectorAll('input,textarea,select').forEach((el) => ((el as HTMLInputElement).disabled = true));
  const titleInput = form.elements.namedItem(conf.titleKey) as HTMLInputElement | null;
  const slugInput = form.elements.namedItem('__slug') as HTMLInputElement | null;
  if (slugInput && titleInput) titleInput.addEventListener('input', () => { if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value); });
  slugInput?.addEventListener('input', () => (slugInput.dataset.touched = '1'));

  form.querySelectorAll<HTMLInputElement>('[data-upload]').forEach((inp) => inp.addEventListener('change', async () => {
    const file = inp.files?.[0]; if (!file) return;
    const path = `${collection}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const { error } = await sb.storage.from('media').upload(path, file);
    if (error) { flash(error.message, 'error'); return; }
    (form.elements.namedItem(inp.dataset.upload!) as HTMLInputElement).value = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    flash('Image uploaded. Save to keep it.');
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(window as any).ritaForms.validateForm(form)) return;
    let extraData: Record<string, unknown> = {};
    try { extraData = JSON.parse((form.elements.namedItem('__extra') as HTMLTextAreaElement).value || '{}'); }
    catch { flash('The advanced JSON is not valid.', 'error'); return; }
    const data: Record<string, unknown> = { ...row.data, ...extraData };
    for (const f of conf.fields) setPath(data, f.key, readField(f, form));
    if (conf.titleKey !== 'title') data.title = data[conf.titleKey];
    const status = (form.querySelector<HTMLInputElement>('[name="__status"]:checked')?.value) ?? row.status;
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!; btn.disabled = true; btn.textContent = 'Saving…';
    let error: { message: string } | null = null; let count = 0;
    if (slug) {
      const res = await sb.from('content').update(staff() ? { data, status } : { data }).eq('collection', collection).eq('slug', slug).select('id');
      error = res.error; count = res.data?.length ?? 0;
    } else {
      const newSlug = slugInput!.value.trim();
      const res = await sb.from('content').insert({ collection, slug: newSlug, data, status }).select('id');
      error = res.error; count = res.data?.length ?? 0;
      if (!error) { location.hash = `#/edit/${collection}/${newSlug}`; flash('Created.'); return; }
    }
    btn.disabled = false; btn.textContent = 'Save';
    if (error) flash(error.message, 'error');
    else if (!count) flash('Not saved: you do not have permission to edit this item.', 'error');
    else { flash('Saved.'); row = { ...row, data, status }; }
  });
  root.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!confirm('Delete this item permanently? It disappears from the website at the next publish.')) return;
    const { error } = await sb.from('content').delete().eq('collection', collection).eq('slug', slug!);
    error ? flash(error.message, 'error') : (location.hash = `#/content/${collection}`);
  });
}

function publicUrl(collection: string, slug: string) {
  const path: Record<string, string> = { publications: '/research/publications/', insights: '/insights/', briefs: '/policy/briefs/', projects: '/research/projects/', people: '/fellows/', events: '/insights/events/', jobs: '/about/opportunities/', opeds: '/insights/op-eds/', programmes: '/research/' };
  return path[collection] ? `${BASE}${path[collection]}${slug}` : null;
}

// ── Users (admin) ────────────────────────────────────────────────────────────
async function usersView() {
  if (!admin()) { location.hash = '#/'; return; }
  const sb = supabase();
  const [{ data: users }, { data: people }] = await Promise.all([
    sb.from('profiles').select('*').order('created_at'),
    sb.from('content').select('slug,data').eq('collection', 'people'),
  ]);
  shell(`
    <h1 class="h1">Users</h1>
    <p class="mute mt-8">People create their own account at this page. Set their role here. Link fellows to their profile, then press <strong>Link work</strong> to let them edit everything they authored.</p>
    <table class="table mt-24 users"><thead><tr><th>Name</th><th>Role</th><th>Profile on site</th><th>Surname in author lists</th><th></th></tr></thead><tbody>
      ${(users ?? []).map((u: any) => `<tr data-user="${u.id}">
        <td><strong>${esc(u.full_name)}</strong><br><span class="small mute">${esc(u.email)}</span></td>
        <td><select class="select" name="role" aria-label="Role">${ROLES.map((r) => `<option ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
        <td><select class="select" name="person_slug" aria-label="Profile"><option value="">—</option>${(people ?? []).map((p: any) => `<option value="${p.slug}" ${p.slug === u.person_slug ? 'selected' : ''}>${esc(p.data.name)}</option>`).join('')}</select></td>
        <td><input class="input" name="author_key" value="${esc(u.author_key)}" aria-label="Surname in author lists"></td>
        <td class="row"><button class="btn btn-sm" data-save>Save</button><button class="btn btn-sm btn-secondary" data-claim>Link work</button></td>
      </tr>`).join('')}
    </tbody></table>`, 'users');
  root.querySelectorAll<HTMLTableRowElement>('[data-user]').forEach((tr) => {
    const id = tr.dataset.user!;
    const val = (n: string) => (tr.querySelector(`[name="${n}"]`) as HTMLInputElement).value || null;
    tr.querySelector('[data-save]')!.addEventListener('click', async () => {
      const personSlug = val('person_slug');
      const person = (people ?? []).find((p: any) => p.slug === personSlug);
      const { error } = await sb.from('profiles').update({ role: val('role'), person_slug: personSlug, author_key: val('author_key') ?? person?.data.authorKey ?? null }).eq('id', id);
      error ? flash(error.message, 'error') : (flash('User saved.'), usersView());
    });
    tr.querySelector('[data-claim]')!.addEventListener('click', async () => {
      const { data, error } = await sb.rpc('claim_authored_content', { target: id });
      error ? flash(error.message, 'error') : flash(`${data} items linked to this account.`);
    });
  });
}

// ── Account ──────────────────────────────────────────────────────────────────
function accountView() {
  shell(`
    <h1 class="h1">Account</h1>
    <form class="form mt-32 narrow" data-account>
      <div class="field"><label for="a-name">Full name</label><input id="a-name" class="input" name="full_name" value="${esc(me?.full_name)}" autocomplete="name"></div>
      <div class="field"><label for="a-pass">New password</label><p class="hint">Leave empty to keep your current password.</p><input id="a-pass" class="input" type="password" name="password" minlength="8" autocomplete="new-password"></div>
      <button class="btn" type="submit">Save</button>
    </form>`, '');
  root.querySelector<HTMLFormElement>('[data-account]')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const sb = supabase();
    const { error } = await sb.from('profiles').update({ full_name: String(f.get('full_name')) }).eq('id', me!.id);
    const pass = String(f.get('password') ?? '');
    const res = pass ? await sb.auth.updateUser({ password: pass }) : { error: null };
    error || res.error ? flash((error ?? res.error)!.message, 'error') : (flash('Saved.'), loadProfile());
  });
}

// ── Router ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  const { data } = await supabase().from('profiles').select('*').eq('id', session!.user.id).maybeSingle();
  me = (data as Profile) ?? { id: session!.user.id, email: session!.user.email ?? null, full_name: null, role: 'contributor', person_slug: null, author_key: null };
}

let recovering = false;
async function route() {
  if (!session) { loginView(recovering ? 'newpass' : 'signin'); return; }
  if (recovering) { loginView('newpass'); recovering = false; return; }
  if (!me) await loadProfile();
  const next = new URLSearchParams(location.search).get('next');
  if (next && next.startsWith('/')) { location.href = `${BASE}${next}`; return; }
  const [, a, b, c] = (location.hash.split('?')[0] || '#/').split('/');
  root.setAttribute('aria-busy', 'true');
  try {
    if (a === 'submissions') await submissionsView();
    else if (a === 'submission' && b) await submissionView(b);
    else if (a === 'content') await contentView(b || 'publications');
    else if (a === 'edit' && b && c) await editView(b, decodeURIComponent(c));
    else if (a === 'new' && b && staff()) await editView(b, null);
    else if (a === 'users') await usersView();
    else if (a === 'account') accountView();
    else await homeView();
  } catch (err) {
    shell(`<div class="form-error-banner">Something went wrong: ${esc((err as Error).message)}</div>`);
  } finally {
    root.removeAttribute('aria-busy');
    root.querySelector<HTMLElement>('h1')?.focus?.();
  }
}

if (!SUPABASE_ENABLED) {
  root.innerHTML = `<div class="tbc-block"><strong>Back-end not connected</strong>Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY, then rebuild. See README “Back-end”.</div>`;
} else {
  const sb = supabase();
  sb.auth.onAuthStateChange((event, s) => {
    session = s;
    if (event === 'PASSWORD_RECOVERY') recovering = true;
    if (event === 'SIGNED_OUT') me = null;
    if (['SIGNED_IN', 'SIGNED_OUT', 'PASSWORD_RECOVERY', 'INITIAL_SESSION'].includes(event)) route();
  });
  window.addEventListener('hashchange', () => route());
}
