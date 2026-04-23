const APP_TIMEZONE = 'Europe/Amsterdam';

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const eventTimeFormatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const weekdayShortFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIMEZONE,
  weekday: 'short',
});

const monthDayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: 'long',
});

export function formatClockTime(now: Date): string {
  return timeFormatter.format(now);
}

/** e.g. "Thu, April 23" and "Thu, April 01" */
export function formatDayDateLine(now: Date): string {
  const weekdayShort = weekdayShortFormatter.format(now);
  const mdParts = monthDayFormatter.formatToParts(now);
  const monthName = mdParts.find((p) => p.type === 'month')?.value ?? '';
  const day = mdParts.find((p) => p.type === 'day')?.value ?? '';
  return `${weekdayShort}, ${monthName} ${day}`;
}

export function formatEventTime(isoStr: string): string {
  return eventTimeFormatter.format(new Date(isoStr));
}
