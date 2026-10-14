import React, { useRef, useState } from 'react';
import { FilmIcon, ImageIcon, Loader2Icon, SparklesIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { usePlatform } from '../../../contexts/PlatformContext';
import { useMediaUrl } from '../../../hooks/useMediaUrl';
import { AppError, type AdMediaKind } from '../../../services/db';
import { UploadError } from '../../../utils/upload';

const CONFIG: Record<AdMediaKind, {accept: string;labelKey: string;hintKey: string;icon: typeof ImageIcon;}> = {
  image: { accept: 'image/jpeg,image/png,image/webp', labelKey: 'ads.image', hintKey: 'ads.imageHint', icon: ImageIcon },
  animation: { accept: 'image/gif,image/webp', labelKey: 'ads.animation', hintKey: 'ads.animationHint', icon: SparklesIcon },
  video: { accept: 'video/mp4,video/webm,video/quicktime', labelKey: 'ads.video', hintKey: 'ads.videoHint', icon: FilmIcon }
};

interface AdMediaFieldProps {
  kind: AdMediaKind;
  value?: string;
  onChange: (ref: string | undefined) => void;
  /** Reports each new upload so an abandoned edit can clean it up. */
  onUploaded: (ref: string) => void;
  labelOverride?: string;
}

export function AdMediaField({ kind, value, onChange, onUploaded, labelOverride }: AdMediaFieldProps) {
  const { t } = useTranslation();
  const { uploadAdvertisementMedia } = usePlatform();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const media = useMediaUrl(value);
  const cfg = CONFIG[kind];
  const Icon = cfg.icon;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const ref = await uploadAdvertisementMedia(file, kind);
      onUploaded(ref);
      onChange(ref);
    } catch (e) {
      if (e instanceof UploadError) {
        setError(
          e.reason === 'size' ?
          t('ads.errorSize', { mb: e.limitMb ?? 0 }) :
          e.reason === 'type' ?
          t('ads.errorType') :
          e.reason === 'content' ?
          t('ads.errorContent') :
          t('common.uploadFailed')
        );
      } else if (e instanceof AppError) {
        setError(e.message);
      } else {
        setError(t('common.uploadFailed'));
      }
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-700">{labelOverride ?? t(cfg.labelKey)}</p>
      {value ?
      <div className="overflow-hidden rounded-xl border border-surface-border">
          <div className="aspect-video bg-surface-muted">
            {media.url && (
          kind === 'video' ?
          <video src={media.url} controls muted playsInline preload="metadata" className="h-full w-full bg-navy-900 object-contain" /> :

          <img src={media.url} alt="" className="h-full w-full object-cover" />)
          }
            {media.state === 'loading' &&
          <div className="flex h-full items-center justify-center text-ink-400">
                <Loader2Icon className="h-5 w-5 animate-spin" />
              </div>
          }
            {media.state === 'missing' &&
          <div className="flex h-full items-center justify-center text-xs text-ink-400">{t('ads.mediaMissing')}</div>
          }
          </div>
          <div className="flex items-center justify-end gap-1 border-t border-surface-border bg-white p-1.5">
            <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:bg-surface-muted">
            
              {busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <UploadCloudIcon className="h-3.5 w-3.5" />}
              {t('ads.replace')}
            </button>
            <button
            type="button"
            disabled={busy}
            onClick={() => onChange(undefined)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50">
            
              <Trash2Icon className="h-3.5 w-3.5" /> {t('ads.remove')}
            </button>
          </div>
        </div> :

      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border px-4 py-6 text-center transition-colors duration-150 hover:border-brand-400 hover:bg-brand-50">
        
          {busy ? <Loader2Icon className="h-6 w-6 animate-spin text-brand-600" /> : <Icon className="h-6 w-6 text-ink-400" />}
          <span className="text-sm font-semibold text-ink-700">{busy ? t('ads.uploading') : t('ads.upload')}</span>
          <span className="text-[11px] text-ink-400">{t(cfg.hintKey)}</span>
        </button>
      }
      <input
        ref={input}
        type="file"
        accept={cfg.accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={labelOverride ?? t(cfg.labelKey)}
        onChange={(e) => pick(e.target.files?.[0])} />
      
      {error &&
      <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      }
    </div>);

}