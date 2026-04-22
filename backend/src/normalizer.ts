import { fetchAllFeeds } from './fetcher.js';
import { parseICS } from './parser.js';
import type { CalendarEvent } from './types.js';

export async function fetchAndNormalize(): Promise<CalendarEvent[]> {
  const feeds = await fetchAllFeeds();
  const allEvents: CalendarEvent[] = [];

  for (const { text, sourceIndex, feedName, feedColor } of feeds) {
    const events = parseICS(text, sourceIndex, feedName, feedColor);
    allEvents.push(...events);
  }

  return allEvents;
}
