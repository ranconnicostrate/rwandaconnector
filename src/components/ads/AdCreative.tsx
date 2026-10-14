import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { AdMedia } from './AdMedia';
import { isInternalTarget, isSafeTargetUrl } from '../../utils/ads';
import type { Advertisement } from '../../types';

export type AdLayout = 'banner' | 'card';

type AdContent = Pick<
  Advertisement,
  'title' | 'description' | 'type' | 'imageUrl' | 'videoUrl' | 'animationUrl' | 'posterUrl' | 'targetUrl' | 'buttonText'>;


interface AdCreativeProps {
  ad: AdContent;
  layout: AdLayout;
}

/**
 * One advertisement. `banner` sets media beside the copy for wide slots;
 * `card` stacks them for narrow sidebars.
 */
export function AdCreative({ ad, layout }: AdCreativeProps) {
  const { t } = useTranslation();
  const href = ad.targetUrl && isSafeTargetUrl(ad.targetUrl) ? ad.targetUrl : undefined;
  const hasMedia = !!(ad.imageUrl || ad.videoUrl || ad.animationUrl);
  const banner = layout === 'banner';

  const cta = href &&
  <CtaLink href={href} className={banner ? 'mt-5' : 'mt-3'}>
      {ad.buttonText || t('ads.learnMore')}
    </CtaLink>;


  if (!hasMedia) {
    // Text-only ads use the brand surface so they read as a deliberate unit.
    return (
      <div className={`bg-navy-800 text-white ${banner ? 'px-6 py-7 sm:px-8' : 'p-5'}`}>
        <Sponsored inverted />
        <h3 className={`mt-2 font-extrabold leading-tight ${banner ? 'text-xl sm:text-2xl' : 'text-base'}`}>
          {ad.title}
        </h3>
        {ad.description &&
        <p className={`mt-2 max-w-2xl leading-relaxed text-navy-100 ${banner ? 'text-sm' : 'text-xs'}`}>
            {ad.description}
          </p>
        }
        {href &&
        <CtaLink href={href} className={banner ? 'mt-5' : 'mt-3'} inverted>
            {ad.buttonText || t('ads.learnMore')}
          </CtaLink>
        }
      </div>);

  }

  if (!banner) {
    return (
      <div>
        <AdMedia ad={ad} href={href} className="aspect-video w-full" />
        <div className="p-4">
          <Sponsored />
          <h3 className="mt-1 text-sm font-bold leading-snug text-ink-900">{ad.title}</h3>
          {ad.description &&
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-500">{ad.description}</p>
          }
          {cta}
        </div>
      </div>);

  }

  return (
    <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <AdMedia ad={ad} href={href} className="aspect-video w-full md:aspect-auto md:min-h-[240px]" />
      <div className="flex flex-col justify-center p-6 sm:p-7">
        <Sponsored />
        <h3 className="mt-2 text-xl font-extrabold leading-tight text-ink-900 sm:text-2xl">{ad.title}</h3>
        {ad.description &&
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-500">{ad.description}</p>
        }
        {cta && <div>{cta}</div>}
      </div>
    </div>);

}

function Sponsored({ inverted = false }: {inverted?: boolean;}) {
  const { t } = useTranslation();
  // Ads must be labelled as paid placements so they are never mistaken for jobs.
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-wide ${inverted ? 'text-gold-400' : 'text-ink-400'}`}>
      {t('ads.sponsored')}
    </p>);

}

function CtaLink({
  href,
  children,
  className,
  inverted = false





}: {href: string;children: React.ReactNode;className: string;inverted?: boolean;}) {
  const cls = `inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
  inverted ? 'bg-white text-navy-800 hover:bg-navy-50' : 'bg-brand-600 text-white hover:bg-brand-700'} ${
  className}`;

  if (isInternalTarget(href)) {
    return (
      <Link to={href} className={cls}>
        {children}
      </Link>);

  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" className={cls}>
      {children} <ArrowUpRightIcon className="h-4 w-4" />
    </a>);

}