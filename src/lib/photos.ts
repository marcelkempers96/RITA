// Photo registry. Each ▣ placeholder on the site is a "shot" (the caption it shows). This maps shots to
// image files in src/assets/photos/ with alt text and credit. A shot whose file is missing keeps rendering
// as a placeholder, so the build never breaks while photos are being collected.
// Sources and licences are recorded in scripts/photos.json (download them with `npm run photos`).
import type { ImageMetadata } from 'astro';
import manifest from '../../scripts/photos.json';

export interface PhotoEntry { key: string; file: string; alt: string; credit: string; licence: string; source: string; shots: string[] }
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp}', { eager: true });
const entries = manifest.photos as PhotoEntry[];

export interface ResolvedPhoto { image: ImageMetadata; alt: string; credit: string }
function load(e: PhotoEntry | undefined): ResolvedPhoto | undefined {
  const mod = e && files[`/src/assets/photos/${e.file}`];
  return mod && e ? { image: mod.default, alt: e.alt, credit: e.credit } : undefined;
}

/** Programme fallback for generic slots ("Topical image", "Project", cards without their own shot). */
const PROGRAMME_KEY: Record<string, string> = { IND: 'industrial-park', MIN: 'minerals-processing', EN: 'solar-farm', INN: 'workshop' };
const GENERIC = new Set(['Topical image', 'Project', 'Photo', '']);

export function resolvePhoto(shot: string | undefined, code?: string): ResolvedPhoto | undefined {
  const byShot = shot && !GENERIC.has(shot) ? entries.find((e) => e.shots.includes(shot)) : undefined;
  return load(byShot) ?? (code ? load(entries.find((e) => e.key === PROGRAMME_KEY[code])) : undefined);
}
export const photoEntries = entries;
