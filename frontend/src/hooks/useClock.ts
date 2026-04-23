import { useState, useEffect } from 'react';

const TIMEZONE = 'Europe/Amsterdam';

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const weekdayShortFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  weekday: 'short',
});

const monthDayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: 'long',
});

/** e.g. "Thu, April 23" and "Thu, April 01" */
function formatDayDateLine(now: Date): string {
  const weekdayShort = weekdayShortFormatter.format(now);
  const mdParts = monthDayFormatter.formatToParts(now);
  const monthName = mdParts.find((p) => p.type === 'month')?.value ?? '';
  const day = mdParts.find((p) => p.type === 'day')?.value ?? '';
  return `${weekdayShort}, ${monthName} ${day}`;
}

interface ClockState {
  timeStr: string;
  dayDateStr: string;
}

function getClockState(): ClockState {
  const now = new Date();
  return {
    timeStr: timeFormatter.format(now),
    dayDateStr: formatDayDateLine(now),
  };
}

export function useClock(): ClockState {
  const [clock, setClock] = useState(getClockState);

  useEffect(() => {
    const id = setInterval(() => setClock(getClockState()), 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
