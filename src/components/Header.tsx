import { Activity } from 'lucide-react';
import type { TelemetryData } from '@/lib/telemetry';
import { timeAgo } from '@/lib/format';

interface Props {
  data: TelemetryData | null;
  error: string | null;
}

export function Header({ data, error }: Props) {
  const lastSync = data ? timeAgo(data.telemetryUpdatedAt) : null;
  const okCount = data ? data.keys.filter((k) => k.status === 'ok').length : 0;
  const statusLabel = error ? 'error' : okCount > 0 ? `${okCount} keys active` : 'connecting';

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/70 bg-zinc-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-400">
          <Activity size={16} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-100">
            GLM Key Tracker
          </h1>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                error ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-xs text-zinc-500">{statusLabel}</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          {data && (
            <p className="font-mono text-xs text-zinc-400">
              Data updated <span className="text-zinc-200">{lastSync}</span>
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
