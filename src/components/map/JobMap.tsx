import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { useLeafletMap } from '../../hooks/useLeafletMap';
import { JOB_TYPE_KEY } from '../../utils/jobs';
import {
  directionsUrl,
  formatDistance,
  haversineKm,
  jobAddress,
  jobCoords,
  workMode,
  type LatLng } from
'../../utils/geo';
import type { RouteOption } from '../../services/routing';
import type { Job } from '../../types';

interface JobMapProps {
  jobs: Job[];
  origin?: LatLng | null;
  radiusKm?: number | null;
  routes?: RouteOption[];
  activeRoute?: number;
  focusJobId?: string | null;
  onSelectJob?: (jobId: string) => void;
  className?: string;
}

interface Point {
  job: Job;
  at: LatLng;
}

/** Pixel size of the grid used to group nearby markers into clusters. */
const CLUSTER_CELL = 54;
const NO_CLUSTER_ZOOM = 16;

export function JobMap({
  jobs,
  origin,
  radiusKm,
  routes,
  activeRoute = 0,
  focusJobId,
  onSelectJob,
  className = 'h-[420px]'
}: JobMapProps) {
  const { t, formatSalary, option } = useTranslation();
  const { companyById } = usePlatform();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const markerById = useRef(new Map<string, L.Marker>());
  const selectRef = useRef(onSelectJob);
  selectRef.current = onSelectJob;

  const points = useMemo<Point[]>(
    () =>
    jobs.
    map((job) => ({ job, at: jobCoords(job) })).
    filter((p): p is Point => p.at !== null),
    [jobs]
  );
  const pointsKey = points.map((p) => p.job.id).join('|');

  const fitRef = useRef<() => void>(() => undefined);
  const { map, tileError } = useLeafletMap(containerRef, frameRef, {
    labels: { recenter: t('geo.recenter'), fullscreen: t('geo.fullscreen') },
    onRecenter: () => fitRef.current()
  });

  const fitAll = useCallback(() => {
    if (!map) return;
    const route = routes?.[activeRoute];
    const latlngs: L.LatLngExpression[] = points.map((p) => [p.at.lat, p.at.lng]);
    if (origin) latlngs.push([origin.lat, origin.lng]);
    if (route) route.coords.forEach((c) => latlngs.push(c));
    let bounds = latlngs.length ? L.latLngBounds(latlngs) : null;
    if (origin && radiusKm) {
      const circle = L.latLng(origin.lat, origin.lng).toBounds(radiusKm * 2000);
      bounds = bounds ? bounds.extend(circle) : circle;
    }
    if (!bounds) return;
    if (latlngs.length === 1 && !radiusKm) map.setView(latlngs[0], 15);else
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
  }, [map, points, origin, radiusKm, routes, activeRoute]);
  fitRef.current = fitAll;

  const buildPopup = useCallback(
    (job: Job, at: LatLng) => {
      const company = companyById(job.companyId);
      const root = document.createElement('div');
      root.className = 'rc-popup';
      const line = (text: string, cls?: string) => {
        const p = document.createElement('p');
        if (cls) p.className = cls;
        p.textContent = text; // textContent keeps user-entered text inert
        root.appendChild(p);
      };
      line(job.title, 'rc-popup-title');
      if (company) line(company.name);
      line(jobAddress(job));
      line(
        [
        t(JOB_TYPE_KEY[job.type]),
        workMode(job) === 'HYBRID' ? t('geo.hybrid') : null,
        formatSalary(job.salaryMin, job.salaryMax)].

        filter(Boolean).
        join(' · ')
      );
      if (origin) {
        line(`${t('geo.away', { distance: formatDistance(haversineKm(origin, at), option.locale) })} · ${t('geo.straightLineShort')}`);
      }
      const actions = document.createElement('div');
      actions.className = 'rc-popup-actions';
      const view = document.createElement('button');
      view.type = 'button';
      view.textContent = t('geo.viewJob');
      view.addEventListener('click', () => navigate(`/jobs/${job.id}`));
      const dir = document.createElement('a');
      dir.href = directionsUrl(at, origin);
      dir.target = '_blank';
      dir.rel = 'noopener noreferrer';
      dir.textContent = t('geo.getDirections');
      actions.append(view, dir);
      root.appendChild(actions);
      return root;
    },
    [companyById, t, formatSalary, origin, option.locale, navigate]
  );

  const renderMarkers = useCallback(() => {
    if (!map) return;
    if (!markersRef.current) markersRef.current = L.layerGroup().addTo(map);
    const layer = markersRef.current;
    layer.clearLayers();
    markerById.current.clear();

    const zoom = map.getZoom();
    const groups = new Map<string, Point[]>();
    points.forEach((p) => {
      let key = p.job.id;
      if (zoom < NO_CLUSTER_ZOOM) {
        const px = map.project([p.at.lat, p.at.lng], zoom);
        key = `${Math.floor(px.x / CLUSTER_CELL)}:${Math.floor(px.y / CLUSTER_CELL)}`;
      }
      groups.set(key, [...(groups.get(key) ?? []), p]);
    });

    groups.forEach((items) => {
      if (items.length === 1) {
        const { job, at } = items[0];
        const active = job.id === focusJobId;
        const marker = L.marker([at.lat, at.lng], {
          title: job.title,
          alt: job.title,
          keyboard: true,
          zIndexOffset: active ? 1000 : 0,
          icon: L.divIcon({
            className: '',
            html: `<span class="rc-pin rc-pin--${workMode(job).toLowerCase()}${active ? ' rc-pin--active' : ''}"><span></span></span>`,
            iconSize: [30, 34],
            iconAnchor: [14, 32],
            popupAnchor: [0, -28]
          })
        });
        marker.bindPopup(() => buildPopup(job, at), { maxWidth: 270 });
        marker.on('click', () => selectRef.current?.(job.id));
        marker.addTo(layer);
        markerById.current.set(job.id, marker);
        return;
      }
      const lat = items.reduce((s, p) => s + p.at.lat, 0) / items.length;
      const lng = items.reduce((s, p) => s + p.at.lng, 0) / items.length;
      L.marker([lat, lng], {
        title: t('geo.jobsHere', { count: items.length }),
        keyboard: true,
        icon: L.divIcon({
          className: '',
          html: `<span class="rc-cluster">${items.length}</span>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).
      on('click', () =>
      map.fitBounds(L.latLngBounds(items.map((p) => [p.at.lat, p.at.lng] as L.LatLngTuple)), {
        padding: [60, 60],
        maxZoom: Math.min(zoom + 3, 18)
      })
      ).
      addTo(layer);
    });
  }, [map, points, focusJobId, buildPopup, t]);

  useEffect(() => {
    if (!map) return undefined;
    renderMarkers();
    map.on('zoomend', renderMarkers);
    return () => {
      map.off('zoomend', renderMarkers);
    };
  }, [map, renderMarkers]);

  // Origin, search radius and route lines.
  useEffect(() => {
    if (!map) return;
    if (!overlayRef.current) overlayRef.current = L.layerGroup().addTo(map);
    const layer = overlayRef.current;
    layer.clearLayers();
    if (origin && radiusKm) {
      L.circle([origin.lat, origin.lng], {
        radius: radiusKm * 1000,
        color: '#178047',
        weight: 1.5,
        fillColor: '#178047',
        fillOpacity: 0.06,
        interactive: false
      }).addTo(layer);
    }
    routes?.forEach((route, i) => {
      if (i === activeRoute) return;
      L.polyline(route.coords, { color: '#8a94a6', weight: 4, opacity: 0.7, dashArray: '6 8' }).addTo(layer);
    });
    const active = routes?.[activeRoute];
    if (active) L.polyline(active.coords, { color: '#1668e3', weight: 5, opacity: 0.9 }).addTo(layer);
    if (origin) {
      L.marker([origin.lat, origin.lng], {
        title: t('geo.yourLocation'),
        keyboard: false,
        zIndexOffset: 2000,
        icon: L.divIcon({ className: '', html: '<span class="rc-origin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] })
      }).
      bindTooltip(t('geo.yourLocation')).
      addTo(layer);
    }
  }, [map, origin, radiusKm, routes, activeRoute, t]);

  // Re-frame when the set of jobs, the origin, radius or route changes.
  useEffect(() => {
    fitAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pointsKey, origin?.lat, origin?.lng, radiusKm, routes, activeRoute]);

  // Bring a selected job into view and open its popup.
  useEffect(() => {
    if (!map || !focusJobId) return;
    const point = points.find((p) => p.job.id === focusJobId);
    if (!point) return;
    map.setView([point.at.lat, point.at.lng], Math.max(map.getZoom(), NO_CLUSTER_ZOOM), { animate: false });
    renderMarkers();
    markerById.current.get(focusJobId)?.openPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusJobId]);

  return (
    <div
      ref={frameRef}
      className={`relative isolate overflow-hidden rounded-2xl border border-surface-border bg-surface-muted ${className}`}>
      
      <div ref={containerRef} className="h-full w-full" role="region" aria-label={t('geo.mapOf')} />
      {tileError &&
      <p
        role="alert"
        className="absolute inset-x-3 bottom-3 z-[1000] flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-ink-700 shadow-pop">
        
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" /> {t('geo.mapUnavailable')}
        </p>
      }
    </div>);

}