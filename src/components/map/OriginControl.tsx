import React, { useState } from 'react';
import { AlertCircleIcon, CrosshairIcon, Loader2Icon, LocateFixedIcon, MapPinIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useUserLocation, type LocationError } from '../../contexts/LocationContext';
import { formatDistance } from '../../utils/geo';
import { PlaceSearch } from './PlaceSearch';

const ERROR_KEY: Record<LocationError, string> = {
  denied: 'geo.errDenied',
  unavailable: 'geo.errUnavailable',
  timeout: 'geo.errTimeout',
  unsupported: 'geo.errUnsupported',
  insecure: 'geo.errInsecure'
};

/** "Use my current location" with a manual search alternative. */
export function OriginControl() {
  const { t, option } = useTranslation();
  const { origin, locating, error, warning, requestGps, setManual, clear } = useUserLocation();
  const [changing, setChanging] = useState(false);

  const warningText =
  warning === 'outside_rwanda' ?
  t('geo.outsideRwanda') :
  warning === 'low_accuracy' && origin?.accuracyM ?
  t('geo.lowAccuracy', { distance: formatDistance(origin.accuracyM / 1000, option.locale) }) :
  null;

  if (origin && !changing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex min-w-0 items-center gap-2 rounded-lg bg-leaf-50 px-3 py-2 text-sm text-leaf-600">
            {origin.source === 'gps' ?
            <LocateFixedIcon className="h-4 w-4 shrink-0" /> :

            <MapPinIcon className="h-4 w-4 shrink-0" />
            }
            <span className="font-semibold">{t('geo.yourLocation')}:</span>
            <span className="truncate text-ink-700">{origin.label}</span>
          </span>
          {origin.source === 'gps' &&
          <button
            type="button"
            onClick={requestGps}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
              <RefreshCwIcon className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} /> {t('geo.refresh')}
            </button>
          }
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
            {t('geo.change')}
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label={t('geo.clear')}
            className="rounded-lg p-2 text-ink-400 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {warningText && <p className="text-xs text-amber-700">{warningText}</p>}
        {origin.source === 'gps' && origin.accuracyM && !warningText &&
        <p className="text-[11px] text-ink-400">
            {t('geo.accuracy', { distance: formatDistance(origin.accuracyM / 1000, option.locale) })}
          </p>
        }
      </div>);

  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => {
            requestGps();
            setChanging(false);
          }}
          disabled={locating}
          className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-800 disabled:opacity-70">
          
          {locating ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CrosshairIcon className="h-4 w-4" />}
          {locating ? t('geo.locating') : t('geo.useMyLocation')}
        </button>
        <span className="text-center text-xs text-ink-400">{t('geo.or')}</span>
        <div className="min-w-0 flex-1">
          <PlaceSearch
            onSelect={(place) => {
              setManual(place);
              setChanging(false);
            }} />
          
        </div>
        {changing &&
        <button
          type="button"
          onClick={() => setChanging(false)}
          className="text-xs font-semibold text-ink-500 hover:text-ink-900">
          
            {t('common.cancel')}
          </button>
        }
      </div>
      {error &&
      <p role="alert" className="flex items-start gap-1.5 text-xs font-medium text-red-600">
          <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t(ERROR_KEY[error])}
        </p>
      }
      <p className="text-[11px] leading-relaxed text-ink-400">{t('geo.privacy')}</p>
    </div>);

}