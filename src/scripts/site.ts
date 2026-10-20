// Global progressive enhancement: sticky header, overlays (menu, search, newsletter), cookie consent,
// reading progress, back-to-top, copy-link and tabs. Everything here is optional: pages work without it.

import { BASE, stripBase } from '../lib/base';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Header: white background + bottom border after 40px of scroll.
const header = document.querySelector<HTMLElement>('[data-header]');
const toTop = document.querySelector<HTMLElement>('[data-to-top]');
const bar = document.querySelector<HTMLElement>('[data-progress]');
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 40);
  if (toTop) toTop.hidden = y < window.innerHeight * 2;
  if (bar) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${h > 0 ? Math.min(100, (y / h) * 100) : 0}%`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Overlays
let lastTrigger: HTMLElement | null = null;
let openEl: HTMLElement | null = null;

export function openOverlay(name: string, trigger?: HTMLElement | null) {
  const el = document.querySelector<HTMLElement>(`[data-overlay="${name}"]`);
  if (!el) return false;
  if (openEl) closeOverlay(false);
  lastTrigger = trigger ?? (document.activeElement as HTMLElement);
  el.hidden = false;
  openEl = el;
  document.body.style.overflow = 'hidden';
  document.querySelectorAll(`[aria-controls="${el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
  const first = el.querySelector<HTMLElement>('[autofocus]')
    ?? el.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]):not([disabled])')
    ?? el.querySelector<HTMLElement>(FOCUSABLE);
  first?.focus();
  return true;
}
export function closeOverlay(restore = true) {
  if (!openEl) return;
  openEl.hidden = true;
  document.querySelectorAll(`[aria-controls="${openEl.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
  openEl = null;
  document.body.style.overflow = '';
  if (restore) lastTrigger?.focus();
}
(window as any).ritaOverlay = { open: openOverlay, close: closeOverlay };

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const opener = t.closest<HTMLElement>('[data-open]');
  if (opener) {
    const name = opener.dataset.open!;
    if (name === 'cookies') { e.preventDefault(); showCookieBanner(true); return; }
    if (openOverlay(name, opener)) e.preventDefault();
    return;
  }
  if (t.closest('[data-close]')) { e.preventDefault(); closeOverlay(); return; }
  if (openEl && t === openEl && openEl.classList.contains('modal')) closeOverlay();
});
document.addEventListener('keydown', (e) => {
  if (!openEl) return;
  if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
  if (e.key === 'Tab') {
    const items = [...openEl.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
// Links inside the mobile menu navigate away; close it so the back button behaves.
document.querySelectorAll('[data-overlay="menu"] a').forEach((a) => a.addEventListener('click', () => closeOverlay(false)));

// Search overlay: live suggestions after 3 characters (max 6) via Pagefind.
const sInput = document.querySelector<HTMLInputElement>('[data-suggest-input]');
const sList = document.querySelector<HTMLElement>('[data-suggest-results]');
let pagefind: any;
let timer: number | undefined;
export async function getPagefind() {
  if (pagefind !== undefined) return pagefind;
  try {
    const path = `${BASE}/pagefind/pagefind.js`;
    pagefind = await import(/* @vite-ignore */ path);
    await pagefind.options?.({ baseUrl: `${BASE}/` });
    await pagefind.init?.();
  } catch {
    pagefind = null; // dev server: index exists only after `npm run build`
  }
  return pagefind;
}
sInput?.addEventListener('input', () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(async () => {
    const q = sInput.value.trim();
    if (!sList) return;
    if (q.length < 3) { sList.innerHTML = ''; return; }
    const pf = await getPagefind();
    if (!pf) { sList.innerHTML = `<li class="r-meta">Live suggestions appear on the built site. Press Enter to search.</li>`; return; }
    const res = await pf.search(q);
    const data = await Promise.all(res.results.slice(0, 6).map((r: any) => r.data()));
    sList.innerHTML = data.length
      ? data.map((d: any) => `<li><a href="${d.url}"><span class="r-meta">${escapeHtml(d.meta?.type ?? 'Page')}</span><span class="r-title">${escapeHtml(d.meta?.title ?? d.url)}</span></a></li>`).join('')
      : `<li class="r-meta">No suggestions. Press Enter to search.</li>`;
  }, 200);
});
export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// Cookie consent, stored for 12 months.
const CONSENT_KEY = 'rita-consent';
const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
const settings = document.getElementById('cookie-settings');
const analyticsBox = document.querySelector<HTMLInputElement>('[data-cookie-analytics]');
type Consent = { analytics: boolean; at: number };
function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null') as Consent | null;
    if (c && Date.now() - c.at < 365 * 24 * 3600 * 1000) return c;
  } catch { /* storage unavailable */ }
  return null;
}
function saveConsent(analytics: boolean) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, at: Date.now() })); } catch { /* ignore */ }
  document.cookie = `rita_consent=${analytics ? 'all' : 'essential'}; max-age=${365 * 24 * 3600}; path=/; SameSite=Lax`;
  if (banner) banner.hidden = true;
  if (analytics) loadAnalytics();
}
function showCookieBanner(withSettings = false) {
  if (!banner) return;
  banner.hidden = false;
  if (analyticsBox) analyticsBox.checked = readConsent()?.analytics ?? false;
  if (withSettings && settings) { settings.hidden = false; analyticsBox?.focus(); }
}
banner?.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-cookie]');
  if (!b) return;
  const action = b.dataset.cookie;
  if (action === 'accept') saveConsent(true);
  if (action === 'reject') saveConsent(false);
  if (action === 'save') saveConsent(Boolean(analyticsBox?.checked));
  if (action === 'settings' && settings) { settings.hidden = !settings.hidden; b.setAttribute('aria-expanded', String(!settings.hidden)); }
});
const consent = readConsent();
if (!consent) showCookieBanner();
else if (consent.analytics) loadAnalytics();
if (location.hash === '#settings' && stripBase(location.pathname).startsWith('/cookies')) showCookieBanner(true);

function loadAnalytics() {
  const domain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain || document.getElementById('plausible')) return;
  const s = document.createElement('script');
  s.id = 'plausible'; s.defer = true; s.dataset.domain = domain;
  s.src = 'https://plausible.io/js/script.outbound-links.file-downloads.js';
  document.head.appendChild(s);
}
/** Custom analytics events (PDF download, publisher click, signups…). No-op until consent. */
export function track(event: string, props?: Record<string, string>) {
  (window as any).plausible?.(event, props ? { props } : undefined);
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (a) track(a.dataset.track!, a.dataset.trackLabel ? { label: a.dataset.trackLabel } : undefined);
});

// Copy link (share bars) and copy buttons.
document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
  if (!b) return;
  const text = b.dataset.copy === 'url' ? location.href : document.getElementById(b.dataset.copy!)?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(text);
    const old = b.textContent;
    b.textContent = 'Copied';
    setTimeout(() => (b.textContent = old), 1800);
  } catch { /* clipboard blocked */ }
});

// In-page tabs (role="tablist"): arrow keys move between tabs.
document.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      const n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : -1;
      if (n === -1) return;
      e.preventDefault();
      const next = tabs[(n + tabs.length) % tabs.length];
      next.focus(); select(next);
    });
  });
});
