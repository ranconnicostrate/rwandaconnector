import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InfoIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { JobMap } from '../map/JobMap';
import { Avatar } from '../ui/Avatar';
import { formatDistance, jobAddress } from '../../utils/geo';
import type { JobResult } from '../../hooks/useJobSearch';

interface JobsMapViewProps {
  results: JobResult[];
  radiusKm: number | null;
  remoteCount: number;
  unpinnedCount: number;
}

/** Every matching workplace on one map, with a synced list alongside. */
export function JobsMapView({ results, radiusKm, remoteCount, unpinnedCount }: JobsMapViewProps) {
  const { t, formatSalary, option } = useTranslation();
  const { companyById } = usePlatform();
  const { origin } = useUserLocation();
  const [focus, setFocus] = useState<string | null>(null);
  const mapped = results.filter((r) => r.at);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-2">
          <JobMap
            jobs={mapped.map((r) => r.job)}
            origin={origin}
            radiusKm={origin ? radiusKm : null}
            focusJobId={focus}
            onSelectJob={setFocus}
            className="h-[420px] lg:h-[620px]" />
          
          <ul className="flex flex-wrap items-center gap-4 px-1 text-xs text-ink-500" aria-label={t('geo.legend')}>
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-brand-600" /> {t('geo.onSite')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#c9940f]" /> {t('geo.hybrid')}
            </li>
            {origin &&
            <li className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-leaf-600 ring-2 ring-leaf-200" /> {t('geo.yourLocation')}
              </li>
            }
          </ul>
        </div>

        <section
          aria-label={t('geo.listView')}
          className="max-h-[620px] overflow-y-auto rounded-2xl border border-surface-border bg-white shadow-card scrollbar-thin">
          
          {mapped.length === 0 ?
          <p className="p-8 text-center text-sm text-ink-400">{t('common.noResults')}</p> :

          <ul className="divide-y divide-surface-border">
              {mapped.map(({ job, km }) => {
              const company = companyById(job.companyId);
              const active = focus === job.id;
              return (
                <li key={job.id}>
                    <div
                    className={`flex gap-3 p-3.5 transition-colors duration-150 ${active ? 'bg-brand-50' : 'hover:bg-surface-muted'}`}>
                    
                      <Avatar
                      name={company?.name ?? ''}
                      initials={company?.logo}
                      color={company?.logoColor}
                      photo={company?.logoUrl}
                      size="sm"
                      square />
                    
                      <div className="min-w-0 flex-1">
                        <button
                        type="button"
                        onClick={() => setFocus(job.id)}
                        aria-pressed={active}
                        className="block w-full truncate text-left text-sm font-bold text-ink-900 hover:text-brand-700">
                        
                          {job.title}
                        </button>
                        <p className="truncate text-xs text-ink-500">{company?.name}</p>
                        <p className="truncate text-xs text-ink-400">{jobAddress(job)}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-leaf-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          {km !== null &&
                        <span className="font-bold text-navy-700" title={t('geo.straightLine')}>
                              {t('geo.away', { distance: formatDistance(km, option.locale) })}
                            </span>
                        }
                          <Link to={`/jobs/${job.id}`} className="ml-auto font-semibold text-brand-600 hover:text-brand-700">
                            {t('geo.viewJob')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>);

            })}
            </ul>
          }
        </section>
      </div>

      {(remoteCount > 0 || unpinnedCount > 0) &&
      <p className="flex items-start gap-2 rounded-xl bg-surface-muted px-4 py-3 text-xs text-ink-500">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {remoteCount > 0 && t('geo.offMapRemote', { count: remoteCount })}{' '}
            {unpinnedCount > 0 && t('geo.offMapUnpinned', { count: unpinnedCount })}{' '}
            {t('geo.seeListView')}
          </span>
        </p>
      }
      {origin && <p className="px-1 text-[11px] text-ink-400">{t('geo.straightLineNote')}</p>}
    </div>);

}