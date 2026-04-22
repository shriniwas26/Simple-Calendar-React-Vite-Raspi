export interface CalendarEvent {
  uid: string;
  title: string;
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  isAllDay: boolean;
  source: 'outlook' | 'google';
}

export interface CalendarEventWithOngoing extends CalendarEvent {
  isOngoing: boolean;
}

export interface EventsResponse {
  today: CalendarEventWithOngoing[];
  tomorrow: CalendarEventWithOngoing[];
  fetchedAt: string;
}
