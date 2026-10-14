import React, { useState } from 'react';
import { GlobeIcon, MapIcon, MapPinOffIcon, NavigationIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useUserLocation } from '../../contexts/LocationContext';
import { directionsUrl, jobCoords, workMode } from '../../utils/geo';
import { JobMapModal } from './JobMapModal';
import type { Job } from '../../types';

interface JobLocationActionsProps {
  job: Job;
  size?: 'sm' | 'md';
}

/** View on Map + Get Directions, or a clear note when there's no workplace to show. */
export function JobLocationActions({ job, size = 'sm' }: JobLocationActionsProps) {
  const { t } = useTranslation();
  const { origin } = useUserLocation();
  const [open, setOpen] = useState(false);
  const at = jobCoords(job);
  const pad = size === 'md' ? 'px-4 py-2.5' : 'px-3 py-2';

  if (workMode(job) === 'REMOTE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-2 text-xs font-semibold text-ink-500">
        <GlobeIcon className="h-3.5 w-3.5" /> {t('geo.remoteNoWorkplace')}
      </span>);

  }

  if (!at) {
    return (
      <span className="inline-flex items-center gap-1.5 px-1 py-2 text-xs text-ink-400">
        <MapPinOffIcon className="h-3.5 w-3.5" /> {t('geo.notPinned')}
      </span>);

  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-surface-border ${pad} text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700`}>
        
        <MapIcon className="h-4 w-4" /> {t('geo.viewOnMap')}
      </button>
      <a
        href={directionsUrl(at, origin)}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg ${pad} text-sm font-semibold text-ink-500 transition-colors duration-150 hover:text-brand-700`}>
        
        <NavigationIcon className="h-4 w-4" /> {t('geo.getDirections')}
      </a>
      <JobMapModal job={job} open={open} onClose={() => setOpen(false)} />
    </>);

}