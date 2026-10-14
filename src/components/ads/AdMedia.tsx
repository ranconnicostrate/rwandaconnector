import React from 'react';
import { ImageOffIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import type { Advertisement } from '../../types';

interface AdMediaProps {
  ad: Pick<Advertisement, 'type' | 'title' | 'imageUrl' | 'videoUrl' | 'animationUrl' | 'posterUrl'>;
  /** Wraps still media in a link; videos keep their own controls instead. */
  href?: string;
  className?: string;
}

/**
 * Chooses the primary visual for an ad: video first (it carries the most
 * information), then animation, then image. Returns null for text-only ads.
 */
export function AdMedia({ ad, href, className = '' }: AdMediaProps) {
  const video = useMediaUrl(ad.videoUrl);
  const animation = useMediaUrl(ad.animationUrl);
  const image = useMediaUrl(ad.imageUrl);
  const poster = useMediaUrl(ad.posterUrl ?? ad.imageUrl);

  if (ad.videoUrl) {
    return (
      <Frame className={className} state={video.state}>
        {video.url &&
        // Muted, never autoplayed, metadata-only preload keeps pages fast.
        <video
          key={video.url}
          src={video.url}
          poster={poster.url ?? undefined}
          controls
          muted
          playsInline
          preload="metadata"
          controlsList="nodownload"
          aria-label={ad.title}
          className="h-full w-full bg-navy-900 object-contain" />

        }
      </Frame>);

  }

  const still = ad.animationUrl ? animation : ad.imageUrl ? image : null;
  if (!still) return null;

  const img = still.url &&
  <img
    src={still.url}
    alt={ad.title}
    loading="lazy"
    decoding="async"
    className="h-full w-full object-cover" />;



  return (
    <Frame className={className} state={still.state}>
      {href && img ?
      <a href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer sponsored" className="block h-full w-full">
          {img}
        </a> :

      img
      }
    </Frame>);

}

function Frame({
  children,
  className,
  state




}: {children: React.ReactNode;className: string;state: 'idle' | 'loading' | 'ready' | 'missing';}) {
  const { t } = useTranslation();
  return (
    <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
      {children}
      {state === 'loading' &&
      <div className="absolute inset-0 flex items-center justify-center text-ink-400">
          <Loader2Icon className="h-6 w-6 animate-spin" aria-label={t('common.loading')} />
        </div>
      }
      {state === 'missing' &&
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-ink-400">
          <ImageOffIcon className="h-6 w-6" />
          {t('ads.mediaMissing')}
        </div>
      }
    </div>);

}