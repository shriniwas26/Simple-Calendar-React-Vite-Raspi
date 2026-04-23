import { useState, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { fetchCalendarEvents } from '../api/calendarApi';
import { usePolling } from './usePolling';

const POLL_INTERVAL = 5 * 60 * 1000;
const MAX_BACKOFF = 10 * 60 * 1000;

interface CalendarState {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  fetchedAt: string | null;
  loading: boolean;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
}

export function useCalendar(): CalendarState {
  const [state, setState] = useState<CalendarState>({
    today: [],
    tomorrow: [],
    fetchedAt: null,
    loading: true,
    status: 'loading',
    error: null,
  });

  const fetchEvents = useCallback(async () => {
    try {
      const data = await fetchCalendarEvents();
      setState({
        today: data.today,
        tomorrow: data.tomorrow,
        fetchedAt: data.fetchedAt,
        loading: false,
        status: 'ready',
        error: null,
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        loading: false,
        status: 'error',
        error: msg,
      }));
      return false;
    }
  }, []);

  usePolling({ tick: fetchEvents, baseIntervalMs: POLL_INTERVAL, maxIntervalMs: MAX_BACKOFF });

  return state;
}
