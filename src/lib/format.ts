import type { UsageBucket } from './telemetry';

export function bucketTimestamp(b: UsageBucket): number {
  return new Date(`${b.date}T${b.sessionStart}:00Z`).getTime();
}

export function fmtInt(n: number | null | undefined): string {
  return n == null ? '-' : n.toLocaleString('en-US');
}

export function fmtM(n: number): string {
  return n >= 100 ? n.toFixed(0) : n.toFixed(1);
}

export function fmtCost(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(2)}k` : `$${n.toFixed(2)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function countdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export function shortTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
