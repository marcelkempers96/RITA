// Downloads every photo listed in scripts/photos.json (entries with a `url`) into src/assets/photos/.
// Existing files are kept; pass --force to re-download. Large originals are fine: Astro resizes at build time.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { photos } = JSON.parse(readFileSync(`${root}scripts/photos.json`, 'utf8'));
const force = process.argv.includes('--force');
mkdirSync(`${root}src/assets/photos`, { recursive: true });
let ok = 0, skipped = 0, failed = 0;
for (const p of photos) {
  const out = `${root}src/assets/photos/${p.file}`;
  if (!p.url) { skipped++; continue; }
  if (existsSync(out) && !force) { ok++; continue; }
  try {
    const res = await fetch(p.url, { headers: { 'User-Agent': 'RITA-website-build/1.0 (https://github.com/marcelkempers96/RITA)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(out, Buffer.from(await res.arrayBuffer()));
    ok++; console.log(`✓ ${p.key}`);
  } catch (e) { failed++; console.log(`✗ ${p.key}: ${e.message}`); }
}
console.log(`photos: ${ok} ready, ${skipped} without a url, ${failed} failed`);
