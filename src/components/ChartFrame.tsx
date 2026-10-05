import type { ReactNode } from 'react';

interface Props {
  title: string;
  unit?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ChartFrame({ title, unit, action, children }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 px-3.5 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:text-sm sm:tracking-normal">
            {title}
          </h3>
          {unit && <p className="text-[11px] text-zinc-500">{unit}</p>}
        </div>
        {action}
      </div>
      <div className="overflow-hidden p-2 sm:p-3">{children}</div>
    </div>
  );
}
