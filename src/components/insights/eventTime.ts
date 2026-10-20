// Event date/time formatting in the event's own timezone, plus calendar helpers.
import type { CollectionEntry } from 'astro:content';

type Ev = CollectionEntry<'events'>['data'];

const fmt = (iso: string, tz: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts }).format(new Date(iso));

export function eventStart(e: Ev) { return e.datetime ? new Date(e.datetime) : null; }
export function eventEnd(e: Ev) {
  const s = eventStart(e);
  return s ? new Date(s.getTime() + e.durationMinutes * 60000) : null;
}
/** "Thu 12 Nov 2026" */
export const eventDate = (e: Ev) => (e.datetime ? fmt(e.datetime, e.timezone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : null);
/** "12 Nov" */
export const eventDay = (e: Ev) => (e.datetime ? fmt(e.datetime, e.timezone, { day: '2-digit', month: 'short' }) : null);
/** "14:00–15:00 SAST (UTC+2)" */
export function eventTime(e: Ev) {
  const s = eventStart(e), end = eventEnd(e);
  if (!s || !end) return null;
  const t = (d: Date) => fmt(d.toISOString(), e.timezone, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const zone = fmt(s.toISOString(), e.timezone, { timeZoneName: 'short' }).split(' ').pop();
  const offset = fmt(s.toISOString(), e.timezone, { timeZoneName: 'shortOffset' }).split(' ').pop()?.replace('GMT', 'UTC');
  return `${t(s)}–${t(end)} ${zone}${offset && offset !== zone ? ` (${offset})` : ''}`;
}
export const isPast = (e: Ev, now = new Date()) => Boolean(e.datetime && eventEnd(e)! < now);
export const FORMAT_LABEL = { online: 'Online', 'in-person': 'In person', hybrid: 'Hybrid' } as const;

const ics = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
export function googleCalendarUrl(e: Ev, details: string) {
  const s = eventStart(e), end = eventEnd(e);
  if (!s || !end) return null;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${ics(s)}/${ics(end)}`, details, location: e.venue ?? 'Online' });
  return `https://calendar.google.com/calendar/render?${q}`;
}
export function icsFile(e: Ev, uid: string, pageUrl: string) {
  const s = eventStart(e), end = eventEnd(e);
  if (!s || !end) return null;
  const esc = (x: string) => x.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RITA//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${uid}@rita.africa`, `DTSTAMP:${ics(new Date())}`, `DTSTART:${ics(s)}`, `DTEND:${ics(end)}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(`${e.about}\n\n${pageUrl}`)}`, `LOCATION:${esc(e.venue ?? 'Online (link emailed after registration)')}`,
    `URL:${pageUrl}`, 'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
