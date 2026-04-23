import type { CSSProperties } from "react";
import type { CalendarEvent } from "../types";
import { formatEventTime } from "../lib/datetime";

interface EventRowProps {
  event: CalendarEvent;
}

/** Title card fill tinted by the feed colour from ics.json (or palette fallback). */
function titleCardBackground(accent: string): string {
  return `color-mix(in srgb, ${accent} 32%, #0a0a0a)`;
}

export function EventRow({ event }: EventRowProps) {
  const paletteIndex = ((event.source % 8) + 8) % 8;
  const accent = event.feedColor ?? `var(--source-${paletteIndex})`;
  const titleCardClass = [
    "event-title-card",
    !event.feedColor && `event-source-${paletteIndex}`,
  ]
    .filter(Boolean)
    .join(" ");
  const titleCardStyle: CSSProperties = {
    backgroundColor: titleCardBackground(accent),
    ...(event.feedColor ? { borderLeftColor: event.feedColor } : {}),
  };
  const ongoingClass = event.isOngoing ? "event-ongoing" : "";

  return (
    <div className={`event-row ${ongoingClass}`}>
      <div className="event-time-card">
        {event.isAllDay ? "ALL DAY" : formatEventTime(event.startLocal)}
      </div>
      <div className={titleCardClass} style={titleCardStyle}>
        <span className="event-title">{event.title}</span>
        {event.isOngoing && <span className="event-now-badge">NOW</span>}
      </div>
    </div>
  );
}
