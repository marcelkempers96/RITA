// Static .ics calendar file per event. Only generated once an event has a date.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { icsFile } from '../../../components/insights/eventTime';

export const getStaticPaths = (async () => {
  const events = await getCollection('events', (e) => e.data.status !== 'draft' && Boolean(e.data.datetime));
  return events.map((e) => ({ params: { slug: e.id }, props: { event: e } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { event } = props as { event: CollectionEntry<'events'> };
  const body = icsFile(event.data, event.id, new URL(`/insights/events/${event.id}`, site).toString())!;
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
