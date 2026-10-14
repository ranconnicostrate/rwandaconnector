import React, { useState } from 'react';
import { CheckCircle2Icon, ExternalLinkIcon, FileTextIcon, Loader2Icon, Trash2Icon, UploadCloudIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { AppError } from '../../services/db';
import { formatBytes } from '../../utils/image';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { CvUpload } from '../../hooks/useCvUpload';

/** The person's CV on file: upload, replace, open and remove. */
export function CvCard({ cv }: {cv: CvUpload;}) {
  const { t, formatRelative } = useTranslation();
  const { currentUser, removeCv, openCv } = usePlatform();
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const hasCv = !!currentUser.cvName;
  const canOpen = !!currentUser.cvRef;

  const view = async () => {
    if (!currentUser.cvRef) return;
    setOpenError(null);
    // Open the tab synchronously so pop-up blockers allow it.
    const tab = window.open('', '_blank');
    try {
      const url = await openCv(currentUser.id, currentUser.cvRef);
      if (tab) tab.location.href = url;else
      window.location.href = url;
    } catch (e) {
      tab?.close();
      setOpenError(e instanceof AppError ? e.message : t('common.uploadFailed'));
    }
  };

  return (
    <section
      id="cv"
      aria-labelledby="cv-heading"
      className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
      
      <h2 id="cv-heading" className="mb-3 text-sm font-bold text-ink-900">
        {t('profile.cv')}
      </h2>

      {hasCv ?
      <div className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600">
            <FileTextIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900" title={currentUser.cvName}>
              {currentUser.cvName}
            </p>
            <p className="text-xs text-ink-500">
              {[
            currentUser.cvSize ? formatBytes(currentUser.cvSize) : null,
            currentUser.cvUploadedAt ? t('profile.cvUploaded', { when: formatRelative(currentUser.cvUploadedAt) }) : null].

            filter(Boolean).
            join(' · ') || t('profile.cvLegacy')}
            </p>
          </div>
        </div> :

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          cv.upload(e.dataTransfer.files?.[0]);
        }}>
        
          <button
          type="button"
          onClick={cv.open}
          disabled={cv.busy}
          className={`flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors duration-150 ${
          dragging ? 'border-brand-400 bg-brand-50' : 'border-surface-border hover:border-brand-400 hover:bg-brand-50'}`
          }>
          
            {cv.busy ?
          <Loader2Icon className="h-6 w-6 animate-spin text-brand-600" /> :

          <UploadCloudIcon className="h-6 w-6 text-ink-400" />
          }
            <span className="text-sm font-semibold text-ink-900">
              {cv.busy ? t('profile.cvUploading') : t('profile.uploadCv')}
            </span>
            <span className="text-[11px] text-ink-400">{t('profile.cvHint')}</span>
          </button>
        </div>
      }

      {hasCv &&
      <div className="mt-3 flex flex-wrap gap-1.5">
          <button
          type="button"
          onClick={cv.open}
          disabled={cv.busy}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
          
            {cv.busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <UploadCloudIcon className="h-3.5 w-3.5" />}
            {t('profile.cvReplace')}
          </button>
          {canOpen &&
        <button
          type="button"
          onClick={view}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
          
              <ExternalLinkIcon className="h-3.5 w-3.5" /> {t('profile.cvView')}
            </button>
        }
          <button
          type="button"
          onClick={() => setConfirming(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50">
          
            <Trash2Icon className="h-3.5 w-3.5" /> {t('common.remove')}
          </button>
        </div>
      }

      {cv.justUploaded &&
      <p role="status" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-leaf-600">
          <CheckCircle2Icon className="h-4 w-4" /> {t('profile.cvSaved')}
        </p>
      }
      {(cv.error || openError) &&
      <p role="alert" className="mt-3 text-xs font-medium text-red-600">
          {cv.error ?? openError}
        </p>
      }
      <p className="mt-3 text-[11px] leading-relaxed text-ink-400">{t('profile.cvPrivacy')}</p>

      <ConfirmDialog
        open={confirming}
        title={t('profile.cvRemoveTitle')}
        message={t('profile.cvRemoveBody')}
        detail={currentUser.cvName}
        confirmLabel={t('common.remove')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          removeCv();
          setConfirming(false);
        }} />
      
    </section>);

}