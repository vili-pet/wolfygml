import { useMemo } from 'react';
import type { UsageBucket } from '@/lib/telemetry';
import { bucketTimestamp, fmtM, shortTime } from '@/lib/format';
import { useElementWidth } from '@/lib/useElementWidth';
import { ChartFrame } from './ChartFrame';

interface Props {
  buckets: UsageBucket[];
}

export function TokenMixChart({ buckets }: Props) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const points = useMemo(() => {
    return [...buckets]
      .sort((a, b) => bucketTimestamp(a) - bucketTimestamp(b))
      .map((b) => ({
        t: bucketTimestamp(b),
        prompt: b.promptTokens / 1000000,
        completion: b.completionTokens / 1000000,
      }));
  }, [buckets]);

  const legend = (
    <div className="flex gap-3 text-[11px] text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-cyan-400" />
        prompt
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-amber-400" />
        completion
      </span>
    </div>
  );

  if (points.length < 2) {
    return (
      <ChartFrame title="Token Split" unit="M tokens / 15 min" action={legend}>
        <div className="flex h-[190px] items-center justify-center text-sm text-zinc-600">
          Not enough data yet
        </div>
      </ChartFrame>
    );
  }

  const W = Math.max(width, 280);
  const H = 190;
  const PAD_L = 40;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const tMin = points[0].t;
  const tMax = points[points.length - 1].t;
  const vMax = Math.max(...points.map((p) => p.prompt + p.completion)) || 1;
  const xs = points.map((p) => PAD_L + ((p.t - tMin) / (tMax - tMin || 1)) * chartW);
  const ysTotal = points.map((p) => PAD_T + (1 - (p.prompt + p.completion) / vMax) * chartH);
  const ysPrompt = points.map((p) => PAD_T + (1 - p.prompt / vMax) * chartH);

  const gridVals = [0, vMax * 0.5, vMax];
  const stepIdx = Math.max(1, Math.floor(points.length / (W < 480 ? 3 : 6)));
  const area = `M${xs[0]},${ysTotal[0]} ` + xs.slice(1).map((x, i) => `L${x},${ysTotal[i + 1]}`).join(' ') + ` L${xs[xs.length - 1]},${H - PAD_B} L${xs[0]},${H - PAD_B} Z`;

  return (
    <ChartFrame title="Token Split" unit="M tokens / 15 min" action={legend}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Prompt and completion token split">
          <defs>
            <linearGradient id="mix-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#22d3ee" stopOpacity={0.3} />
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
          <path d={area} fill="url(#mix-grad)" />
          <polyline points={points.map((_, i) => `${xs[i]},${ysTotal[i]}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth={1.75} />
          <polyline points={points.map((_, i) => `${xs[i]},${ysPrompt[i]}`).join(' ')} fill="none" stroke="#fbbf24" strokeWidth={1.75} strokeDasharray="4,3" />
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
