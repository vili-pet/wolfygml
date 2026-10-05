import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { KeyStatus } from '@/lib/telemetry';

const config: Record<KeyStatus, { color: string; dot: string; icon: typeof CheckCircle2 }> = {
  ok: { color: 'text-emerald-400', dot: 'bg-emerald-400', icon: CheckCircle2 },
  degraded: { color: 'text-amber-400', dot: 'bg-amber-400', icon: AlertTriangle },
  exhausted: { color: 'text-rose-400', dot: 'bg-rose-400', icon: XCircle },
};

export function StatusBadge({ status }: { status: KeyStatus }) {
  const { color, dot, icon: Icon } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border border-zinc-700/70 bg-zinc-800/60 px-2 py-1 text-xs font-medium ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <Icon size={12} strokeWidth={2.5} className="hidden sm:block" />
      <span className="capitalize">{status}</span>
    </span>
  );
}
