import React, { useRef, useState } from 'react';
import { BriefcaseIcon, FileTextIcon, ImageIcon, Loader2Icon, VideoIcon, XIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../ui/Avatar';
import { readUpload, UploadError } from '../../utils/upload';
import type { PostKind, PostMedia } from '../../types';

export function PostComposer() {
  const { t } = useTranslation();
  const { currentUser, addPost, jobs, role } = usePlatform();
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<PostKind>('TEXT');
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [jobId, setJobId] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const firstName = currentUser.name.split(' ')[0];
  const myJobs = jobs.filter((j) => j.ownerId === currentUser.id);

  const attach = async (files: FileList | null, mediaKind: 'IMAGE' | 'VIDEO') => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setBusy(true);
    try {
      const results: PostMedia[] = [];
      for (const file of Array.from(files).slice(0, 4)) {
        const result = await readUpload(file, mediaKind === 'IMAGE' ? 'image' : 'video');
        results.push({ kind: mediaKind, url: result.url, name: result.name });
      }
      setMedia((prev) => [...prev, ...results].slice(0, 4));
      setKind(mediaKind);
      setExpanded(true);
    } catch (e) {
      setUploadError(
        e instanceof UploadError ?
        `${e.message}${e.limitMb ? ` (max ${e.limitMb} MB)` : ''}` :
        t('common.uploadFailed')
      );
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setBody('');
    setKind('TEXT');
    setMedia([]);
    setJobId('');
    setExpanded(false);
  };

  const submit = () => {
    const ok = addPost({
      body,
      kind: jobId ? 'JOB' : kind,
      media,
      jobId: jobId || undefined
    });
    if (ok) reset();
  };

  const canPost = body.trim().length > 0 || media.length > 0;

  return (
    <section aria-label={t('feed.createPost')} className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <Avatar name={currentUser.name} color={currentUser.avatar} photo={currentUser.photo} size="md" />
        {expanded ?
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={t('feed.whatsOnYourMind', { name: firstName })}
          className="w-full resize-none rounded-xl border border-surface-border px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none" /> :


        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="h-11 w-full rounded-full border border-surface-border px-4 text-left text-sm text-ink-400 transition-colors duration-150 hover:border-brand-200 hover:bg-surface-muted">
          
            {t('feed.whatsOnYourMind', { name: firstName })}
          </button>
        }
      </div>

      {media.length > 0 &&
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {media.map((m, i) =>
        <li key={`${m.name}-${i}`} className="relative overflow-hidden rounded-xl border border-surface-border">
              {m.kind === 'VIDEO' ?
          <video src={m.url} className="h-24 w-full bg-navy-900 object-cover" /> :

          <img src={m.url} alt={m.name} className="h-24 w-full object-cover" />
          }
              <button
            type="button"
            onClick={() => setMedia((prev) => prev.filter((_, idx) => idx !== i))}
            aria-label={t('common.remove')}
            className="absolute right-1 top-1 rounded-full bg-navy-900/80 p-1 text-white transition-colors duration-150 hover:bg-navy-900">
            
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </li>
        )}
        </ul>
      }

      {expanded && role === 'EMPLOYER' && myJobs.length > 0 &&
      <div className="mt-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="composer-job">
            {t('feed.attachJob')}
          </label>
          <select
          id="composer-job"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none">
          
            <option value="">{t('common.all')}</option>
            {myJobs.map((job) =>
          <option key={job.id} value={job.id}>
                {job.title}
              </option>
          )}
          </select>
        </div>
      }

      {uploadError &&
      <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {uploadError}
        </p>
      }

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-surface-border pt-3">
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
          <ImageIcon className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">{t('feed.photo')}</span>
        </button>
        <input
          ref={imageRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => attach(e.target.files, 'IMAGE')} />
        

        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
          <VideoIcon className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">{t('feed.video')}</span>
        </button>
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(e) => attach(e.target.files, 'VIDEO')} />
        

        <button
          type="button"
          onClick={() => {
            setKind('ARTICLE');
            setExpanded(true);
          }}
          aria-pressed={kind === 'ARTICLE'}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          kind === 'ARTICLE' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
          }>
          
          <FileTextIcon className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">{t('feed.article')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setKind('JOB');
            setExpanded(true);
          }}
          aria-pressed={kind === 'JOB'}
          disabled={role !== 'EMPLOYER'}
          title={role !== 'EMPLOYER' ? t('feed.employersOnly') : undefined}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
          kind === 'JOB' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
          }>
          
          <BriefcaseIcon className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">{t('feed.jobOpportunity')}</span>
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={!canPost || busy}
          className="ml-auto flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-200">
          
          {busy && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {t('common.post')}
        </button>
      </div>
    </section>);

}