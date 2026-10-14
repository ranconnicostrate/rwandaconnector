import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationIcon, RulerIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { useRoute } from '../../hooks/useRoute';
import { Modal } from '../ui/Modal';
import { JobMap } from '../map/JobMap';
import { OriginControl } from '../map/OriginControl';
import { RoutePanel } from '../map/RoutePanel';
import { directionsUrl, formatDistance, haversineKm, jobAddress, jobCoords } from '../../utils/geo';
import type { Job } from '../../types';

/** One workplace on the map, with straight-line distance, road routes and directions. */
export function JobMapModal({ job, open, onClose }: {job: Job;open: boolean;onClose: () => void;}) {
  const { t, option } = useTranslation();
  const { companyById } = usePlatform();
  const { origin } = useUserLocation();
  const at = jobCoords(job);
  const route = useRoute(origin, at);
  const company = companyById(job.companyId);

  if (!at) return null;
  const km = origin ? haversineKm(origin, at) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="lg"
      title={job.title}
      subtitle={[company?.name, jobAddress(job)].filter(Boolean).join(' · ')}>
      
      <div className="space-y-4">
        {open &&
        <JobMap
          jobs={[job]}
          origin={origin}
          routes={route.status === 'ready' ? route.routes : undefined}
          activeRoute={route.active}
          focusJobId={job.id}
          className="h-[300px] sm:h-[380px]" />

        }

        {origin ?
        <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <RulerIcon className="h-3.5 w-3.5" /> {t('geo.straightLine')}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink-900">
                {formatDistance(km ?? 0, option.locale)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-400">{t('geo.straightLineNote')}</p>
            </div>
            <RoutePanel route={route} />
          </div> :

        <div className="space-y-2 rounded-xl bg-surface-muted p-4">
            <p className="text-sm font-semibold text-ink-900">{t('geo.setLocationForRoute')}</p>
            <OriginControl />
          </div>
        }

        <div className="flex flex-wrap justify-end gap-2 border-t border-surface-border pt-4">
          <Link
            to={`/jobs/${job.id}`}
            onClick={onClose}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
            {t('geo.viewJob')}
          </Link>
          <a
            href={directionsUrl(at, origin, route.mode)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            <NavigationIcon className="h-4 w-4" /> {t('geo.getDirections')}
          </a>
        </div>
      </div>
    </Modal>);

}