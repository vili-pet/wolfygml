import { Clock, Hash, Layers, Timer, TrendingUp, Zap } from 'lucide-react';
import type { UsageBucket } from '@/lib/telemetry';
import { fmtCost, fmtInt, fmtM } from '@/lib/format';

interface Props {
  buckets: UsageBucket[];
}

export function KpiStrip({ buckets }: Props) {
  const totalTokens = buckets.reduce((s, b) => s + b.totalTokensMillions, 0);
  const totalReq = buckets.reduce((s, b) => s + b.requestCount, 0);
  const totalErr = buckets.reduce((s, b) => s + b.errorCount, 0);
  const totalSaved = buckets.reduce((s, b) => s + b.estimatedCostSavedUsd, 0);
  const avgLatency = buckets.length ? buckets.reduce((s, b) => s + b.averageLatencyMs, 0) / buckets.length : 0;
  const avgTps = buckets.length ? buckets.reduce((s, b) => s + b.tokensPerSecond, 0) / buckets.length : 0;
  const errPct = totalReq > 0 ? ((totalErr / totalReq) * 100).toFixed(2) : '0.00';

  const cards = [
    { icon: Layers, label: 'Total Tokens', value: `${fmtM(totalTokens)}M`, tone: 'accent' as const },
    { icon: Hash, label: 'Requests', value: fmtInt(totalReq), tone: 'plain' as const },
    { icon: Zap, label: 'Errors', value: `${fmtInt(totalErr)} · ${errPct}%`, tone: totalErr > 0 ? ('danger' as const) : ('plain' as const) },
    { icon: Timer, label: 'Avg Latency', value: `${Math.round(avgLatency)} ms`, tone: 'plain' as const },
    { icon: TrendingUp, label: 'Avg Tokens/s', value: fmtInt(Math.round(avgTps)), tone: 'plain' as const },
    { icon: Clock, label: 'Cost Saved', value: fmtCost(totalSaved), tone: 'accent' as const },
  ];

  const toneClass = {
    accent: 'text-cyan-400',
    danger: 'text-rose-400',
    plain: 'text-zinc-100',
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ icon: Icon, label, value, tone }) => (
        <div
          key={label}
          className="group flex flex-col justify-between gap-3 rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-3.5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/40 sm:p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 sm:text-xs">
              {label}
            </span>
            <Icon size={15} className="shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
          </div>
          <span className={`font-mono text-xl tabular-nums leading-none sm:text-2xl ${toneClass[tone]}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
