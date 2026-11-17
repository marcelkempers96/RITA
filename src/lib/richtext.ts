// Minimal renderer for article bodies stored as plain text (Policy Insights, RITA blogs).
// Blank line = new block. A block of "- " lines = bullet list. "## " = heading. **bold**.
// URLs become links, and mentions like "Policy Insights N43-2026" link to that issue on the site.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text: string, issueHref?: (n: number) => string | undefined) {
  let s = esc(text);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(https?:\/\/[^\s<)]+[^\s<).,;:])/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//, '')}</a>`);
  if (issueHref) {
    s = s.replace(/(&quot;)?Policy\s?Insights\s*\(?N(\d{1,2})[-–]2026\)?(&quot;)?/g, (m, _q1, n) => {
      const href = issueHref(Number(n));
      return href ? `<a href="${href}">Policy Insights No. ${n}</a>` : m;
    });
  }
  return s;
}

export function renderBody(body: string, issueHref?: (n: number) => string | undefined): string {
  return body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => l.startsWith('- '))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2), issueHref)}</li>`).join('')}</ul>`;
    if (block.startsWith('## ')) return `<h2>${inline(block.slice(3), issueHref)}</h2>`;
    return `<p>${inline(lines.join(' '), issueHref)}</p>`;
  }).join('\n');
}

export const wordsIn = (body: string) => body.replace(/\*\*|^- /gm, '').split(/\s+/).filter(Boolean).length;
