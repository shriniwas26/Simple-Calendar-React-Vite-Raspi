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

/** Half-open overlap: [startLocal, endLocal) vs [dayStart, dayStart + 1 day) in configured timezone. */
function eventOverlapsLocalDay(ev: CalendarEvent, dayStart: DateTime): boolean {
  const dayEndExclusive = dayStart.plus({ days: 1 });
  const s = DateTime.fromISO(ev.startLocal, { zone: config.timezone });
  const e = DateTime.fromISO(ev.endLocal, { zone: config.timezone });
  if (!s.isValid || !e.isValid) return false;
  return s < dayEndExclusive && e > dayStart;
}

export function filterEvents(events: CalendarEvent[]): EventsResponse {
  const now = DateTime.utc();
  const localNow = now.setZone(config.timezone);
  const endOfToday = localNow.endOf('day').toUTC();
  const startOfToday = localNow.startOf('day');
  const startOfTomorrow = localNow.plus({ days: 1 }).startOf('day');
  const endOfTomorrow = localNow.plus({ days: 1 }).endOf('day');

  const deduped = deduplicate(events);

  const today = deduped.filter((ev) => {
    if (ev.isAllDay) {
      return eventOverlapsLocalDay(ev, startOfToday);
    }
    const evEnd = DateTime.fromISO(ev.endUtc, { zone: 'utc' });
    const evStart = DateTime.fromISO(ev.startUtc, { zone: 'utc' });
    return evEnd > now && evStart < endOfToday;
  });

  const tomorrow = deduped.filter((ev) => {
    if (ev.isAllDay) {
      return eventOverlapsLocalDay(ev, startOfTomorrow);
    }
    const evStartLocal = DateTime.fromISO(ev.startLocal, { zone: config.timezone });
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
