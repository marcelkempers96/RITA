// Photo registry. Each ▣ placeholder on the site is a "shot" (the caption it shows). This maps shots to
// image files in src/assets/photos/ with alt text and credit. Generic slots (cards, article headers) pick a
// photo from their programme's pool, varied by a seed (the item's URL or id) so lists don't repeat one image.
// A slot with no matching file keeps rendering as a placeholder. Sources and licences: scripts/photos.json.
import type { ImageMetadata } from 'astro';
import manifest from '../../scripts/photos.json';

export interface PhotoEntry { key: string; file: string; alt: string; credit: string; licence: string; source: string; shots: string[]; pools: string[] }
export interface ResolvedPhoto { image: ImageMetadata; alt: string; credit: string }

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp}', { eager: true });
const entries = (manifest.photos as PhotoEntry[]).filter((e) => files[`/src/assets/photos/${e.file}`]);
const GENERIC = new Set(['Topical image', 'Project', 'Photo', '']);

const toPhoto = (e: PhotoEntry): ResolvedPhoto => ({ image: files[`/src/assets/photos/${e.file}`].default, alt: e.alt, credit: e.credit });
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * `used` holds the keys already shown on the current page, so pool picks avoid repeating an image
 * (pass a per-page Set, e.g. from Astro.locals). Pool picks start at a seeded position and take the
 * first unused photo; no programme code means the whole library is the pool.
 */
export function resolvePhoto(shot: string | undefined, code?: string, seed?: string, used?: Set<string>): ResolvedPhoto | undefined {
  const byShot = shot && !GENERIC.has(shot) ? entries.find((e) => e.shots.includes(shot)) : undefined;
  if (byShot) { used?.add(byShot.key); return toPhoto(byShot); }
  const pool = code ? entries.filter((e) => e.pools.includes(code)) : entries;
  if (!pool.length) return undefined;
  const start = hash(seed ?? shot ?? '') % pool.length;
  for (let i = 0; i < pool.length; i++) {
    const e = pool[(start + i) % pool.length];
    if (!used?.has(e.key)) { used?.add(e.key); return toPhoto(e); }
  }
  return toPhoto(pool[start]);
}
export const photoEntries = entries;
