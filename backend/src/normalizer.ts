import { fetchAllFeeds } from './fetcher.js';
import { parseICS } from './parser.js';
import type { CalendarEvent } from './types.js';

export async function fetchAndNormalize(): Promise<CalendarEvent[]> {
  const feeds = await fetchAllFeeds();
  const allEvents: CalendarEvent[] = [];

  for (const { text, label } of feeds) {
    const events = parseICS(text, label);
    allEvents.push(...events);
  }

  return allEvents;
}
