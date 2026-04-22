export interface CalendarEvent {
  uid: string;
  title: string;
  startLocal: string;
  endLocal: string;
  isAllDay: boolean;
  source: number;
  feedName: string;
  feedColor?: string;
  isOngoing: boolean;
}

export interface EventsResponse {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
  fetchedAt: string;
}
