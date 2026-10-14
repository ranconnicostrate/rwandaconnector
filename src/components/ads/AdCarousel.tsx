import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { AdCreative, type AdLayout } from './AdCreative';

const ROTATE_MS = 8000;

interface AdCarouselProps {
  layout: AdLayout;
  /** Offsets the first ad so two slots on one page do not show the same one. */
  startIndex?: number;
  className?: string;
}

/**
 * Rotates through every live advertisement. Renders nothing when there are
 * none, so pages never show an empty ad box.
 */
export function AdCarousel({ layout, startIndex = 0, className = '' }: AdCarouselProps) {
  const { t } = useTranslation();
  const { liveAdvertisements: ads } = usePlatform();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);

  const count = ads.length;
  const current = count ? ads[(index % count + count) % count] : undefined;
  // Never rotate away from a video — the viewer may be about to press play.
  const rotates = count > 1 && !paused && !reduceMotion && current?.type !== 'VIDEO' && !current?.videoUrl;

  useEffect(() => {
    if (!rotates) return;
    const id = window.setTimeout(() => setIndex((i) => i + 1), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [rotates, index]);

  if (!current) return null;

  const go = (delta: number) => setIndex((i) => i + delta);
  const position = (index % count + count) % count;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('ads.sponsored')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card ${className}`}>
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          aria-roledescription="slide"
          aria-label={`${position + 1} / ${count}`}>
          
          <AdCreative ad={current} layout={layout} />
        </motion.div>
      </AnimatePresence>

      {count > 1 &&
      <div
        className={`flex items-center gap-2 ${
        layout === 'banner' ?
        'absolute bottom-3 right-3 rounded-full bg-white/95 px-2 py-1 shadow-card' :
        'justify-between border-t border-surface-border px-3 py-2'}`
        }>
        
          <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t('ads.previous')}
          className="rounded-full p-1 text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {ads.map((ad, i) =>
          <button
            key={ad.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1} / ${count}`}
            aria-current={i === position}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
            i === position ? 'w-4 bg-brand-600' : 'w-1.5 bg-ink-300 hover:bg-ink-400'}`
            } />

          )}
          </div>
          <button
          type="button"
          onClick={() => go(1)}
          aria-label={t('ads.next')}
          className="rounded-full p-1 text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      }
    </section>);

}