import { useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { AppError } from '../services/db';
import { UploadError } from '../utils/upload';

/** Shared CV picker so the header button and the CV card use one upload flow. */
export function useCvUpload() {
  const { t } = useTranslation();
  const { uploadCv } = usePlatform();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setJustUploaded(false);
    setBusy(true);
    try {
      await uploadCv(file);
      setJustUploaded(true);
      window.setTimeout(() => setJustUploaded(false), 4000);
    } catch (e) {
      if (e instanceof UploadError) {
        setError(
          e.reason === 'size' ?
          t('profile.cvErrorSize', { mb: e.limitMb ?? 5 }) :
          e.reason === 'type' ?
          t('profile.cvErrorType') :
          e.reason === 'content' ?
          t('profile.cvErrorContent') :
          t('common.uploadFailed')
        );
      } else if (e instanceof AppError) {
        setError(e.message);
      } else {
        setError(t('common.uploadFailed'));
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return {
    inputRef,
    busy,
    error,
    justUploaded,
    upload,
    open: () => inputRef.current?.click(),
    clearError: () => setError(null)
  };
}

export type CvUpload = ReturnType<typeof useCvUpload>;