export interface CalendarEvent {
  uid: string;
  title: string;
  startLocal: string;
  endLocal: string;
  isAllDay: boolean;
  source: 'outlook' | 'google';
  isOngoing: boolean;
}

export interface EventsResponse {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  fetchedAt: string;
}
