// Base path support, so the site works at a domain root (rita.africa) or under a subpath
// (GitHub Pages: /RITA). BASE is '' at the root, '/RITA' under a subpath.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** '/research' → '/RITA/research' */
export const withBase = (path: string) => (path.startsWith('/') && !path.startsWith('//') ? `${BASE}${path}` : path);
/** '/RITA/research' → '/research' */
export const stripBase = (path: string) => (BASE && path.startsWith(BASE) ? path.slice(BASE.length) || '/' : path);
