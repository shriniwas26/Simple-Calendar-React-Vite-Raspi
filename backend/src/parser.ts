import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { config } from './config.js';
import type { CalendarEvent } from './types.js';

interface RawEvent {
  uid: string;
  title: string;
  startUtc: DateTime;
  endUtc: DateTime;
  isAllDay: boolean;
}

function icalTimeToDateTime(icalTime: ICAL.Time): DateTime | null {
  if (!icalTime) return null;
  const jsDate = icalTime.toJSDate();
  return DateTime.fromJSDate(jsDate, { zone: 'utc' });
}

function expandRecurring(
  comp: ICAL.Component,
  rangeStart: DateTime,
  rangeEnd: DateTime,
): RawEvent[] {
  const events: RawEvent[] = [];

  for (const vevent of comp.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iter = event.iterator();
      let next: ICAL.Time | null;
      let safety = 0;
      while ((next = iter.next()) && safety++ < 500) {
        const dt = icalTimeToDateTime(next);
        if (!dt) continue;
        if (dt > rangeEnd) break;

        const duration: ICAL.Duration = event.duration;
        const endDt = dt.plus({
          weeks: duration.weeks,
          days: duration.days,
          hours: duration.hours,
          minutes: duration.minutes,
          seconds: duration.seconds,
        });

        if (endDt < rangeStart) continue;

        events.push({
          uid: event.uid,
          title: event.summary || '(No title)',
          startUtc: dt,
          endUtc: endDt,
          isAllDay: next.isDate,
        });
      }
    } else {
      const startDt = icalTimeToDateTime(event.startDate);
      const endDt = icalTimeToDateTime(event.endDate);
      if (!startDt) continue;

      const effectiveEnd = endDt ?? startDt;
      if (effectiveEnd < rangeStart || startDt > rangeEnd) continue;

      events.push({
        uid: event.uid,
        title: event.summary || '(No title)',
        startUtc: startDt,
        endUtc: effectiveEnd,
        isAllDay: event.startDate?.isDate ?? false,
      });
    }
  }

  return events;
}

export function parseICS(icsText: string, source: 'outlook' | 'google'): CalendarEvent[] {
  const now = DateTime.utc();
  const rangeStart = now.startOf('day').minus({ days: 1 });
  const rangeEnd = now.startOf('day').plus({ days: 7 });

  try {
    const parsed = ICAL.parse(icsText);
    const comp = new ICAL.Component(parsed);
    const rawEvents = expandRecurring(comp, rangeStart, rangeEnd);

    return rawEvents.map((ev) => ({
      uid: ev.uid,
      title: ev.title,
      startUtc: ev.startUtc.toISO()!,
      endUtc: ev.endUtc.toISO()!,
      startLocal: ev.startUtc.setZone(config.timezone).toISO()!,
      endLocal: ev.endUtc.setZone(config.timezone).toISO()!,
      isAllDay: ev.isAllDay,
      source,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to parse ICS from ${source}: ${msg}`);
    return [];
  }
}
