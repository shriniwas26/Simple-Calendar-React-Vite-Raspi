import { useState, useEffect } from 'react';

const TIMEZONE = 'Europe/Amsterdam';

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface ClockState {
  timeStr: string;
  dateStr: string;
}

function getClockState(): ClockState {
  const now = new Date();
  return {
    timeStr: timeFormatter.format(now),
    dateStr: dateFormatter.format(now),
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
