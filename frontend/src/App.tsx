import { useClock } from './hooks/useClock';
import { useCalendar } from './hooks/useCalendar';
import { Header } from './components/Header';
import { Section } from './components/Section';

export function App() {
  const { timeStr, weekdayStr, dayMonthStr } = useClock();
  const { today, tomorrow, loading } = useCalendar();

  if (loading) {
    return (
      <div className="kiosk">
        <Header weekdayStr={weekdayStr} dayMonthStr={dayMonthStr} timeStr={timeStr} />
        <main className="main">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="kiosk">
      <Header weekdayStr={weekdayStr} dayMonthStr={dayMonthStr} timeStr={timeStr} />
      <main className="main">
        <Section
          title="TODAY"
          events={today}
          maxVisible={5}
          emptyMessage="No more events today"
        />
        <Section
          title="TOMORROW"
          events={tomorrow}
          maxVisible={3}
          emptyMessage="No events tomorrow"
        />
      </main>
    </div>
  );
}
