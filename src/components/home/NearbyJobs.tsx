import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { OriginControl } from '../map/OriginControl';
import { Avatar } from '../ui/Avatar';
import { JobLocationActions } from '../jobs/JobLocationActions';
import { JOB_TYPE_KEY, visibleJobs } from '../../utils/jobs';
import { formatDistance, haversineKm, jobAddress, jobCoords } from '../../utils/geo';

const RADII = [5, 10, 25, 50] as const;
const SHOWN = 5;

/** Closest open jobs to the person's chosen location. */
export function NearbyJobs() {
  const { t, formatSalary, option } = useTranslation();
  const { jobs, companyById } = usePlatform();
  const { origin } = useUserLocation();
  const [radius, setRadius] = useState<number>(10);

  const nearby = useMemo(() => {
    if (!origin) return [];
    return visibleJobs(jobs, companyById).
    map((job) => {
      const at = jobCoords(job);
      return at ? { job, km: haversineKm(origin, at) } : null;
    }).
    filter((r): r is {job: (typeof jobs)[number];km: number;} => r !== null && r.km <= radius).
    sort((a, b) => a.km - b.km);
  }, [jobs, companyById, origin, radius]);

  return (
    <section
      aria-labelledby="nearby-heading"
      className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
      
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="nearby-heading" className="text-lg font-extrabold text-ink-900">
            {t('geo.nearMe')}
          </h2>
          <p className="text-sm text-ink-500">{t('geo.nearMeBody')}</p>
        </div>
        {origin &&
        <div role="radiogroup" aria-label={t('geo.distance')} className="flex rounded-lg bg-surface-muted p-0.5">
            {RADII.map((km) =>
          <button
            key={km}
            type="button"
            role="radio"
            aria-checked={radius === km}
            onClick={() => setRadius(km)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            radius === km ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-900'}`
            }>
            
                {km} km
              </button>
          )}
          </div>
        }
      </header>

      <div className="mt-4">
        <OriginControl />
      </div>

      {origin &&
      <>
          {nearby.length === 0 ?
        <p className="mt-4 rounded-xl bg-surface-muted p-6 text-center text-sm text-ink-500">
              {t('geo.noneNearby', { km: radius })}
            </p> :

        <ul className="mt-4 divide-y divide-surface-border">
              {nearby.slice(0, SHOWN).map(({ job, km }) => {
            const company = companyById(job.companyId);
            return (
              <li key={job.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <Avatar
                    name={company?.name ?? ''}
                    initials={company?.logo}
                    color={company?.logoColor}
                    photo={company?.logoUrl}
                    size="md"
                    square />
                  
                      <div className="min-w-0">
                        <Link to={`/jobs/${job.id}`} className="block truncate text-sm font-bold text-ink-900 hover:text-brand-700">
                          {job.title}
                        </Link>
                        <p className="truncate text-xs text-ink-500">
                          {company?.name} · {jobAddress(job)}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          <span className="font-bold text-navy-700" title={t('geo.straightLine')}>
                            {t('geo.away', { distance: formatDistance(km, option.locale) })}
                          </span>{' '}
                          · {t(JOB_TYPE_KEY[job.type])} ·{' '}
                          <span className="font-semibold text-leaf-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <JobLocationActions job={job} />
                    </div>
                  </li>);

          })}
            </ul>
        }
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-surface-border pt-3">
            <p className="text-[11px] text-ink-400">{t('geo.straightLineNote')}</p>
            <Link
            to={`/jobs?view=map&radius=${radius}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            
              <MapIcon className="h-4 w-4" />
              {nearby.length > SHOWN ? t('geo.seeAllCount', { count: nearby.length }) : t('geo.seeAllOnMap')}
            </Link>
          </div>
        </>
      }
    </section>);

}