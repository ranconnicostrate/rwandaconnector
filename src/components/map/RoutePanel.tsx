import React from 'react';
import { BikeIcon, CarIcon, FootprintsIcon, Loader2Icon, RouteIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { formatDistance, formatDuration, type TravelMode } from '../../utils/geo';
import type { useRoute } from '../../hooks/useRoute';

const MODES: {value: TravelMode;icon: typeof CarIcon;key: string;}[] = [
{ value: 'driving', icon: CarIcon, key: 'geo.driving' },
{ value: 'walking', icon: FootprintsIcon, key: 'geo.walking' },
{ value: 'cycling', icon: BikeIcon, key: 'geo.cycling' }];


/** Road distance and travel-time estimates, with alternatives when offered. */
export function RoutePanel({ route }: {route: ReturnType<typeof useRoute>;}) {
  const { t, option } = useTranslation();

  return (
    <section aria-labelledby="route-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="route-heading" className="text-sm font-bold text-ink-900">
          {t('geo.road')}
        </h3>
        <div role="radiogroup" aria-label={t('geo.road')} className="flex rounded-lg bg-surface-muted p-0.5">
          {MODES.map((m) =>
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={route.mode === m.value}
            onClick={() => route.changeMode(m.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            route.mode === m.value ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-900'}`
            }>
            
              <m.icon className="h-3.5 w-3.5" /> {t(m.key)}
            </button>
          )}
        </div>
      </div>

      {route.status === 'idle' &&
      <button
        type="button"
        onClick={route.calculate}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
        
          <RouteIcon className="h-4 w-4" /> {t('geo.calculateRoute')}
        </button>
      }

      {route.status === 'loading' &&
      <p role="status" className="flex items-center gap-2 py-2 text-sm text-ink-500">
          <Loader2Icon className="h-4 w-4 animate-spin" /> {t('geo.calculating')}
        </p>
      }

      {route.status === 'error' &&
      <div role="alert" className="space-y-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <p>{route.errorReason === 'no_route' ? t('geo.noRoute') : t('geo.routeFailed')}</p>
          <button type="button" onClick={route.calculate} className="font-semibold underline">
            {t('geo.tryAgain')}
          </button>
        </div>
      }

      {route.status === 'ready' &&
      <ul className="space-y-1.5">
          {route.routes.map((r, i) =>
        <li key={i}>
              <button
            type="button"
            aria-pressed={route.active === i}
            onClick={() => route.setActive(i)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ${
            route.active === i ? 'border-brand-400 bg-brand-50' : 'border-surface-border hover:border-brand-200'}`
            }>
            
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-ink-500">
                    {i === 0 ? t('geo.fastest') : t('geo.alternative', { n: i })}
                    {r.summary ? ` · ${t('geo.via', { road: r.summary })}` : ''}
                  </span>
                  <span className="block text-base font-extrabold text-ink-900">{formatDuration(r.durationS)}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-700">
                  {formatDistance(r.distanceM / 1000, option.locale)}
                </span>
              </button>
            </li>
        )}
        </ul>
      }

      <p className="text-[11px] leading-relaxed text-ink-400">{t('geo.routeEstimate')}</p>
    </section>);

}