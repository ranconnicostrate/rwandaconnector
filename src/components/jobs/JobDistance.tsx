import React from 'react';
import { NavigationIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useUserLocation } from '../../contexts/LocationContext';
import { formatDistance, haversineKm, jobCoords } from '../../utils/geo';
import type { Job } from '../../types';

/** "4.5 km away" — straight-line distance from the selected location. */
export function JobDistance({ job, className = '' }: {job: Job;className?: string;}) {
  const { t, option } = useTranslation();
  const { origin } = useUserLocation();
  const at = jobCoords(job);
  if (!origin || !at) return null;
  const label = formatDistance(haversineKm(origin, at), option.locale);
  return (
    <span
      title={t('geo.straightLine')}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-navy-50 px-2 py-1 text-xs font-bold text-navy-700 ${className}`}>
      
      <NavigationIcon className="h-3 w-3" aria-hidden="true" />
      {t('geo.away', { distance: label })}
      <span className="sr-only">({t('geo.straightLine')})</span>
    </span>);

}