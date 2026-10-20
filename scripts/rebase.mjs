// Post-build step for subpath hosting (GitHub Pages at /RITA). Astro prefixes its own assets with `base`,
// but page templates link with root-relative paths ("/research"). When BASE_PATH is set this rewrites,
// in dist/: root-relative URLs in HTML attributes and the web manifest, and absolute site URLs
// (canonical, Open Graph, JSON-LD, RSS, robots) that are missing the base. A no-op without BASE_PATH.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (!base) process.exit(0);
const origin = new URL(process.env.SITE_URL || 'https://rita.africa').origin;
const dist = new URL('../dist/', import.meta.url).pathname;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const b = esc(base.slice(1));

const notBased = `(?!${b}(?:[/"'?#]|$))`;
const attr = new RegExp(`(\\s(?:href|src|action|srcset|poster|data-src)=["'])/${notBased}(?!/)`, 'g');
const abs = new RegExp(`${esc(origin)}/${notBased}`, 'g');
const legacy = /https:\/\/rita\.africa(?=[/"'\s<]|$)/g; // hard-coded production domain in static files

let files = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'pagefind' && name !== '_astro') walk(p); continue; }
    const ext = extname(name);
    if (!['.html', '.xml', '.txt', '.webmanifest', '.ics', '.yml'].includes(ext)) continue;
    let s = readFileSync(p, 'utf8');
    const before = s;
    if (ext === '.html') s = s.replace(attr, `$1${base}/`);
    if (ext === '.webmanifest') s = s.replace(/"\/(?!\/)/g, `"${base}/`);
    if (ext !== '.yml') s = s.replace(legacy, origin).replace(abs, `${origin}${base}/`);
    if (s !== before) { writeFileSync(p, s); files++; }
  }
})(dist);
console.log(`rebase: prefixed ${base} in ${files} files`);
