import type { CalendarEvent } from '../types';

interface WeekOverviewProps {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
}

interface DayCell {
  key: string;
  weekday: string;
  monthDay: string;
  count: number;
  isToday: boolean;
}

function isoLocalDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCounts(today: CalendarEvent[], tomorrow: CalendarEvent[]): Map<string, number> {
  const counts = new Map<string, number>();
  const all = [...today, ...tomorrow];

  for (const event of all) {
    const key = event.startLocal.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function buildDays(counts: Map<string, number>): DayCell[] {
  const now = new Date();
  const todayKey = isoLocalDay(now);
  const weekdayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  const dateFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', day: '2-digit' });

  return Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(now);
    date.setDate(now.getDate() + idx);
    const key = isoLocalDay(date);
    return {
      key,
      weekday: weekdayFmt.format(date),
      monthDay: dateFmt.format(date),
      count: counts.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });
}

export function WeekOverview({ today, tomorrow }: WeekOverviewProps) {
  const counts = buildCounts(today, tomorrow);
  const days = buildDays(counts);

  return (
    <section className="week-overview">
      <header className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Week Overview</h2>
      </header>
      <div className="week-overview-grid">
        {days.map((day) => (
          <article
            key={day.key}
            className={`week-overview-day ${day.isToday ? 'week-overview-day-today' : ''}`}
          >
            <div className="week-overview-weekday">{day.weekday}</div>
            <div className="week-overview-date">{day.monthDay}</div>
            <div className="week-overview-count">{day.count} events</div>
          </article>
        ))}
      </div>
      <p className="week-overview-note">Counts currently include available Today/Tomorrow data.</p>
    </section>
  );
}
