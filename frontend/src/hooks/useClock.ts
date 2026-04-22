import { useState, useEffect } from 'react';

const TIMEZONE = 'Europe/Amsterdam';

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  weekday: 'long',
});

const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface ClockState {
  timeStr: string;
  weekdayStr: string;
  dayMonthStr: string;
}

function getClockState(): ClockState {
  const now = new Date();
  return {
    timeStr: timeFormatter.format(now),
    weekdayStr: weekdayFormatter.format(now),
    dayMonthStr: dayMonthFormatter.format(now),
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
