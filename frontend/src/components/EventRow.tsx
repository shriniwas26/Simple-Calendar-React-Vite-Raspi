import type { CSSProperties } from "react";
import type { CalendarEvent } from "../types";
import { SOURCE_PALETTE } from "../sourcePalette";

interface EventRowProps {
  event: CalendarEvent;
}

/** Title card fill tinted by the feed colour from ics.json (or palette fallback). */
function titleCardBackground(accent: string): string {
  return `color-mix(in srgb, ${accent} 32%, #0a0a0a)`;
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
    hour12: false,
  });
}

export function EventRow({ event }: EventRowProps) {
  const paletteIndex = ((event.source % 8) + 8) % 8;
  const accent = event.feedColor ?? SOURCE_PALETTE[paletteIndex];
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
        {event.isAllDay ? "ALL DAY" : formatTime(event.startLocal)}
      </div>
      <div className={titleCardClass} style={titleCardStyle}>
        <span className="event-title">{event.title}</span>
        {event.isOngoing && <span className="event-now-badge">NOW</span>}
      </div>
    </div>
  );
}
