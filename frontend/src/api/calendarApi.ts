import type { EventsResponse } from '../types';

export async function fetchCalendarEvents(): Promise<EventsResponse> {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as EventsResponse;
}
