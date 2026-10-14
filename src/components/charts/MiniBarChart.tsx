import React from 'react';

export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  title: string;
  caption?: string;
  color?: string;
  formatValue?: (value: number) => string;
}

export function MiniBarChart({ data, title, caption, color = '#1668e3', formatValue }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
        {caption && <p className="text-xs text-ink-400">{caption}</p>}
      </div>
      <ul className="flex h-44 items-end gap-3">
        {data.map((d) =>
        <li key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold tabular-nums text-ink-500">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <span
            className="w-full rounded-t-md transition-[height] duration-200"
            style={{ height: `${Math.max(d.value / max * 100, 4)}%`, backgroundColor: color }}
            aria-hidden="true" />
          
            <span className="text-[11px] text-ink-400">{d.label}</span>
          </li>
        )}
      </ul>
    </section>);

}

export function ProgressList({
  title,
  items



}: {title: string;items: {label: string;value: number;color: string;}[];}) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1;
  return (
    <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold text-ink-900">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) =>
        <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-ink-700">{item.label}</span>
              <span className="font-bold tabular-nums text-ink-900">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
              className="h-full rounded-full"
              style={{ width: `${item.value / total * 100}%`, backgroundColor: item.color }} />
            
            </div>
          </li>
        )}
      </ul>
    </section>);

}