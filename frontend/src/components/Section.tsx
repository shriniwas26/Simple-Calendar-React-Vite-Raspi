import type { CalendarEvent } from '../types';
import { EventRow } from './EventRow';
import { EmptyState } from './EmptyState';

interface SectionProps {
  title: string;
  events: CalendarEvent[];
  maxVisible: number;
  emptyMessage: string;
}

export function Section({ title, events, maxVisible, emptyMessage }: SectionProps) {
  const visible = events.slice(0, maxVisible);

  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {visible.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="section-events">
          {visible.map((ev) => (
            <EventRow key={`${ev.uid}-${ev.startLocal}`} event={ev} />
          ))}
        </div>
      )}
    </section>
  );
}
