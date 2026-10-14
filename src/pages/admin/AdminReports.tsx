import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { StatTile } from '../../components/ui/StatTile';

type Filter = 'PENDING' | 'RESOLVED' | 'REJECTED';

export function AdminReports() {
  const { t, formatRelative } = useTranslation();
  const { reports, personById, resolveReport } = usePlatform();
  const [filter, setFilter] = useState<Filter>('PENDING');

  const count = (state: Filter) => reports.filter((r) => r.state === state).length;
  const rows = reports.filter((r) => r.state === filter);

  const tabs: {key: Filter;label: string;}[] = [
  { key: 'PENDING', label: t('admin.pendingReports') },
  { key: 'RESOLVED', label: t('admin.resolvedReports') },
  { key: 'REJECTED', label: t('admin.rejectedReports') }];


  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.reports')}</h1>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label={t('admin.pendingReports')} value={count('PENDING')} tone="primary" />
        <StatTile label={t('admin.resolvedReports')} value={count('RESOLVED')} />
        <StatTile label={t('admin.rejectedReports')} value={count('REJECTED')} />
      </div>

      <div role="tablist" className="flex gap-2 rounded-2xl border border-surface-border bg-white p-2 shadow-card">
        {tabs.map((tb) =>
        <button
          key={tb.key}
          role="tab"
          aria-selected={filter === tb.key}
          type="button"
          onClick={() => setFilter(tb.key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
          filter === tb.key ? 'bg-navy-700 text-white' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
          }>
          
            {tb.label}
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {rows.map((report) =>
        <li
          key={report.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-surface-border bg-white p-4 shadow-card">
          
            <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-[11px] font-bold uppercase text-ink-500">
              {report.target}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{report.targetLabel}</p>
              <p className="text-xs text-ink-500">
                {t('admin.reason')}: {report.reason}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {t('admin.reportedBy')}: {personById(report.reporterId)?.name} · {formatRelative(report.createdAt)}
              </p>
            </div>
            {report.state === 'PENDING' &&
          <div className="flex gap-2">
                <button
              type="button"
              onClick={() => resolveReport(report.id, 'RESOLVED')}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
                  {t('admin.resolve')}
                </button>
                <button
              type="button"
              onClick={() => resolveReport(report.id, 'REJECTED')}
              className="rounded-lg border border-surface-border px-4 py-2 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
              
                  {t('admin.dismiss')}
                </button>
              </div>
          }
          </li>
        )}
        {rows.length === 0 &&
        <li className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
            {t('common.noResults')}
          </li>
        }
      </ul>
    </div>);

}