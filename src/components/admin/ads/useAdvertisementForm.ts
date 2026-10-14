import { useEffect, useRef, useState } from 'react';
import { usePlatform } from '../../../contexts/PlatformContext';
import { AD_MEDIA_SLOTS, AD_SLOT_FIELD, todayKey } from '../../../utils/ads';
import type { AdvertisementInput } from '../../../services/db';
import type { Advertisement } from '../../../types';

function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

function initialState(ad?: Advertisement | null): AdvertisementInput {
  if (ad) {
    const { id: _id, createdBy: _c, createdAt: _ca, updatedAt: _u, ...rest } = ad;
    return { ...rest, targetUrl: rest.targetUrl ?? '', buttonText: rest.buttonText ?? '' };
  }
  const today = todayKey();
  return {
    title: '',
    description: '',
    type: 'IMAGE',
    targetUrl: '',
    buttonText: '',
    startDate: today,
    endDate: addDays(today, 14),
    status: 'DRAFT'
  };
}

/** Form state, media bookkeeping, and save/cancel for the ad editor. */
export function useAdvertisementForm(ad: Advertisement | null | undefined, open: boolean, onDone: () => void) {
  const { createAdvertisement, updateAdvertisement, discardAdvertisementMedia } = usePlatform();
  const [form, setForm] = useState<AdvertisementInput>(() => initialState(ad));
  const [tab, setTab] = useState<'details' | 'preview'>('details');
  const [localError, setLocalError] = useState<string | null>(null);
  const uploads = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(initialState(ad));
    setTab('details');
    setLocalError(null);
    uploads.current = [];
  }, [open, ad]);

  const set = <K extends keyof AdvertisementInput,>(key: K, value: AdvertisementInput[K]) =>
  setForm((prev) => ({ ...prev, [key]: value }));

  const slots = AD_MEDIA_SLOTS[form.type];

  /** Drops media belonging to slots the chosen type does not use. */
  const payload = (): AdvertisementInput => {
    const next: AdvertisementInput = { ...form };
    (Object.keys(AD_SLOT_FIELD) as (keyof typeof AD_SLOT_FIELD)[]).forEach((slot) => {
      if (!slots.includes(slot)) delete next[AD_SLOT_FIELD[slot]];
    });
    return next;
  };

  const submit = () => {
    setLocalError(null);
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setLocalError('ads.errorDates');
      return;
    }
    const saved = ad ? updateAdvertisement(ad.id, payload()) : createAdvertisement(payload());
    if (!saved) return;
    // Uploads that did not make it into the saved ad are no longer needed.
    discardAdvertisementMedia(uploads.current);
    uploads.current = [];
    onDone();
  };

  const cancel = () => {
    discardAdvertisementMedia(uploads.current);
    uploads.current = [];
    onDone();
  };

  return {
    form,
    set,
    slots,
    tab,
    setTab,
    localError,
    submit,
    cancel,
    preview: payload(),
    trackUpload: (ref: string) => uploads.current.push(ref)
  };
}