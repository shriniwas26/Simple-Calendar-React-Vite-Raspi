export interface CalendarEvent {
  uid: string;
  title: string;
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  isAllDay: boolean;
  /** Feed index in `ics.json` (used for border color rotation). */
  source: number;
  /** Display name from `ics.json` for this feed. */
  feedName: string;
  /** Set when the feed has `color` in `ics.json` (overrides class-based palette in the UI). */
  feedColor?: string;
}

export interface CalendarEventWithOngoing extends CalendarEvent {
  isOngoing: boolean;
}

export interface EventsResponse {
  today: CalendarEventWithOngoing[];
  tomorrow: CalendarEventWithOngoing[];
  fetchedAt: string;
}
