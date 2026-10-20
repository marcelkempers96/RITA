// Shared form behaviour (BUILD-SPEC §6, wireframe 26). Applies to every <form data-form="name" novalidate>.
// Validation on blur and on submit · error summary at the top (focused, links to each field) · aria-invalid ·
// "Sending…" state with 15s timeout · success replaces the form · server error keeps the user's input · honeypot.
//
// Field attributes: required, type="email", minlength, maxlength, data-label="email address",
// data-message="custom text", data-max-words="40", data-max-mb="5", data-pdf (PDF only).
// Form attributes: data-success-title, data-success-text, data-custom-success (page handles the
// `rita:form-success` event itself), data-autosave="key" (persist to localStorage).
import { sendForm } from '../lib/api/forms';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function labelOf(f: Field) {
  if (f.dataset.label) return f.dataset.label;
  const l = f.id ? document.querySelector(`label[for="${f.id}"]`) : null;
  return (l?.textContent ?? f.name).replace('*', '').trim().toLowerCase();
}

export function validateField(f: Field): string | null {
  if (f.disabled || f.closest('[hidden]') || f.closest('.hp')) return null;
  const label = labelOf(f);
  if (f instanceof HTMLInputElement && f.type === 'checkbox') {
    return f.required && !f.checked ? f.dataset.message ?? 'Tick the box to continue' : null;
  }
  if (f instanceof HTMLInputElement && f.type === 'radio') {
    const group = f.form?.querySelectorAll<HTMLInputElement>(`input[name="${f.name}"]`);
    return f.required && group && ![...group].some((r) => r.checked) ? f.dataset.message ?? `Select ${label}` : null;
  }
  if (f instanceof HTMLInputElement && f.type === 'file') {
    const file = f.files?.[0];
    if (!file) return f.required ? f.dataset.message ?? `Upload your ${label}` : null;
    const maxMb = Number(f.dataset.maxMb || 0);
    if (f.dataset.pdf !== undefined && file.type !== 'application/pdf') return `The file must be a PDF${maxMb ? ` smaller than ${maxMb}MB` : ''}`;
    if (maxMb && file.size > maxMb * 1024 * 1024) return f.dataset.pdf !== undefined ? `The file must be a PDF smaller than ${maxMb}MB` : `The file must be smaller than ${maxMb}MB`;
    return null;
  }
  const v = f.value.trim();
  if (!v) return f.required ? f.dataset.message ?? `${f instanceof HTMLSelectElement ? 'Select' : 'Enter'} your ${label}` : null;
  if (f instanceof HTMLInputElement && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address';
  const min = Number(f.getAttribute('minlength') || 0);
  if (min && v.length < min) return `${cap(label)} must be at least ${min} characters`;
  const max = Number(f.getAttribute('data-maxlength') || 0);
  if (max && v.length > max) return `${cap(label)} must be ${max} characters or fewer`;
  const maxWords = Number(f.dataset.maxWords || 0);
  if (maxWords && wordCount(v) > maxWords) return `${cap(label)} must be ${maxWords} words or fewer`;
  return null;
}

function showFieldError(f: Field, msg: string | null) {
  const wrap = f.closest('.field') ?? f.parentElement!;
  const id = `${f.id || f.name}-error`;
  let el = document.getElementById(id);
  if (msg) {
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'field-error';
      wrap.appendChild(el);
    }
    el.textContent = msg;
    f.setAttribute('aria-invalid', 'true');
    const describedby = new Set((f.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
    describedby.add(id);
    f.setAttribute('aria-describedby', [...describedby].join(' '));
  } else {
    el?.remove();
    f.removeAttribute('aria-invalid');
    const rest = (f.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== id);
    rest.length ? f.setAttribute('aria-describedby', rest.join(' ')) : f.removeAttribute('aria-describedby');
  }
}

export function fieldsOf(form: HTMLFormElement) {
  return [...form.querySelectorAll<Field>('input, select, textarea')].filter((f) => f.type !== 'hidden' && f.type !== 'submit' && f.name);
}

/** Validates the whole form (or a step), renders the error summary. Returns true when valid. */
export function validateForm(form: HTMLFormElement, scope: ParentNode = form): boolean {
  const errors: { f: Field; msg: string }[] = [];
  const seenRadio = new Set<string>();
  for (const f of fieldsOf(form)) {
    if (!scope.contains(f)) continue;
    if (f.type === 'radio') { if (seenRadio.has(f.name)) continue; seenRadio.add(f.name); }
    const msg = validateField(f);
    showFieldError(f, msg);
    if (msg) errors.push({ f, msg });
  }
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  if (summary) {
    if (errors.length) {
      summary.className = 'error-summary';
      summary.setAttribute('role', 'alert');
      summary.tabIndex = -1;
      summary.innerHTML = `<h2>There ${errors.length === 1 ? 'is 1 problem' : `are ${errors.length} problems`} with your form</h2><ul>${errors
        .map((e) => `<li><a href="#${e.f.id}">${e.msg}</a></li>`).join('')}</ul>`;
      summary.hidden = false;
      summary.focus();
      summary.querySelectorAll('a').forEach((a) => a.addEventListener('click', (ev) => {
        ev.preventDefault();
        document.getElementById(a.getAttribute('href')!.slice(1))?.focus();
      }));
    } else {
      summary.hidden = true;
      summary.innerHTML = '';
    }
  }
  return errors.length === 0;
}

function enhance(form: HTMLFormElement) {
  if (form.dataset.enhanced) return;
  form.dataset.enhanced = '1';
  const name = form.dataset.form!;

  // Prefill from the query string (?email=… from the no-JS newsletter band, ?type=… on Contact).
  const params = new URLSearchParams(location.search);
  for (const f of fieldsOf(form)) {
    const v = params.get(f.name);
    if (v && f.type !== 'checkbox' && f.type !== 'file' && !f.value) f.value = v;
  }

  // Autosave
  const key = form.dataset.autosave ? `rita-autosave:${form.dataset.autosave}` : '';
  if (key) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) for (const f of fieldsOf(form)) {
        if (!(f.name in saved) || f.type === 'file') continue;
        if (f instanceof HTMLInputElement && (f.type === 'checkbox' || f.type === 'radio')) f.checked = ([] as string[]).concat(saved[f.name]).includes(f.value);
        else f.value = saved[f.name];
      }
    } catch { /* ignore */ }
    let t: number | undefined;
    form.addEventListener('input', () => { window.clearTimeout(t); t = window.setTimeout(() => saveDraft(form, key), 600); });
  }

  form.addEventListener('focusout', (e) => {
    const f = e.target as Field;
    if (!f.name || f.type === 'submit') return;
    // Only validate on blur once the user has typed something, or after a failed submit.
    if (f.value || form.dataset.submitted || f.getAttribute('aria-invalid')) showFieldError(f, validateField(f));
  });
  form.addEventListener('change', (e) => {
    const f = e.target as Field;
    if (f.getAttribute('aria-invalid') || f.type === 'checkbox' || f.type === 'file') showFieldError(f, validateField(f));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.dataset.submitted = '1';
    form.querySelector('.form-error-banner')?.remove();
    if (!validateForm(form)) return;

    const data = new FormData(form);
    // Honeypot: bots fill the hidden "website" field. Pretend success.
    if (String(data.get('website') ?? '')) return succeed(form, data);

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]:not([formnovalidate])');
    const label = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    form.setAttribute('aria-busy', 'true');
    try {
      await sendForm(name, data);
      if (key) try { localStorage.removeItem(key); } catch { /* ignore */ }
      succeed(form, data);
    } catch {
      const banner = document.createElement('div');
      banner.className = 'form-error-banner';
      banner.setAttribute('role', 'alert');
      banner.tabIndex = -1;
      banner.innerHTML = 'Something went wrong. Your message was not sent. Try again or email <a href="mailto:info@rita.africa">info@rita.africa</a>.';
      form.prepend(banner);
      banner.focus();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label ?? 'Submit'; }
      form.removeAttribute('aria-busy');
    }
  });
}

function saveDraft(form: HTMLFormElement, key: string) {
  const out: Record<string, string | string[]> = {};
  for (const f of fieldsOf(form)) {
    if (f.type === 'file' || f.closest('.hp')) continue;
    if (f instanceof HTMLInputElement && (f.type === 'checkbox' || f.type === 'radio')) {
      if (!f.checked) continue;
      out[f.name] = f.name in out ? ([] as string[]).concat(out[f.name], f.value) : f.value;
    } else out[f.name] = f.value;
  }
  try {
    localStorage.setItem(key, JSON.stringify(out));
    form.dispatchEvent(new CustomEvent('rita:autosaved', { detail: { at: Date.now() } }));
  } catch { /* ignore */ }
}

function succeed(form: HTMLFormElement, data: FormData) {
  form.dispatchEvent(new CustomEvent('rita:form-success', { bubbles: true, detail: { data } }));
  if (form.dataset.customSuccess !== undefined) return;
  const box = document.createElement('div');
  box.className = 'form-success';
  box.setAttribute('role', 'status');
  box.tabIndex = -1;
  const h = document.createElement('h2');
  h.textContent = form.dataset.successTitle ?? 'Thank you';
  const p = document.createElement('p');
  p.textContent = form.dataset.successText ?? '';
  box.append(h, p);
  form.replaceWith(box);
  box.focus();
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach(enhance);
(window as any).ritaForms = { validateForm, validateField, wordCount, enhance };
