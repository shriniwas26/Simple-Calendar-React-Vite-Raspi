import type { CalendarEvent } from '../types';
import { Section } from './Section';
import { AnalogClock } from './AnalogClock';

interface DashboardLayoutProps {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
}

export function DashboardLayout({ today, tomorrow }: DashboardLayoutProps) {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel dashboard-panel-agenda">
        <header className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Today</h2>
        </header>
        <Section
          title="TODAY"
          events={today}
          maxVisible={10}
          emptyMessage="No events today"
        />
      </section>
      <section className="dashboard-panel dashboard-panel-agenda">
        <header className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Tomorrow</h2>
        </header>
        <Section
          title="TOMORROW"
          events={tomorrow}
          maxVisible={10}
          emptyMessage="No events tomorrow"
        />
      </section>
      <aside className="dashboard-utility">
        <AnalogClock />
      </aside>
    </main>
  );
}
