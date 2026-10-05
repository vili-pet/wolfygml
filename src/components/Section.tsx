import type { ReactNode } from 'react';

interface Props {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}

export function Section({ title, meta, children }: Props) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</h2>
        {meta && <span className="font-mono text-xs text-zinc-500">{meta}</span>}
      </div>
      {children}
    </section>
  );
}
