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
  const paletteIndex = ((event.source % 8) + 8) % 8;
  const titleCardClass = [
    'event-title-card',
    !event.feedColor && `event-source-${paletteIndex}`,
  ]
    .filter(Boolean)
    .join(' ');
  const titleCardStyle = event.feedColor
    ? { borderLeftColor: event.feedColor }
    : undefined;
  const ongoingClass = event.isOngoing ? 'event-ongoing' : '';

  return (
    <div className={`event-row ${ongoingClass}`}>
      <div className="event-time-card">
        {event.isAllDay ? 'ALL DAY' : formatTime(event.startLocal)}
      </div>
      <div className={titleCardClass} style={titleCardStyle}>
        <div className="event-title-row">
          <span className="event-title">{event.title}</span>
          <span className="event-feed-name" title={event.feedName}>
            {event.feedName}
          </span>
        </div>
        {event.isOngoing && <span className="event-now-badge">NOW</span>}
      </div>
    </div>
  );
}
