import type { Advertisement, AdvertisementStatus, AdvertisementType } from '../types';

/** Today's local calendar date as `YYYY-MM-DD`. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a `YYYY-MM-DD` date at local midnight (avoids UTC day-shift). */
export function dateFromKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

/** Publicly visible right now: published and inside its date window. */
export function isAdLive(ad: Advertisement, today: string = todayKey()): boolean {
  return ad.status === 'PUBLISHED' && ad.startDate <= today && today <= ad.endDate;
}

/** Whether an ad's end date has already passed. */
export function isAdPastEnd(ad: Pick<Advertisement, 'endDate'>, today: string = todayKey()): boolean {
  return ad.endDate < today;
}

export type AdSchedule = 'LIVE' | 'SCHEDULED' | null;

/** Extra context for a published ad that is not yet running. */
export function adSchedule(ad: Advertisement, today: string = todayKey()): AdSchedule {
  if (ad.status !== 'PUBLISHED') return null;
  if (ad.startDate > today) return 'SCHEDULED';
  return isAdLive(ad, today) ? 'LIVE' : null;
}

export const AD_TYPES: AdvertisementType[] = ['TEXT', 'IMAGE', 'ANIMATION', 'VIDEO', 'MIXED'];
export const AD_STATUSES: AdvertisementStatus[] = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'EXPIRED'];

export const AD_TYPE_KEY: Record<AdvertisementType, string> = {
  TEXT: 'ads.typeText',
  IMAGE: 'ads.typeImage',
  ANIMATION: 'ads.typeAnimation',
  VIDEO: 'ads.typeVideo',
  MIXED: 'ads.typeMixed'
};

export const AD_STATUS_KEY: Record<AdvertisementStatus, string> = {
  DRAFT: 'ads.statusDraft',
  PUBLISHED: 'ads.statusPublished',
  UNPUBLISHED: 'ads.statusUnpublished',
  EXPIRED: 'ads.statusExpired'
};

export const AD_STATUS_TONE: Record<AdvertisementStatus, string> = {
  DRAFT: 'bg-surface-muted text-ink-700',
  PUBLISHED: 'bg-leaf-50 text-leaf-600',
  UNPUBLISHED: 'bg-amber-50 text-amber-700',
  EXPIRED: 'bg-red-50 text-red-600'
};

export type AdMediaSlot = 'image' | 'animation' | 'video' | 'poster';

/** Which media slots each type offers in the editor. */
export const AD_MEDIA_SLOTS: Record<AdvertisementType, AdMediaSlot[]> = {
  TEXT: [],
  IMAGE: ['image'],
  ANIMATION: ['animation'],
  VIDEO: ['video', 'poster'],
  MIXED: ['image', 'animation', 'video']
};

export const AD_SLOT_FIELD = {
  image: 'imageUrl',
  animation: 'animationUrl',
  video: 'videoUrl',
  poster: 'posterUrl'
} as const satisfies Record<AdMediaSlot, keyof Advertisement>;

/**
 * Only http(s) links and in-app paths are allowed as ad targets; this blocks
 * `javascript:` and `data:` URLs from ever reaching an anchor.
 */
export function isSafeTargetUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isInternalTarget(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}