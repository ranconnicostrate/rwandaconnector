import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { reverseGeocode, type Place } from '../services/geocoding';
import { isInRwanda, type LatLng } from '../utils/geo';

export interface UserOrigin extends LatLng {
  label: string;
  source: 'gps' | 'search';
  /** GPS accuracy radius in metres. */
  accuracyM?: number;
  district?: string;
  sector?: string;
  province?: string;
}

export type LocationError = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';
export type LocationWarning = 'low_accuracy' | 'outside_rwanda';

interface LocationValue {
  origin: UserOrigin | null;
  locating: boolean;
  error: LocationError | null;
  warning: LocationWarning | null;
  /** Asks the browser for the current position. Only call from a user action. */
  requestGps: () => void;
  setManual: (place: Place) => void;
  clear: () => void;
}

const LocationContext = createContext<LocationValue | null>(null);

/** Readings worse than this are flagged so the person can search instead. */
const LOW_ACCURACY_M = 1500;

/**
 * The person's chosen starting point. Held in memory only — never persisted,
 * never sent to the data layer, and never watched in the background.
 */
export function LocationProvider({ children }: {children: React.ReactNode;}) {
  const [origin, setOrigin] = useState<UserOrigin | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [warning, setWarning] = useState<LocationWarning | null>(null);
  const requestId = useRef(0);

  const requestGps = useCallback(() => {
    setError(null);
    setWarning(null);
    if (!('geolocation' in navigator)) {
      setError('unsupported');
      return;
    }
    if (!window.isSecureContext) {
      setError('insecure');
      return;
    }
    const id = ++requestId.current;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== requestId.current) return;
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const accuracyM = Math.round(pos.coords.accuracy);
        setOrigin({ ...point, accuracyM, source: 'gps', label: `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` });
        setWarning(!isInRwanda(point) ? 'outside_rwanda' : accuracyM > LOW_ACCURACY_M ? 'low_accuracy' : null);
        setLocating(false);
        // Friendly label; the coordinates already work if this fails.
        reverseGeocode(point).
        then((place) => {
          if (!place || id !== requestId.current) return;
          setOrigin((prev) =>
          prev && prev.source === 'gps' ?
          {
            ...prev,
            label: [place.sector, place.district].filter(Boolean).join(', ') || place.label,
            district: place.district,
            sector: place.sector,
            province: place.province
          } :
          prev
          );
        }).
        catch(() => undefined);
      },
      (err) => {
        if (id !== requestId.current) return;
        setLocating(false);
        setError(err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const setManual = useCallback((place: Place) => {
    requestId.current += 1;
    setLocating(false);
    setError(null);
    setWarning(isInRwanda(place) ? null : 'outside_rwanda');
    setOrigin({
      lat: place.lat,
      lng: place.lng,
      label: place.label,
      source: 'search',
      district: place.district,
      sector: place.sector,
      province: place.province
    });
  }, []);

  const clear = useCallback(() => {
    requestId.current += 1;
    setOrigin(null);
    setLocating(false);
    setError(null);
    setWarning(null);
  }, []);

  const value = useMemo(
    () => ({ origin, locating, error, warning, requestGps, setManual, clear }),
    [origin, locating, error, warning, requestGps, setManual, clear]
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useUserLocation must be used inside LocationProvider');
  return ctx;
}