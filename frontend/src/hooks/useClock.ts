import { useState, useEffect } from 'react';
import { formatClockTime, formatDayDateLine } from '../lib/datetime';

interface ClockState {
  timeStr: string;
  dayDateStr: string;
}

function getClockState(): ClockState {
  const now = new Date();
  return {
    timeStr: formatClockTime(now),
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
