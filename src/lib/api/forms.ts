// Form transport. Point PUBLIC_FORMS_ENDPOINT at your serverless functions (e.g. Netlify/Vercel functions
// that store the entry, email the routed inbox via Resend and send the auto-reply). Each form posts to
// `${PUBLIC_FORMS_ENDPOINT}/${formName}` as multipart/form-data.
// When the variable is unset (local dev, preview), forms run in demo mode and resolve after a short delay.

export type FormName = 'contact' | 'newsletter' | 'event' | 'interest' | 'fellowship';

/** Contact enquiry type → inbox (BUILD-SPEC §6). The back-end should own this mapping; it is mirrored here for reference. */
export const CONTACT_ROUTES: Record<string, string> = {
  general: 'info@rita.africa',
  media: 'press@rita.africa',
  policy: 'policy@rita.africa',
  partnerships: 'partners@rita.africa',
  fellowship: 'fellows@rita.africa',
  website: 'web@rita.africa',
};

export class FormError extends Error {}

export async function sendForm(name: string, data: FormData, timeoutMs = 15000): Promise<void> {
  const endpoint = import.meta.env.PUBLIC_FORMS_ENDPOINT as string | undefined;
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 700));
    if (data.get('email') === 'fail@example.com') throw new FormError('demo failure'); // lets you preview the server-error state
    return;
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${endpoint.replace(/\/$/, '')}/${name}`, { method: 'POST', body: data, signal: ctrl.signal });
    if (!res.ok) throw new FormError(`HTTP ${res.status}`);
  } catch (err) {
    throw err instanceof FormError ? err : new FormError(String(err));
  } finally {
    clearTimeout(t);
  }
}
