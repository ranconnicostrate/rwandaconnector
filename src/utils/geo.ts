import { PROVINCES } from '../data/rwandaLocations';
import type { Job, WorkLocationType } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

export type TravelMode = 'driving' | 'walking' | 'cycling';

/** Generous bounding box around Rwanda's borders. */
export const RWANDA_BOUNDS = { south: -2.84, north: -1.04, west: 28.86, east: 30.9 };
export const KIGALI_CENTER: LatLng = { lat: -1.9441, lng: 30.0619 };
export const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50, 100] as const;

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180);

}

export function isInRwanda(p: LatLng): boolean {
  return (
    p.lat >= RWANDA_BOUNDS.south &&
    p.lat <= RWANDA_BOUNDS.north &&
    p.lng >= RWANDA_BOUNDS.west &&
    p.lng <= RWANDA_BOUNDS.east);

}

export function workMode(job: Pick<Job, 'workLocationType'>): WorkLocationType {
  return job.workLocationType ?? 'ON_SITE';
}

/** The workplace coordinates, or null for remote jobs and jobs without a pin. */
export function jobCoords(job: Job): LatLng | null {
  if (workMode(job) === 'REMOTE') return null;
  if (!isValidLatLng(job.latitude, job.longitude)) return null;
  return { lat: job.latitude as number, lng: job.longitude as number };
}

const EARTH_RADIUS_KM = 6371.0088;

/** Great-circle (straight-line) distance via the Haversine formula. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number, locale: string): string {
  if (km < 1) {
    const m = Math.max(10, Math.round(km * 1000 / 10) * 10);
    return `${new Intl.NumberFormat(locale).format(m)} m`;
  }
  const digits = km < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(km)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * Google Maps directions link using the workplace's stored coordinates.
 * Without an origin, Google Maps uses the device's own location.
 */
export function directionsUrl(dest: LatLng, origin?: LatLng | null, mode: TravelMode = 'driving'): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${dest.lat},${dest.lng}`,
    travelmode: mode === 'cycling' ? 'bicycling' : mode
  });
  if (origin) params.set('origin', `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function provinceOfDistrict(district: string | undefined): string | undefined {
  if (!district) return undefined;
  const d = district.trim().toLowerCase();
  return PROVINCES.find((p) => p.districts.some((x) => x.toLowerCase() === d))?.name;
}

/** Matches free text such as "Gasabo District" to a canonical district name. */
export function canonicalDistrict(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const d = raw.replace(/\s+district$/i, '').trim().toLowerCase();
  for (const p of PROVINCES) {
    const hit = p.districts.find((x) => x.toLowerCase() === d);
    if (hit) return hit;
  }
  return undefined;
}

export function jobProvince(job: Job): string | undefined {
  return job.province || provinceOfDistrict(job.district);
}

/** Human-readable workplace address from the most specific fields available. */
export function jobAddress(job: Job): string {
  if (workMode(job) === 'REMOTE') return '';
  const parts = [job.streetAddress, job.sector, job.district, jobProvince(job)].filter(
    (p): p is string => !!p && p.trim().length > 0
  );
  const unique = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  return unique.length ? unique.join(', ') : [job.location, job.district].filter(Boolean).join(' · ');
}