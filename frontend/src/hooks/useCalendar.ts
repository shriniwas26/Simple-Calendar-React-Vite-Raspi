import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalendarEvent, EventsResponse } from '../types';

const POLL_INTERVAL = 5 * 60 * 1000;
const MAX_BACKOFF = 10 * 60 * 1000;

interface CalendarState {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  fetchedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useCalendar(): CalendarState {
  const [state, setState] = useState<CalendarState>({
    today: [],
    tomorrow: [],
    fetchedAt: null,
    loading: true,
    error: null,
  });

  const failCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: EventsResponse = await res.json();

      failCountRef.current = 0;
      setState({
        today: data.today,
        tomorrow: data.tomorrow,
        fetchedAt: data.fetchedAt,
        loading: false,
        error: null,
      });
    } catch (err) {
      failCountRef.current += 1;
      const msg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    function schedule() {
      const backoff = Math.min(
        POLL_INTERVAL * Math.pow(2, failCountRef.current),
        MAX_BACKOFF,
      );
      const delay = failCountRef.current === 0 ? POLL_INTERVAL : backoff;

      timerRef.current = setTimeout(async () => {
        await fetchEvents();
        schedule();
      }, delay);
    }

    schedule();
    return () => clearTimeout(timerRef.current);
  }, [fetchEvents]);

  return state;
}
