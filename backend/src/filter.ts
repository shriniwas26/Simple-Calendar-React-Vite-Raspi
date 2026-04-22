import { DateTime } from 'luxon';
import { config } from './config.js';
import type { CalendarEvent, CalendarEventWithOngoing, EventsResponse } from './types.js';

function deduplicate(events: CalendarEvent[]): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();
  for (const ev of events) {
    const key = `${ev.uid}|${ev.startUtc}|${ev.source}`;
    map.set(key, ev);
  }
  return Array.from(map.values());
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((a, b) => {
    if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
    return a.startUtc.localeCompare(b.startUtc);
  });
}

export function filterEvents(events: CalendarEvent[]): EventsResponse {
  const now = DateTime.utc();
  const localNow = now.setZone(config.timezone);
  const endOfToday = localNow.endOf('day').toUTC();
  const startOfTomorrow = localNow.plus({ days: 1 }).startOf('day');
  const endOfTomorrow = localNow.plus({ days: 1 }).endOf('day');

  const deduped = deduplicate(events);

  const today = deduped.filter((ev) => {
    const evEnd = DateTime.fromISO(ev.endUtc, { zone: 'utc' });
    const evStart = DateTime.fromISO(ev.startUtc, { zone: 'utc' });
    return evEnd > now && evStart < endOfToday;
  });

  const tomorrow = deduped.filter((ev) => {
    const evStartLocal = DateTime.fromISO(ev.startLocal);
    return evStartLocal >= startOfTomorrow && evStartLocal < endOfTomorrow;
  });

  const nowIso = now.toISO()!;

  const addOngoing = (list: CalendarEvent[]): CalendarEventWithOngoing[] =>
    list.map((ev) => ({
      ...ev,
      isOngoing: ev.startUtc <= nowIso && ev.endUtc > nowIso,
    }));

  return {
    today: addOngoing(sortEvents(today)),
    tomorrow: addOngoing(sortEvents(tomorrow)),
    fetchedAt: nowIso,
  };
}
