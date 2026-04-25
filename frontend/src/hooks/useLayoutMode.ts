import { useEffect, useState } from 'react';

export type LayoutMode = 'kiosk' | 'dashboard';

const DASHBOARD_MEDIA_QUERY = '(min-width: 1400px) and (min-height: 900px)';

function getInitialMode(): LayoutMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'kiosk';
  }
  return window.matchMedia(DASHBOARD_MEDIA_QUERY).matches ? 'dashboard' : 'kiosk';
}

export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(getInitialMode);

  useEffect(() => {
    const query = window.matchMedia(DASHBOARD_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setMode(event.matches ? 'dashboard' : 'kiosk');

    setMode(query.matches ? 'dashboard' : 'kiosk');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return mode;
}
