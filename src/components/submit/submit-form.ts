// /submit/new behaviour: 4-step wizard, live counters, co-authors, conditional requirements,
// autosave (localStorage + API stub), preview and submit. Validation reuses scripts/forms.ts.
import { validateForm, validateField, wordCount, fieldsOf } from '../../scripts/forms';
import { saveDraft, submitForReview, FORMAT_LABEL, WORD_LIMITS, type Submission, type SubmissionFormat } from '../../lib/api/submissions';
import { escapeHtml } from '../../scripts/site';

const form = document.querySelector<HTMLFormElement>('[data-submission-form]');
if (form) init(form);

function init(form: HTMLFormElement) {
  const AUTOSAVE_KEY = 'rita-autosave:submission';
  const ID_KEY = 'rita-submission-current';
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  const items = [...document.querySelectorAll<HTMLElement>('[data-stepper-item]')];
  const nav = form.querySelector<HTMLElement>('[data-step-nav]')!;
  const prevBtn = nav.querySelector<HTMLButtonElement>('[data-prev]')!;
  const nextBtn = nav.querySelector<HTMLButtonElement>('[data-next]')!;
  const el = <T extends HTMLElement>(sel: string) => form.querySelector<T>(sel)!;
  const body = el<HTMLTextAreaElement>('#body');
  const file = el<HTMLInputElement>('#file');
  const image = el<HTMLInputElement>('#image');
  const status = el<HTMLElement>('[data-autosave-status]');
  const coList = el<HTMLElement>('[data-coauthors]');
  const coInput = el<HTMLInputElement>('#coauthor-input');
  let current = 1;
  let coAuthors: string[] = [];
  let savedAt = 0;
  let draftId: string | undefined;
  try { draftId = localStorage.getItem(ID_KEY) ?? undefined; } catch { /* ignore */ }

  // ---- Wizard ----------------------------------------------------------
  form.classList.add('js-steps');
  nav.hidden = false;
  form.querySelectorAll<HTMLElement>('[data-preview], [data-save-draft], [data-add-coauthor]').forEach((b) => (b.hidden = false));

  function show(n: number, focus = true) {
    current = Math.min(Math.max(n, 1), steps.length);
    steps.forEach((s, i) => (s.hidden = i + 1 !== current));
    items.forEach((li, i) => {
      if (i + 1 === current) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      if (i + 1 < current) li.dataset.done = ''; else delete li.dataset.done;
    });
    prevBtn.hidden = current === 1;
    nextBtn.hidden = current === steps.length;
    if (current === steps.length) renderReview();
    if (focus) {
      const h = steps[current - 1].querySelector<HTMLElement>('h2')!;
      h.tabIndex = -1;
      h.focus();
      window.scrollTo({ top: Math.max(0, form.getBoundingClientRect().top + window.scrollY - 120) });
    }
  }
  const validStep = (n: number) => validateForm(form, steps[n - 1]);
  nextBtn.addEventListener('click', () => { if (validStep(current)) show(current + 1); });
  prevBtn.addEventListener('click', () => show(current - 1));
  document.querySelectorAll<HTMLAnchorElement>('[data-goto]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = Number(a.dataset.goto);
    // Forward moves require every step in between to be valid.
    for (let s = current; s < target; s++) if (!validStep(s)) { show(s, false); return; }
    show(target);
  }));

  // ---- Format-dependent rules ------------------------------------------
  const format = () => (form.querySelector<HTMLInputElement>('input[name="format"]:checked')?.value ?? 'policy-insight') as SubmissionFormat;
  function applyFormat() {
    const f = format();
    const limit = WORD_LIMITS[f];
    const hint = el<HTMLElement>('[data-body-hint]');
    const fileLabel = el<HTMLElement>('[data-file-label]');
    const fileHint = el<HTMLElement>('[data-file-hint]');
    const isPaper = f === 'working-paper';
    hint.textContent = limit ? `(${limit[0]}–${limit[1].toLocaleString('en-GB')} words for a ${FORMAT_LABEL[f]})` : f === 'policy-brief' ? '(4 pages for a policy brief)' : '(optional for a working paper: upload the PDF below)';
    fileLabel.innerHTML = isPaper ? 'Upload your working paper (PDF)<span class="req">*</span>' : 'Or upload a file (.docx or PDF)';
    fileHint.textContent = isPaper ? 'Working papers are submitted as a PDF.' : 'If you upload a file, you can leave the body empty.';
    file.required = isPaper;
    if (isPaper) file.dataset.pdf = ''; else delete file.dataset.pdf;
    file.accept = isPaper ? '.pdf,application/pdf' : '.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    body.required = !isPaper && !file.files?.length;
    el<HTMLElement>('[data-body-field] .req').hidden = !body.required;
    updateWordCount();
  }

  // ---- Counters ----------------------------------------------------------
  function updateCounters() {
    form.querySelectorAll<HTMLElement>('[data-count-chars]').forEach((c) => {
      const f = el<HTMLInputElement>(`#${c.dataset.countChars}`);
      const max = Number(c.dataset.max);
      c.textContent = `${f.value.length} / ${max} characters`;
      c.classList.toggle('over', f.value.length > max);
    });
    form.querySelectorAll<HTMLElement>('[data-count-words]').forEach((c) => {
      const f = el<HTMLTextAreaElement>(`#${c.dataset.countWords}`);
      const max = Number(c.dataset.max);
      const n = wordCount(f.value);
      c.textContent = `${n} / ${max} words`;
      c.classList.toggle('over', n > max);
    });
  }
  function updateWordCount() {
    const wc = el<HTMLElement>('[data-wordcount]');
    const n = wordCount(body.value);
    const limit = WORD_LIMITS[format()];
    wc.classList.remove('warn', 'ok');
    if (!limit) { wc.textContent = `${n.toLocaleString('en-GB')} words`; return; }
    wc.textContent = `${n.toLocaleString('en-GB')} / ${limit[0]}–${limit[1].toLocaleString('en-GB')} words`;
    if (n > limit[1] || (n > 0 && n < limit[0])) wc.classList.add('warn'); else if (n) wc.classList.add('ok');
  }

  // ---- Co-authors --------------------------------------------------------
  function renderCoAuthors() {
    coList.innerHTML = coAuthors.map((c, i) => `<li><button type="button" data-remove="${i}" aria-label="Remove co-author ${escapeHtml(c)}">${escapeHtml(c)} <span aria-hidden="true">✕</span></button></li>`).join('');
  }
  function addCoAuthor() {
    const v = coInput.value.trim();
    if (!v) return;
    v.split(/[,;]/).map((x) => x.trim()).filter(Boolean).forEach((x) => { if (!coAuthors.includes(x)) coAuthors.push(x); });
    coInput.value = '';
    renderCoAuthors();
    queueSave();
    coInput.focus();
  }
  el<HTMLButtonElement>('[data-add-coauthor]').addEventListener('click', addCoAuthor);
  coInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addCoAuthor(); } });
  coList.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-remove]');
    if (!b) return;
    coAuthors.splice(Number(b.dataset.remove), 1);
    renderCoAuthors();
    queueSave();
    coInput.focus();
  });

  // ---- Image: preview + conditional requirements -------------------------
  function applyImage() {
    const has = Boolean(image.files?.length);
    form.querySelectorAll<HTMLInputElement>('[data-image-dependent]').forEach((f) => (f.required = has));
    const img = el<HTMLImageElement>('[data-image-preview]');
    if (has && image.files![0].type.startsWith('image/')) {
      img.src = URL.createObjectURL(image.files![0]);
      img.alt = 'Preview of the selected header image';
      img.hidden = false;
    } else img.hidden = true;
  }
  image.addEventListener('change', applyImage);
  file.addEventListener('change', applyFormat);

  // ---- Blur validation (mirrors scripts/forms.ts for this form) -----------
  form.addEventListener('focusout', (e) => {
    const f = e.target as HTMLInputElement;
    if (!f.name || f.type === 'submit' || f.type === 'button') return;
    if (f.value || f.getAttribute('aria-invalid')) showError(f, validateField(f));
  });
  form.addEventListener('change', (e) => {
    const f = e.target as HTMLInputElement;
    if (f.getAttribute('aria-invalid') || f.type === 'checkbox' || f.type === 'file') showError(f, validateField(f));
  });
  function showError(f: HTMLInputElement, msg: string | null) {
    const wrap = f.closest('.field') ?? f.parentElement!;
    const id = `${f.id || f.name}-error`;
    let p = document.getElementById(id);
    if (msg) {
      if (!p) { p = document.createElement('p'); p.id = id; p.className = 'field-error'; wrap.appendChild(p); }
      p.textContent = msg;
      f.setAttribute('aria-invalid', 'true');
      if (!(f.getAttribute('aria-describedby') ?? '').includes(id)) f.setAttribute('aria-describedby', `${f.getAttribute('aria-describedby') ?? ''} ${id}`.trim());
    } else {
      p?.remove();
      f.removeAttribute('aria-invalid');
      const rest = (f.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== id);
      if (rest.length) f.setAttribute('aria-describedby', rest.join(' ')); else f.removeAttribute('aria-describedby');
    }
  }

  // ---- Collect + autosave -----------------------------------------------
  function collect(): Partial<Submission> {
    const v = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value?.trim() ?? '';
    const checked = (id: string) => el<HTMLInputElement>(`#${id}`).checked;
    return {
      id: draftId,
      format: format(),
      programme: v('programme'),
      title: v('title'),
      standfirst: v('standfirst'),
      author: v('author'),
      coAuthors: [...coAuthors],
      tags: v('tags').split(',').map((t) => t.trim()).filter(Boolean),
      body: body.value,
      file: file.files?.[0]?.name,
      references: v('references'),
      images: image.files?.length ? [{ file: image.files[0].name, caption: v('imageCaption'), credit: v('imageCredit'), alt: v('imageAlt'), rightsConfirmed: checked('rights') }] : [],
      declarations: { original: checked('decl-original'), coi: checked('decl-coi'), coiText: v('coiText'), editingConsent: checked('decl-editing') },
    };
  }
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null') as Record<string, string | string[]> | null;
      if (!saved) return;
      for (const f of fieldsOf(form)) {
        if (f.type === 'file' || !(f.name in saved)) continue;
        if (f instanceof HTMLInputElement && (f.type === 'checkbox' || f.type === 'radio')) f.checked = ([] as string[]).concat(saved[f.name]).includes(f.value);
        else f.value = String(saved[f.name]);
      }
      coAuthors = ([] as string[]).concat(saved.__coAuthors ?? []);
      savedAt = Number(saved.__at ?? 0);
    } catch { /* ignore */ }
  }
  function persistLocal() {
    const out: Record<string, string | string[] | number> = {};
    for (const f of fieldsOf(form)) {
      if (f.type === 'file') continue;
      if (f instanceof HTMLInputElement && (f.type === 'checkbox' || f.type === 'radio')) { if (f.checked) out[f.name] = f.value; }
      else out[f.name] = f.value;
    }
    out.__coAuthors = coAuthors;
    out.__at = Date.now();
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(out)); } catch { /* ignore */ }
  }
  async function save(manual = false) {
    persistLocal();
    try {
      const s = await saveDraft(collect());
      draftId = s.id;
      try { localStorage.setItem(ID_KEY, s.id); } catch { /* ignore */ }
      savedAt = Date.now();
      renderSaved();
      if (manual) el<HTMLElement>('[data-draft-msg]').textContent = 'Draft saved. You can find it under My submissions.';
    } catch {
      if (manual) el<HTMLElement>('[data-draft-msg]').textContent = 'Something went wrong. Your draft was kept in this browser only.';
    }
  }
  let saveTimer: number | undefined;
  function queueSave() { window.clearTimeout(saveTimer); saveTimer = window.setTimeout(() => save(), 800); }
  function ago(ms: number) {
    const s = Math.round(ms / 1000);
    if (s < 45) return 'just now';
    const m = Math.round(s / 60);
    if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
    const h = Math.round(m / 60);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  function renderSaved() { if (savedAt) status.textContent = `Draft autosaved ${ago(Date.now() - savedAt)}`; }
  window.setInterval(renderSaved, 30000);

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t === body) updateWordCount();
    updateCounters();
    queueSave();
  });
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'format') applyFormat();
    queueSave();
  });
  el<HTMLButtonElement>('[data-save-draft]').addEventListener('click', () => save(true));

  // ---- Review + preview --------------------------------------------------
  // Programme names come from the <select> so this client bundle never imports astro:content.
  const programmeName = () => { const sel = el<HTMLSelectElement>('#programme'); return sel.value ? sel.selectedOptions[0].text : ''; };

  function renderReview() {
    const d = collect();
    const rows: [string, string][] = [
      ['Format', FORMAT_LABEL[d.format!]],
      ['Programme', programmeName() || '—'],
      ['Title', d.title || '—'],
      ['Standfirst', d.standfirst || '—'],
      ['Co-authors', d.coAuthors?.join(', ') || '—'],
      ['Tags', d.tags?.join(', ') || '—'],
      ['Content', d.file ? `File: ${d.file}${d.body ? ` + ${wordCount(d.body ?? '')} words in the editor` : ''}` : `${wordCount(d.body ?? '')} words`],
      ['Header image', d.images?.length ? `${d.images[0].file} (credit: ${d.images[0].credit || '—'})` : 'None'],
    ];
    const dl = el<HTMLElement>('[data-review]');
    dl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    dl.hidden = false;
  }
  el<HTMLButtonElement>('[data-preview]').addEventListener('click', () => {
    const d = collect();
    const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
    q('[data-pv-label]').textContent = `Preview · ${FORMAT_LABEL[d.format!]}${d.programme ? ` · ${programmeName()}` : ''}`;
    q('[data-pv-title]').textContent = d.title || 'Untitled';
    q('[data-pv-standfirst]').textContent = d.standfirst ?? '';
    q('[data-pv-author]').textContent = [d.author, ...(d.coAuthors ?? [])].filter(Boolean).join(', ');
    q('[data-pv-body]').innerHTML = renderMarkdown(d.body ?? '') || `<p class="mute">${d.file ? `Uploaded file: ${escapeHtml(d.file)}` : 'No body text yet.'}</p>`;
  });

  // ---- Submit -------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.querySelector('.form-error-banner')?.remove();
    for (let s = 1; s <= steps.length; s++) {
      steps[s - 1].hidden = false;
      const ok = validStep(s);
      if (!ok) { show(s, false); return; }
    }
    show(current, false);
    validateForm(form, steps[steps.length - 1]); // clears the summary
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    try {
      const files = new FormData();
      if (file.files?.[0]) files.set('file', file.files[0]);
      if (image.files?.[0]) files.set('image', image.files[0]);
      const s = await submitForReview(collect(), files);
      try { localStorage.removeItem(AUTOSAVE_KEY); localStorage.removeItem(ID_KEY); } catch { /* ignore */ }
      location.href = `/submit/dashboard?submitted=${encodeURIComponent(s.id)}`;
    } catch {
      const banner = document.createElement('div');
      banner.className = 'form-error-banner';
      banner.setAttribute('role', 'alert');
      banner.tabIndex = -1;
      banner.innerHTML = 'Something went wrong. Your submission was not sent. Your draft is saved; try again or email <a href="mailto:editor@rita.africa">editor@rita.africa</a>.';
      form.prepend(banner);
      banner.focus();
      btn.disabled = false;
      btn.textContent = label;
      form.removeAttribute('aria-busy');
    }
  });

  restore();
  renderCoAuthors();
  applyFormat();
  applyImage();
  updateCounters();
  renderSaved();
  const fromHash = Number(location.hash.match(/^#step-(\d)$/)?.[1] ?? 1);
  show(fromHash, false);
}

/** Minimal, safe markdown for the preview: ## headings, - lists, paragraphs, [text](https://link). */
function renderMarkdown(src: string) {
  const inline = (s: string) => escapeHtml(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  return src.trim().split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return '';
    if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
    if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`;
    if (b.startsWith('> ')) return `<blockquote>${inline(b.replace(/^>\s?/gm, ''))}</blockquote>`;
    if (/^[-*] /m.test(b) && b.split('\n').every((l) => /^[-*] /.test(l))) return `<ul>${b.split('\n').map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
    return `<p>${inline(b).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
