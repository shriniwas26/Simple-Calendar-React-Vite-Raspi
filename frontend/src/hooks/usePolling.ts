import { useEffect, useRef } from 'react';

interface UsePollingParams {
  tick: () => Promise<boolean>;
  baseIntervalMs: number;
  maxIntervalMs: number;
}

export function usePolling({ tick, baseIntervalMs, maxIntervalMs }: UsePollingParams): void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const failCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const schedule = () => {
      const backoff = Math.min(baseIntervalMs * Math.pow(2, failCountRef.current), maxIntervalMs);
      const delay = failCountRef.current === 0 ? baseIntervalMs : backoff;
      timerRef.current = setTimeout(async () => {
        const ok = await tick();
        failCountRef.current = ok ? 0 : failCountRef.current + 1;
        if (!cancelled) {
          schedule();
        }
      }, delay);
    };

    tick().then((ok) => {
      failCountRef.current = ok ? 0 : failCountRef.current + 1;
      if (!cancelled) {
        schedule();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [baseIntervalMs, maxIntervalMs, tick]);
}
