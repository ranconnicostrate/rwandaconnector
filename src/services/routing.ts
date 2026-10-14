import type { LatLng, TravelMode } from '../utils/geo';

/**
 * Road routing through the FOSSGIS OSRM servers, which provide separate car,
 * bicycle and foot profiles from OpenStreetMap data. Fair-use: requests are
 * spaced out and cached; results are estimates without live traffic.
 * https://routing.openstreetmap.de/about.html
 */

export interface RouteOption {
  distanceM: number;
  durationS: number;
  /** [lat, lng] pairs for drawing the route line. */
  coords: [number, number][];
  summary: string;
}

export class RoutingError extends Error {
  constructor(
  message: string,
  public reason: 'network' | 'no_route' | 'rate_limited' | 'bad_response')
  {
    super(message);
    this.name = 'RoutingError';
  }
}

const PROFILE: Record<TravelMode, string> = {
  driving: 'routed-car',
  walking: 'routed-foot',
  cycling: 'routed-bike'
};

interface OsrmResponse {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: {coordinates: [number, number][];};
    legs?: {summary?: string;}[];
  }[];
}

let nextSlot = 0;
const cache = new Map<string, Promise<RouteOption[]>>();

export function fetchRoutes(from: LatLng, to: LatLng, mode: TravelMode): Promise<RouteOption[]> {
  const pair = (p: LatLng) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`;
  const url =
  `https://routing.openstreetmap.de/${PROFILE[mode]}/route/v1/driving/${pair(from)};${pair(to)}` +
  '?overview=full&geometries=geojson&alternatives=true&steps=false';
  const hit = cache.get(url);
  if (hit) return hit;

  const request = (async () => {
    const now = Date.now();
    const wait = Math.max(0, nextSlot - now);
    nextSlot = Math.max(now, nextSlot) + 1000;
    if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait));

    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch {
      throw new RoutingError('Routing service unreachable.', 'network');
    }
    if (res.status === 429) throw new RoutingError('Routing rate limit reached.', 'rate_limited');
    let body: OsrmResponse;
    try {
      body = (await res.json()) as OsrmResponse;
    } catch {
      throw new RoutingError('Unexpected routing response.', 'bad_response');
    }
    if (body.code === 'NoRoute' || body.code === 'NoSegment') throw new RoutingError('No route.', 'no_route');
    if (!res.ok || body.code !== 'Ok' || !body.routes?.length) {
      throw new RoutingError('Routing failed.', 'bad_response');
    }
    return body.routes.map((r) => ({
      distanceM: r.distance,
      durationS: r.duration,
      coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      summary: r.legs?.[0]?.summary ?? ''
    }));
  })();

  cache.set(url, request);
  request.catch(() => cache.delete(url));
  return request;
}