import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UsageBucket } from '@/lib/telemetry';
import { bucketTimestamp, fmtM, shortTime } from '@/lib/format';
import { useElementWidth } from '@/lib/useElementWidth';
import { ChartFrame } from './ChartFrame';

interface Props {
  buckets: UsageBucket[];
}

interface Pt {
  t: number;
  val: number;
}

const ranges = [
  { label: '6H', ms: 6 * 3600 * 1000 },
  { label: '24H', ms: 24 * 3600 * 1000 },
  { label: '7D', ms: 7 * 86400000 },
] as const;

export function ThroughputChart({ buckets }: Props) {
  const [range, setRange] = useState<(typeof ranges)[number]['label']>('6H');
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const points: Pt[] = useMemo(() => {
    const msCut = ranges.find((r) => r.label === range)!.ms;
    const cutoff = buckets.length ? Math.max(...buckets.map(bucketTimestamp)) - msCut : -Infinity;
    return buckets
      .filter((b) => bucketTimestamp(b) >= cutoff)
      .sort((a, b) => bucketTimestamp(a) - bucketTimestamp(b))
      .map((b) => ({ t: bucketTimestamp(b), val: b.totalTokensMillions }));
  }, [buckets, range]);

  const W = Math.max(width, 280);
  const H = 190;
  const PAD_L = 40;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const header = (
    <div className="relative">
      <select
        value={range}
        onChange={(e) => setRange(e.target.value as typeof range)}
        aria-label="Time range"
        className="appearance-none rounded border border-zinc-700/70 bg-zinc-800/70 py-1 pl-2.5 pr-6 font-mono text-xs text-zinc-200 outline-none transition-colors hover:border-zinc-600 focus:border-cyan-500"
      >
        {ranges.map((r) => (
          <option key={r.label} value={r.label}>
            {r.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500" />
    </div>
  );

  if (points.length < 2) {
    return (
      <ChartFrame title="Tokens Throughput" unit="M tokens / 15 min" action={header}>
        <div className="flex h-[190px] items-center justify-center text-sm text-zinc-600">
          Not enough data for this range
        </div>
      </ChartFrame>
    );
  }

  const tMin = points[0].t;
  const tMax = points[points.length - 1].t;
  const vMax = Math.max(...points.map((p) => p.val)) || 1;
  const xs = points.map((p) => PAD_L + ((p.t - tMin) / (tMax - tMin || 1)) * chartW);
  const ys = points.map((p) => PAD_T + (1 - p.val / vMax) * chartH);

  const gridVals = [0, vMax * 0.5, vMax];
  const stepIdx = Math.max(1, Math.floor(points.length / (W < 480 ? 3 : 6)));
  const line = points.map((_, i) => `${xs[i]},${ys[i]}`).join(' ');
  const area = `M${xs[0]},${ys[0]} ` + xs.slice(1).map((x, i) => `L${x},${ys[i + 1]}`).join(' ') + ` L${xs[xs.length - 1]},${H - PAD_B} L${xs[0]},${H - PAD_B} Z`;

  return (
    <ChartFrame title="Tokens Throughput" unit="M tokens / 15 min" action={header}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Token throughput chart">
          <defs>
            <linearGradient id="tp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#22d3ee" stopOpacity={0.35} />
              <stop offset="1" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridVals.map((v) => {
            const y = PAD_T + (1 - v / vMax) * chartH;
            return (
              <g key={v}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#3f3f46" strokeWidth={0.75} />
                <text x={PAD_L - 6} y={y + 3.5} fill="#a1a1aa" fontSize={11} fontFamily="monospace" textAnchor="end">
                  {fmtM(v)}
                </text>
              </g>
            );
          })}
          <path d={area} fill="url(#tp-grad)" />
          <polyline points={line} fill="none" stroke="#22d3ee" strokeWidth={1.75} strokeLinejoin="round" />
          {points
            .filter((_, i) => i % stepIdx === 0)
            .map((p) => {
              const idx = points.indexOf(p);
              return (
                <text
                  key={p.t}
                  x={xs[idx]}
                  y={H - 8}
                  fill="#a1a1aa"
                  fontSize={11}
                  fontFamily="monospace"
                  textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                >
                  {shortTime(p.t)}
                </text>
              );
            })}
        </svg>
      </div>
    </ChartFrame>
  );
}
