import { useMemo } from 'react';
import type { UsageBucket } from '@/lib/telemetry';
import { bucketTimestamp, fmtInt, shortTime } from '@/lib/format';
import { useElementWidth } from '@/lib/useElementWidth';
import { ChartFrame } from './ChartFrame';

interface Props {
  buckets: UsageBucket[];
}

export function ErrorLatencyChart({ buckets }: Props) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const points = useMemo(() => {
    return [...buckets]
      .sort((a, b) => bucketTimestamp(a) - bucketTimestamp(b))
      .map((b) => ({
        t: bucketTimestamp(b),
        err: b.errorCount,
        lat: b.averageLatencyMs,
      }));
  }, [buckets]);

  const legend = (
    <div className="flex gap-3 text-[11px] text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-rose-400" />
        errors
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-teal-400" />
        latency
      </span>
    </div>
  );

  if (points.length < 2) {
    return (
      <ChartFrame title="Latency and Errors" unit="ms latency · error count" action={legend}>
        <div className="flex h-[190px] items-center justify-center text-sm text-zinc-600">
          Not enough data yet
        </div>
      </ChartFrame>
    );
  }

  const W = Math.max(width, 280);
  const H = 190;
  const PAD_L = 40;
  const PAD_R = 40;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const tMin = points[0].t;
  const tMax = points[points.length - 1].t;
  const errMax = Math.max(...points.map((p) => p.err), 1);
  const latMax = Math.max(...points.map((p) => p.lat), 1);
  const xs = points.map((p) => PAD_L + ((p.t - tMin) / (tMax - tMin || 1)) * chartW);
  const ysErr = points.map((p) => PAD_T + (1 - p.err / errMax) * chartH);
  const ysLat = points.map((p) => PAD_T + (1 - p.lat / latMax) * chartH);
  const stepIdx = Math.max(1, Math.floor(points.length / (W < 480 ? 3 : 6)));

  return (
    <ChartFrame title="Latency and Errors" unit="ms latency · error count" action={legend}>
      <div ref={ref} className="w-full">
        <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Latency and error chart">
          {[0, errMax * 0.5, errMax].map((v) => {
            const y = PAD_T + (1 - v / errMax) * chartH;
            return (
              <g key={v}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#3f3f46" strokeWidth={0.75} />
                <text x={PAD_L - 6} y={y + 3.5} fill="#a1a1aa" fontSize={11} fontFamily="monospace" textAnchor="end">
                  {fmtInt(v)}
                </text>
              </g>
            );
          })}
          {points.map((p, i) => (
            p.err > 0 && (
              <rect
                key={i}
                x={xs[i] - 1.5}
                y={ysErr[i]}
                width={3}
                height={H - PAD_T - PAD_B - ysErr[i]}
                fill="#fb7185"
                fillOpacity={0.8}
              />
            )
          ))}
          <polyline points={points.map((_, i) => `${xs[i]},${ysLat[i]}`).join(' ')} fill="none" stroke="#2dd4bf" strokeWidth={1.75} />
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
