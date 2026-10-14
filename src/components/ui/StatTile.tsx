import React from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tone?: 'default' | 'primary';
  hint?: string;
}

export function StatTile({ label, value, icon, tone = 'default', hint }: StatTileProps) {
  const primary = tone === 'primary';
  return (
    <div
      className={`rounded-xl border p-4 ${
      primary ? 'border-navy-700 bg-navy-700 text-white' : 'border-surface-border bg-white'}`
      }>
      
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-medium ${primary ? 'text-navy-100' : 'text-ink-500'}`}>{label}</p>
        {icon &&
        <span className={primary ? 'text-navy-100' : 'text-brand-600'} aria-hidden="true">
            {icon}
          </span>
        }
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${primary ? 'text-white' : 'text-ink-900'}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-xs ${primary ? 'text-navy-100' : 'text-ink-400'}`}>{hint}</p>}
    </div>);

}