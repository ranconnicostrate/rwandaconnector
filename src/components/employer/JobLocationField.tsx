import React, { useRef, useState } from 'react';
import { AlertCircleIcon, Building2Icon, GlobeIcon, Loader2Icon, MapPinIcon, SplitIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { PROVINCES } from '../../data/rwandaLocations';
import { reverseGeocode, type Place } from '../../services/geocoding';
import { canonicalDistrict, isInRwanda, provinceOfDistrict, type LatLng } from '../../utils/geo';
import { PlaceSearch } from '../map/PlaceSearch';
import { LocationPickerMap } from '../map/LocationPickerMap';
import type { Job, WorkLocationType } from '../../types';

export interface JobLocationValue {
  workLocationType: WorkLocationType;
  latitude: number | null;
  longitude: number | null;
  streetAddress: string;
  sector: string;
  district: string;
  location: string;
}

export const EMPTY_JOB_LOCATION: JobLocationValue = {
  workLocationType: 'ON_SITE',
  latitude: null,
  longitude: null,
  streetAddress: '',
  sector: '',
  district: '',
  location: ''
};

export function locationFromJob(job: Job): JobLocationValue {
  return {
    workLocationType: job.workLocationType ?? 'ON_SITE',
    latitude: job.latitude ?? null,
    longitude: job.longitude ?? null,
    streetAddress: job.streetAddress ?? '',
    sector: job.sector ?? '',
    district: canonicalDistrict(job.district) ?? '',
    location: job.workLocationType === 'REMOTE' ? '' : job.location
  };
}

const MODES: {value: WorkLocationType;icon: typeof Building2Icon;label: string;body: string;}[] = [
{ value: 'ON_SITE', icon: Building2Icon, label: 'geo.onSite', body: 'geo.modeOnSiteBody' },
{ value: 'HYBRID', icon: SplitIcon, label: 'geo.hybrid', body: 'geo.modeHybridBody' },
{ value: 'REMOTE', icon: GlobeIcon, label: 'geo.remote', body: 'geo.modeRemoteBody' }];


const field =
'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

/** Employer workplace picker: work mode, address search, draggable map pin and address fields. */
export function JobLocationField({ value, onChange }: {value: JobLocationValue;onChange: (v: JobLocationValue) => void;}) {
  const { t } = useTranslation();
  const [lookup, setLookup] = useState<'idle' | 'loading' | 'failed'>('idle');
  const lookupId = useRef(0);
  const point: LatLng | null =
  value.latitude !== null && value.longitude !== null ? { lat: value.latitude, lng: value.longitude } : null;
  const outside = point ? !isInRwanda(point) : false;
  const province = provinceOfDistrict(value.district);

  const fromPlace = (place: Place, base: JobLocationValue): JobLocationValue => {
    const district = canonicalDistrict(place.district) ?? base.district;
    return {
      ...base,
      latitude: place.lat,
      longitude: place.lng,
      streetAddress: place.street ?? base.streetAddress,
      sector: place.sector ?? base.sector,
      district,
      location: place.city ?? base.location
    };
  };

  const pick = (p: LatLng) => {
    const next = { ...value, latitude: p.lat, longitude: p.lng };
    onChange(next);
    const id = ++lookupId.current;
    setLookup('loading');
    reverseGeocode(p).
    then((place) => {
      if (id !== lookupId.current) return;
      if (!place) {
        setLookup('failed');
        return;
      }
      setLookup('idle');
      onChange(fromPlace(place, next));
    }).
    catch(() => id === lookupId.current && setLookup('failed'));
  };

  return (
    <fieldset className="space-y-3 rounded-xl border border-surface-border p-4">
      <legend className="px-1 text-sm font-bold text-ink-900">{t('geo.employerTitle')}</legend>

      <div role="radiogroup" aria-label={t('geo.workMode')} className="grid gap-2 sm:grid-cols-3">
        {MODES.map((m) =>
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value.workLocationType === m.value}
          onClick={() => onChange({ ...value, workLocationType: m.value })}
          className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors duration-150 ${
          value.workLocationType === m.value ? 'border-brand-400 bg-brand-50' : 'border-surface-border hover:border-brand-200'}`
          }>
          
            <m.icon className={`mt-0.5 h-4 w-4 shrink-0 ${value.workLocationType === m.value ? 'text-brand-600' : 'text-ink-400'}`} />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{t(m.label)}</span>
              <span className="block text-xs text-ink-500">{t(m.body)}</span>
            </span>
          </button>
        )}
      </div>

      {value.workLocationType === 'REMOTE' ?
      <p className="rounded-lg bg-surface-muted px-3 py-2.5 text-xs text-ink-500">{t('geo.remoteNote')}</p> :

      <>
          <PlaceSearch
          placeholder={t('geo.searchWorkplace')}
          onSelect={(place) => {
            lookupId.current += 1;
            setLookup('idle');
            onChange(fromPlace(place, value));
          }} />
        
          <LocationPickerMap value={point} onPick={pick} />
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            {lookup === 'loading' ?
          <>
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> {t('geo.lookingUp')}
              </> :
          lookup === 'failed' ?
          <span className="text-amber-700">{t('geo.lookupFailed')}</span> :

          t('geo.pickOnMap')
          }
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="loc-street">
                {t('geo.street')}
              </label>
              <input
              id="loc-street"
              maxLength={160}
              value={value.streetAddress}
              onChange={(e) => onChange({ ...value, streetAddress: e.target.value })}
              placeholder="Kigali Heights, KG 7 Ave"
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="loc-sector">
                {t('geo.sector')}
              </label>
              <input
              id="loc-sector"
              maxLength={60}
              value={value.sector}
              onChange={(e) => onChange({ ...value, sector: e.target.value })}
              placeholder="Kimihurura"
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="loc-district">
                {t('geo.district')}
              </label>
              <select
              id="loc-district"
              value={value.district}
              onChange={(e) => onChange({ ...value, district: e.target.value })}
              className={field}>
              
                <option value="">{t('geo.chooseDistrict')}</option>
                {PROVINCES.map((p) =>
              <optgroup key={p.name} label={p.name}>
                    {p.districts.map((d) =>
                <option key={d} value={d}>
                        {d}
                      </option>
                )}
                  </optgroup>
              )}
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-surface-muted px-3 py-2.5">
            <p className="text-[11px] font-semibold text-ink-400">{t('geo.preview')}</p>
            {point ?
          <p className="mt-0.5 flex items-start gap-1.5 text-sm text-ink-900">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>
                  {[value.streetAddress, value.sector, value.district, province, 'Rwanda'].filter(Boolean).join(', ')}
                  <span className="block font-mono text-[11px] text-ink-400">
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                  </span>
                </span>
              </p> :

          <p className="mt-0.5 text-sm text-ink-500">{t('geo.noPin')}</p>
          }
            {outside &&
          <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircleIcon className="h-3.5 w-3.5" /> {t('geo.pinOutside')}
              </p>
          }
          </div>
        </>
      }
    </fieldset>);

}