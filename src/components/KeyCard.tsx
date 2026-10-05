import { useEffect, useState } from 'react';
import { CalendarClock, KeyRound, User, Zap } from 'lucide-react';
import type { KeyEntry, UsageBucket } from '@/lib/telemetry';
import { StatusBadge } from './StatusBadge';
import { fmtM, timeAgo } from '@/lib/format';

interface Props {
  k: KeyEntry;
  usage: UsageBucket[];
}

export function KeyCard({ k, usage }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const target = new Date('2026-10-08T00:00:00+03:00').getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const timeLeft = diff <= 0 ? 'expired' : `${days}d ${hours}h ${minutes}m ${seconds}s`;
  const consumed = usage.reduce((s, b) => s + b.totalTokensMillions, 0);
  const pct = Math.min(100, (consumed * 1000000 / k.budgetCap) * 100);
  const statusColor =
    k.status === 'ok' ? 'bg-emerald-500' : k.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500';

  const rows: { label: string; value: string }[] = [
    { label: 'Model', value: k.model },
    { label: 'Used', value: `${fmtM(consumed)}M / ${fmtM(k.budgetCap / 1000000)}M` },
    { label: 'Time remaining', value: timeLeft },
  ];

  return (
    <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <KeyRound size={16} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-medium text-zinc-100">{k.label}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-zinc-500">
              <User size={12} className="shrink-0" />
              {k.holder}
            </p>
          </div>
        </div>
        <StatusBadge status={k.status} />
      </div>

      <dl className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-zinc-500">{r.label}</dt>
            <dd className="font-mono text-zinc-200">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Budget consumed</span>
          <span className="font-mono text-zinc-300">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full ${statusColor} transition-all duration-500`}
            style={{ width: `${pct > 3 ? pct : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-800/70 pt-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <CalendarClock size={13} />
          {k.activeWindow}
        </span>
        <span className="flex items-center gap-1.5">
          <Zap size={13} className="text-cyan-400/70" />
          toggled {timeAgo(k.lastToggled)}
        </span>
      </div>
    </div>
  );
}
