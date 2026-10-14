import React from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { PROVINCES } from '../../data/rwandaLocations';
import { RADIUS_OPTIONS_KM } from '../../utils/geo';
import { OriginControl } from '../map/OriginControl';
import type { useJobSearch, SortKey } from '../../hooks/useJobSearch';
import type { EmploymentType, WorkLocationType } from '../../types';

const TYPES: {value: EmploymentType | 'ALL';labelKey: string;}[] = [
{ value: 'ALL', labelKey: 'jobs.allTypes' },
{ value: 'FULL_TIME', labelKey: 'jobs.fullTime' },
{ value: 'PART_TIME', labelKey: 'jobs.partTime' },
{ value: 'CONTRACT', labelKey: 'jobs.contract' },
{ value: 'INTERNSHIP', labelKey: 'jobs.internship' }];


const MODES: {value: WorkLocationType | 'ALL';labelKey: string;}[] = [
{ value: 'ALL', labelKey: 'geo.anyWorkMode' },
{ value: 'ON_SITE', labelKey: 'geo.onSite' },
{ value: 'HYBRID', labelKey: 'geo.hybrid' },
{ value: 'REMOTE', labelKey: 'geo.remote' }];


const SALARY_BANDS = [0, 300000, 500000, 800000];

const select =
'min-w-0 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none disabled:bg-surface-muted disabled:text-ink-400';

export function JobFilters({ search }: {search: ReturnType<typeof useJobSearch>;}) {
  const { t, formatNumber } = useTranslation();
  const { filters, set, clear, experiences, hasOrigin } = search;
  const districtGroups =
  filters.province === 'ALL' ? PROVINCES : PROVINCES.filter((p) => p.name === filters.province);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-4">
        <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-ink-400">
          <SlidersHorizontalIcon className="h-3.5 w-3.5" /> {t('jobs.filters')}
        </span>
        <select
          value={filters.province}
          onChange={(e) => set('province', e.target.value)}
          aria-label={t('geo.province')}
          className={select}>
          
          <option value="ALL">{t('geo.allProvinces')}</option>
          {PROVINCES.map((p) =>
          <option key={p.name} value={p.name}>
              {p.name}
            </option>
          )}
        </select>
        <select
          value={filters.district}
          onChange={(e) => set('district', e.target.value)}
          aria-label={t('geo.district')}
          className={select}>
          
          <option value="ALL">{t('geo.allDistricts')}</option>
          {districtGroups.map((p) =>
          <optgroup key={p.name} label={p.name}>
              {p.districts.map((d) =>
            <option key={d} value={d}>
                  {d}
                </option>
            )}
            </optgroup>
          )}
        </select>
        <select
          value={filters.workMode}
          onChange={(e) => set('workMode', e.target.value as WorkLocationType | 'ALL')}
          aria-label={t('geo.workMode')}
          className={select}>
          
          {MODES.map((m) =>
          <option key={m.value} value={m.value}>
              {t(m.labelKey)}
            </option>
          )}
        </select>
        <select
          value={filters.type}
          onChange={(e) => set('type', e.target.value as EmploymentType | 'ALL')}
          aria-label={t('jobs.employmentType')}
          className={select}>
          
          {TYPES.map((tp) =>
          <option key={tp.value} value={tp.value}>
              {t(tp.labelKey)}
            </option>
          )}
        </select>
        <select
          value={filters.experience}
          onChange={(e) => set('experience', e.target.value)}
          aria-label={t('jobs.experience')}
          className={select}>
          
          <option value="ALL">{t('geo.allExperience')}</option>
          {experiences.map((x) =>
          <option key={x} value={x}>
              {x}
            </option>
          )}
        </select>
        <select
          value={filters.minSalary}
          onChange={(e) => set('minSalary', Number(e.target.value))}
          aria-label={t('jobs.salary')}
          className={select}>
          
          {SALARY_BANDS.map((band) =>
          <option key={band} value={band}>
              {band === 0 ? t('jobs.anySalary') : `${formatNumber(band)}+ RWF`}
            </option>
          )}
        </select>
        <button
          type="button"
          onClick={clear}
          className="px-2 text-sm font-semibold text-ink-500 transition-colors duration-150 hover:text-brand-700">
          
          {t('jobs.clearFilters')}
        </button>
      </div>

      <div className="grid gap-3 rounded-xl bg-surface-muted p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <OriginControl />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.radiusKm ?? ''}
            disabled={!hasOrigin}
            onChange={(e) => set('radiusKm', e.target.value ? Number(e.target.value) : null)}
            aria-label={t('geo.distance')}
            title={hasOrigin ? undefined : t('geo.needLocation')}
            className={select}>
            
            <option value="">{t('geo.anyDistance')}</option>
            {RADIUS_OPTIONS_KM.map((km) =>
            <option key={km} value={km}>
                {t('geo.withinKm', { km })}
              </option>
            )}
          </select>
          <select
            value={hasOrigin ? filters.sort : 'newest'}
            onChange={(e) => set('sort', e.target.value as SortKey)}
            aria-label={t('geo.sortBy')}
            className={select}>
            
            <option value="newest">{t('geo.sortNewest')}</option>
            <option value="nearest" disabled={!hasOrigin}>
              {t('geo.sortNearest')}
            </option>
            <option value="farthest" disabled={!hasOrigin}>
              {t('geo.sortFarthest')}
            </option>
          </select>
        </div>
      </div>
    </div>);

}