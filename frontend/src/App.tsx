import { useClock } from './hooks/useClock';
import { useCalendar } from './hooks/useCalendar';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { DashboardLayout } from './components/DashboardLayout';
import { useLayoutMode } from './hooks/useLayoutMode';

export function App() {
  const { timeStr, dayDateStr } = useClock();
  const { today, tomorrow, status, error } = useCalendar();
  const layoutMode = useLayoutMode();
  const hasTodayEvents = today.length > 0;

  if (status === 'loading') {
    return (
      <div className="kiosk">
        <Header dayDateStr={dayDateStr} timeStr={timeStr} />
        <main className="main">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={layoutMode === 'dashboard' ? 'dashboard-page' : 'kiosk'}>
      <Header dayDateStr={dayDateStr} timeStr={timeStr} />
      {layoutMode === 'dashboard' ? (
        <div className="dashboard-root">
          {status === 'error' && (
            <div className="error-banner" role="alert">
              Calendar refresh failed. Showing last available data.
              {error ? ` (${error})` : ''}
            </div>
          )}
          <DashboardLayout today={today} tomorrow={tomorrow} />
        </div>
      ) : (
        <main className="main">
          {status === 'error' && (
            <div className="error-banner" role="alert">
              Calendar refresh failed. Showing last available data.
              {error ? ` (${error})` : ''}
            </div>
          )}
          {hasTodayEvents && (
            <Section
              title="TODAY"
              events={today}
              maxVisible={20}
              emptyMessage="No more events today"
            />
          )}
          <div className="section-divider" role="separator" aria-label="Tomorrow section">
            <span className="section-divider-line" aria-hidden="true" />
            <span className="section-divider-label">Tomorrow</span>
            <span className="section-divider-line" aria-hidden="true" />
          </div>
          <Section
            title="TOMORROW"
            events={tomorrow}
            maxVisible={20}
            emptyMessage="No events tomorrow"
          />
        </main>
      )}
    </div>
  );
}
