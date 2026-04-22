import type { CalendarEvent } from '../types';

interface EventRowProps {
  event: CalendarEvent;
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Amsterdam',
    hour12: false,
  });
}

export function EventRow({ event }: EventRowProps) {
  const sourceClass = `event-source-${event.source}`;
  const ongoingClass = event.isOngoing ? 'event-ongoing' : '';

  return (
    <div className={`event-row ${ongoingClass}`}>
      <div className="event-time-card">
        {event.isAllDay ? 'ALL DAY' : formatTime(event.startLocal)}
      </div>
      <div className={`event-title-card ${sourceClass}`}>
        <span className="event-title">{event.title}</span>
        {event.isOngoing && <span className="event-now-badge">NOW</span>}
      </div>
    </div>
  );
}
