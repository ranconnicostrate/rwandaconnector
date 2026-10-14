import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';
import { AdCreative, type AdLayout } from '../../ads/AdCreative';
import type { Advertisement } from '../../../types';

type PreviewAd = Parameters<typeof AdCreative>[0]['ad'];

/** Shows an ad exactly as each public placement will render it. */
export function AdPreview({ ad }: {ad: PreviewAd | Advertisement;}) {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<AdLayout>('banner');

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label={t('ads.placement')} className="inline-flex rounded-lg bg-surface-muted p-1">
        {(['banner', 'card'] as AdLayout[]).map((l) =>
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={layout === l}
          onClick={() => setLayout(l)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
          layout === l ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-900'}`
          }>
          
            {l === 'banner' ? t('ads.placementBanner') : t('ads.placementSidebar')}
          </button>
        )}
      </div>
      <div className="rounded-2xl bg-surface-muted p-4">
        <div
          className={`overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card ${
          layout === 'card' ? 'mx-auto max-w-[320px]' : ''}`
          }>
          
          <AdCreative ad={ad} layout={layout} />
        </div>
      </div>
    </div>);

}