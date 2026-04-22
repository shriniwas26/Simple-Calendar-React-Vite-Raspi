import { config } from './config.js';
import { fetchAndNormalize } from './normalizer.js';
import { filterEvents } from './filter.js';
import type { CalendarEvent, EventsResponse } from './types.js';

interface CacheEntry {
  events: CalendarEvent[] | null;
  fetchedAt: number;
}

const cache: CacheEntry = { events: null, fetchedAt: 0 };
let refreshInProgress: Promise<CalendarEvent[]> | null = null;

async function refresh(): Promise<CalendarEvent[]> {
  const events = await fetchAndNormalize();
  cache.events = events;
  cache.fetchedAt = Date.now();
  return events;
}

export async function getOrRefresh(): Promise<EventsResponse> {
  const age = Date.now() - cache.fetchedAt;
  let events: CalendarEvent[];

  if (cache.events && age < config.cacheTtlMs) {
    events = cache.events;
  } else if (refreshInProgress) {
    events = await refreshInProgress;
  } else {
    try {
      refreshInProgress = refresh();
      events = await refreshInProgress;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Cache refresh failed: ${msg}`);
      if (cache.events) {
        console.warn('Serving stale cache');
        events = cache.events;
      } else {
        throw err;
      }
    } finally {
      refreshInProgress = null;
    }
  }

  return filterEvents(events);
}
