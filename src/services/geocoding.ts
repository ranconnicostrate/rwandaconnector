import { RWANDA_BOUNDS, canonicalDistrict, provinceOfDistrict, type LatLng } from '../utils/geo';

/**
 * Forward and reverse geocoding through OpenStreetMap Nominatim.
 * Usage policy: at most 1 request per second, results cached, no bulk use.
 * https://operations.osmfoundation.org/policies/nominatim/
 */

export interface Place extends LatLng {
  /** Short display label, e.g. "Kigali Heights, Kimihurura, Gasabo". */
  label: string;
  street?: string;
  sector?: string;
  district?: string;
  province?: string;
  city?: string;
  country?: string;
}

export class GeoServiceError extends Error {
  constructor(
  message: string,
  public reason: 'network' | 'rate_limited' | 'bad_response')
  {
    super(message);
    this.name = 'GeoServiceError';
  }
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string | undefined>;
}

const BASE = 'https://nominatim.openstreetmap.org';
let nextSlot = 0;

/** Spaces requests at least 1.1 s apart, per the provider's policy. */
async function waitForSlot() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + 1100;
  if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait));
}

const cache = new Map<string, Promise<unknown>>();

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const hit = cache.get(url);
  if (hit) return hit as Promise<T>;
  const request = (async () => {
    await waitForSlot();
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    let res: Response;
    try {
      res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new GeoServiceError('Location search is unavailable.', 'network');
    }
    if (res.status === 429) throw new GeoServiceError('Too many location searches.', 'rate_limited');
    if (!res.ok) throw new GeoServiceError('Location search failed.', 'bad_response');
    return (await res.json()) as T;
  })();
  cache.set(url, request);
  request.catch(() => cache.delete(url));
  return request;
}

function toPlace(raw: NominatimResult): Place | null {
  const lat = Number(raw.lat);
  const lng = Number(raw.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const a = raw.address ?? {};
  const district = canonicalDistrict(a.county ?? a.state_district ?? a.city_district ?? a.district) ?? undefined;
  const province = provinceOfDistrict(district) ?? a.state ?? a.province;
  const sector = a.suburb ?? a.village ?? a.town ?? a.neighbourhood ?? a.quarter;
  const street =
  [a.house_number, a.road].filter(Boolean).join(' ') || a.amenity || a.building || a.office || undefined;
  const named = raw.name && raw.name !== a.road ? raw.name : undefined;
  const label =
  [named, street, sector, district].
  filter((p): p is string => !!p).
  filter((p, i, all) => all.indexOf(p) === i).
  slice(0, 3).
  join(', ') || raw.display_name.split(',').slice(0, 3).join(',');
  return {
    lat,
    lng,
    label,
    street: named && street ? `${named}, ${street}` : named ?? street,
    sector,
    district,
    province,
    city: a.city ?? a.town ?? a.village,
    country: a.country
  };
}

/** Places and addresses inside Rwanda matching free text. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
    countrycodes: 'rw',
    viewbox: `${RWANDA_BOUNDS.west},${RWANDA_BOUNDS.north},${RWANDA_BOUNDS.east},${RWANDA_BOUNDS.south}`,
    bounded: '1',
    // Structured fields stay in English so they match the district filters.
    'accept-language': 'en'
  });
  const raw = await getJson<NominatimResult[]>(`${BASE}/search?${params.toString()}`, signal);
  if (!Array.isArray(raw)) throw new GeoServiceError('Unexpected response.', 'bad_response');
  return raw.map(toPlace).filter((p): p is Place => !!p);
}

/** Approximate address for coordinates; null when nothing is mapped there. */
export async function reverseGeocode(point: LatLng, signal?: AbortSignal): Promise<Place | null> {
  const params = new URLSearchParams({
    lat: point.lat.toFixed(5),
    lon: point.lng.toFixed(5),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '18',
    'accept-language': 'en'
  });
  const raw = await getJson<NominatimResult & {error?: string;}>(`${BASE}/reverse?${params.toString()}`, signal);
  if (!raw || raw.error) return null;
  const place = toPlace(raw);
  // Keep the exact point that was asked about, not the matched feature's centre.
  return place ? { ...place, lat: point.lat, lng: point.lng } : null;
}