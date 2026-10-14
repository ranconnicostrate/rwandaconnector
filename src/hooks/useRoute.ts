import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRoutes, RoutingError, type RouteOption } from '../services/routing';
import type { LatLng, TravelMode } from '../utils/geo';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Road routes between two points, fetched only when asked for. */
export function useRoute(from: LatLng | null, to: LatLng | null) {
  const [mode, setMode] = useState<TravelMode>('driving');
  const [status, setStatus] = useState<Status>('idle');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [errorReason, setErrorReason] = useState<RoutingError['reason'] | null>(null);
  const [active, setActive] = useState(0);
  const requestId = useRef(0);

  const calculate = useCallback(
    async (m: TravelMode) => {
      if (!from || !to) return;
      const id = ++requestId.current;
      setStatus('loading');
      setErrorReason(null);
      try {
        const result = await fetchRoutes(from, to, m);
        if (id !== requestId.current) return;
        setRoutes(result);
        setActive(0);
        setStatus('ready');
      } catch (e) {
        if (id !== requestId.current) return;
        setRoutes([]);
        setErrorReason(e instanceof RoutingError ? e.reason : 'network');
        setStatus('error');
      }
    },
    [from, to]
  );

  // A new start or destination invalidates any previous route.
  useEffect(() => {
    requestId.current += 1;
    setStatus('idle');
    setRoutes([]);
    setActive(0);
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  const changeMode = (m: TravelMode) => {
    setMode(m);
    if (status !== 'idle') void calculate(m);
  };

  return { mode, changeMode, calculate: () => calculate(mode), status, routes, errorReason, active, setActive };
}