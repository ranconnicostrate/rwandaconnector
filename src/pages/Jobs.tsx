import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListIcon, MapIcon, SearchIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { JobCard } from '../components/jobs/JobCard';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobsMapView } from '../components/jobs/JobsMapView';
import { AdCarousel } from '../components/ads/AdCarousel';
import { useJobSearch } from '../hooks/useJobSearch';
import { RADIUS_OPTIONS_KM } from '../utils/geo';

export function Jobs() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const radiusParam = Number(params.get('radius'));
  const search = useJobSearch({
    query: params.get('q') ?? '',
    radiusKm: (RADIUS_OPTIONS_KM as readonly number[]).includes(radiusParam) ? radiusParam : null,
    sort: params.get('radius') ? 'nearest' : 'newest'
  });
  const { filters, set, results, remoteCount, unpinnedCount } = search;
  const view = params.get('view') === 'map' ? 'map' : 'list';

  // Only the view lives in the URL; filters stay in state, so switching
  // between map and list never loses them.
  const setView = (next: 'list' | 'map') => {
    const p = new URLSearchParams(params);
    if (next === 'map') p.set('view', 'map');else
    p.delete('view');
    setParams(p, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-ink-900">{t('jobs.searchJobs')}</h1>
          <div role="tablist" aria-label={t('geo.mapView')} className="flex rounded-lg bg-surface-muted p-1">
            {(
            [
            ['list', ListIcon, t('geo.listView')],
            ['map', MapIcon, t('geo.mapView')]] as
            const).
            map(([key, Icon, label]) =>
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150 ${
              view === key ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-900'}`
              }>
              
                <Icon className="h-4 w-4" /> {label}
              </button>
            )}
          </div>
        </div>

        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()} role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={filters.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              aria-label={t('jobs.jobTitle')}
              className="w-full rounded-xl border border-surface-border py-3 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none" />
            
          </div>
          {view === 'list' &&
          <button
            type="button"
            onClick={() => setView('map')}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-surface-border px-5 py-3 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
              <MapIcon className="h-4 w-4" /> {t('geo.viewAllOnMap')}
            </button>
          }
        </form>

        <div className="mt-4">
          <JobFilters search={search} />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-700" aria-live="polite">
          {t('jobs.results', { count: results.length })}
        </p>
      </section>

      {view === 'map' ?
      <JobsMapView
        results={results}
        radiusKm={filters.radiusKm}
        remoteCount={remoteCount}
        unpinnedCount={unpinnedCount} /> :


      <div className="space-y-4">
          {results.slice(0, 3).map(({ job }) =>
        <JobCard key={job.id} job={job} />
        )}
          {results.length > 0 && <AdCarousel layout="banner" />}
          {results.slice(3).map(({ job }) =>
        <JobCard key={job.id} job={job} />
        )}
          {results.length === 0 &&
        <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
              {t('common.noResults')}
            </p>
        }
        </div>
      }
    </div>);

}