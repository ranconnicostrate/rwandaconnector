import { useEffect, useRef, useState, type RefObject } from 'react';
import * as L from 'leaflet';
import { KIGALI_CENTER } from '../utils/geo';

const ICON_TARGET =
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
const ICON_EXPAND =
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';

interface Options {
  labels: {recenter: string;fullscreen: string;};
  onRecenter: () => void;
}

/**
 * Creates one Leaflet map with OpenStreetMap tiles plus zoom, recenter and
 * fullscreen controls. Tile failures are reported so the UI can explain them.
 */
export function useLeafletMap(
containerRef: RefObject<HTMLDivElement>,
frameRef: RefObject<HTMLDivElement>,
{ labels, onRecenter }: Options)
{
  const [map, setMap] = useState<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);
  const recenterRef = useRef(onRecenter);
  recenterRef.current = onRecenter;

  useEffect(() => {
    const el = containerRef.current;
    const frame = frameRef.current;
    if (!el || !frame) return undefined;

    const m = L.map(el, { center: [KIGALI_CENTER.lat, KIGALI_CENTER.lng], zoom: 12, zoomControl: true });
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let failures = 0;
    let failed = false;
    tiles.on('tileerror', () => {
      failures += 1;
      if (failures >= 4 && !failed) {
        failed = true;
        setTileError(true);
      }
    });
    tiles.on('tileload', () => {
      failures = 0;
      if (failed) {
        failed = false;
        setTileError(false);
      }
    });
    tiles.addTo(m);

    const toggleFullscreen = () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else if (frame.requestFullscreen) {
        frame.requestFullscreen().catch(() => frame.classList.toggle('rc-map-fallback-fullscreen'));
      } else {
        // iOS Safari has no element fullscreen; fill the viewport instead.
        frame.classList.toggle('rc-map-fallback-fullscreen');
      }
      window.setTimeout(() => m.invalidateSize(), 160);
    };

    const Tools = L.Control.extend({
      onAdd() {
        const box = L.DomUtil.create('div', 'leaflet-bar rc-map-tools');
        const add = (label: string, svg: string, handler: () => void) => {
          const btn = L.DomUtil.create('button', '', box) as HTMLButtonElement;
          btn.type = 'button';
          btn.title = label;
          btn.setAttribute('aria-label', label);
          btn.innerHTML = svg;
          L.DomEvent.on(btn, 'click', (e) => {
            L.DomEvent.stop(e);
            handler();
          });
        };
        add(labels.recenter, ICON_TARGET, () => recenterRef.current());
        add(labels.fullscreen, ICON_EXPAND, toggleFullscreen);
        L.DomEvent.disableClickPropagation(box);
        return box;
      }
    });
    new Tools({ position: 'topleft' }).addTo(m);

    const onFs = () => window.setTimeout(() => m.invalidateSize(), 120);
    document.addEventListener('fullscreenchange', onFs);
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(el);

    setMap(m);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      resize.disconnect();
      m.remove();
      setMap(null);
    };
    // Labels are read once when the map is created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, frameRef]);

  return { map, tileError };
}