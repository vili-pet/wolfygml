import { useEffect, useState } from 'react';
import type { TelemetryData } from './telemetry';

export interface TelemetryState {
  data: TelemetryData | null;
  error: string | null;
  fetchedAt: number | null;
}

export function useTelemetry(pollMs = 60000): TelemetryState {
  const [state, setState] = useState<TelemetryState>({ data: null, error: null, fetchedAt: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('./data.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as TelemetryData;
        if (!cancelled) {
          setState({ data: json, error: null, fetchedAt: Date.now() });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : 'fetch failed' }));
        }
      }
    }

    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
