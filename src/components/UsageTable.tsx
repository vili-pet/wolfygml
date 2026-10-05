import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UsageBucket } from '@/lib/telemetry';
import { bucketTimestamp, fmtInt, fmtM } from '@/lib/format';

interface Props {
  buckets: UsageBucket[];
}

type ColKey = 'ts' | 'tokens' | 'req' | 'err' | 'lat' | 'notes';

interface Row {
  ts: number;
  window: string;
  tokens: number;
  req: number;
  err: number;
  lat: number;
  notes: string;
}

const cols: { key: ColKey; label: string }[] = [
  { key: 'ts', label: 'bucket' },
  { key: 'tokens', label: 'tokens' },
  { key: 'req', label: 'requests' },
  { key: 'err', label: 'errors' },
  { key: 'lat', label: 'latency' },
  { key: 'notes', label: 'notes' },
];

export function UsageTable({ buckets }: Props) {
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'ts', dir: 'desc' });

  const rows: Row[] = useMemo(() => {
    const arr: Row[] = buckets.map((b) => ({
      ts: bucketTimestamp(b),
      window: `${b.date} · ${b.sessionStart}–${b.sessionEnd}`,
      tokens: b.totalTokensMillions,
      req: b.requestCount,
      err: b.errorCount,
      lat: b.averageLatencyMs,
      notes: b.notes,
    }));
    arr.sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr.slice(0, 100);
  }, [buckets, sort]);

  if (rows.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-zinc-600">No usage log entries</div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="divide-y divide-zinc-800/60 md:hidden">
        {rows.map((r) => (
          <div key={r.ts} className="p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-xs text-zinc-400">{r.window}</span>
              <span className="font-mono text-base text-cyan-400">{fmtM(r.tokens)}M</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">Requests</p>
                <p className="font-mono text-sm text-zinc-200">{fmtInt(r.req)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">Errors</p>
                <p className={`font-mono text-sm ${r.err > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {fmtInt(r.err)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">Latency</p>
                <p className="font-mono text-sm text-zinc-200">{fmtInt(r.lat)}ms</p>
              </div>
            </div>
            {r.notes && <p className="mt-2 text-xs text-amber-400/90">{r.notes}</p>}
          </div>
        ))}
      </div>

      {/* Desktop: sortable table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/70 text-left">
              {cols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  onClick={() =>
                    setSort({ key: c.key, dir: sort.key === c.key && sort.dir === 'asc' ? 'desc' : 'asc' })
                  }
                  className="cursor-pointer select-none px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  <span className="flex items-center gap-1.5">
                    {c.label}
                    {sort.key === c.key &&
                      (sort.dir === 'asc' ? (
                        <ArrowUp size={12} className="text-cyan-400" />
                      ) : (
                        <ArrowDown size={12} className="text-cyan-400" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ts} className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/30">
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-sm text-zinc-400">{r.window}</td>
                <td className="px-3 py-2.5 font-mono text-sm text-cyan-400">{fmtM(r.tokens)}M</td>
                <td className="px-3 py-2.5 font-mono text-sm text-zinc-300">{fmtInt(r.req)}</td>
                <td className={`px-3 py-2.5 font-mono text-sm ${r.err > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {fmtInt(r.err)}
                </td>
                <td className="px-3 py-2.5 font-mono text-sm text-zinc-300">{fmtInt(r.lat)}ms</td>
                <td className="max-w-[220px] truncate px-3 py-2.5 text-sm text-zinc-500">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
