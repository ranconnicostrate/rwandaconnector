import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLeafletMap } from '../../hooks/useLeafletMap';
import type { LatLng } from '../../utils/geo';

interface LocationPickerMapProps {
  value: LatLng | null;
  onPick: (point: LatLng) => void;
  className?: string;
}

/** Click to drop the workplace pin; drag it to fine-tune. */
export function LocationPickerMap({ value, onPick, className = 'h-[280px]' }: LocationPickerMapProps) {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const valueRef = useRef(value);
  valueRef.current = value;

  const { map, tileError } = useLeafletMap(containerRef, frameRef, {
    labels: { recenter: t('geo.recenter'), fullscreen: t('geo.fullscreen') },
    onRecenter: () => {
      const v = valueRef.current;
      if (v && map) map.setView([v.lat, v.lng], 17);
    }
  });

  useEffect(() => {
    if (!map) return undefined;
    const onClick = (e: L.LeafletMouseEvent) => pickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = L.marker([value.lat, value.lng], {
        draggable: true,
        keyboard: true,
        title: t('geo.workplace'),
        icon: L.divIcon({
          className: '',
          html: '<span class="rc-pin rc-pin--active"><span></span></span>',
          iconSize: [30, 34],
          iconAnchor: [14, 32]
        })
      }).
      on('dragend', (e) => {
        const p = (e.target as L.Marker).getLatLng();
        pickRef.current({ lat: p.lat, lng: p.lng });
      }).
      addTo(map);
    } else {
      markerRef.current.setLatLng([value.lat, value.lng]);
    }
    if (!map.getBounds().contains([value.lat, value.lng]) || map.getZoom() < 14) {
      map.setView([value.lat, value.lng], 17);
    }
  }, [map, value, t]);

  return (
    <div
      ref={frameRef}
      className={`relative isolate overflow-hidden rounded-xl border border-surface-border bg-surface-muted ${className}`}>
      
      <div ref={containerRef} className="h-full w-full cursor-crosshair" role="application" aria-label={t('geo.pickOnMap')} />
      {tileError &&
      <p role="alert" className="absolute inset-x-2 bottom-2 z-[1000] flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-xs text-ink-700 shadow-pop">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" /> {t('geo.mapUnavailable')}
        </p>
      }
    </div>);

}