import React, { useRef, useState } from 'react';
import { AlertCircleIcon, CameraIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { TagInput } from './TagInput';
import { useEditProfileForm } from './useEditProfileForm';
import { validateUpload, verifyFileSignature, UploadError } from '../../utils/upload';
import { resizeImage } from '../../utils/image';

type Tab = 'basics' | 'experience' | 'education' | 'skills';

const field =
'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

export function EditProfileModal({ open, onClose, initialTab = 'basics' }: {open: boolean;onClose: () => void;initialTab?: Tab;}) {
  const { t } = useTranslation();
  const { currentUser, error } = usePlatform();
  const form = useEditProfileForm(open, onClose);
  const { draft, set } = form;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTab(initialTab);
      setPhotoError(null);
    }
  }, [open, initialTab]);

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    try {
      validateUpload(file, 'image');
      await verifyFileSignature(file);
      set('photo', await resizeImage(file));
    } catch (e) {
      setPhotoError(
        e instanceof UploadError && e.reason === 'size' ?
        t('profile.photoErrorSize', { mb: e.limitMb ?? 4 }) :
        e instanceof UploadError && e.reason === 'type' ?
        t('profile.photoErrorType') :
        t('common.uploadFailed')
      );
    } finally {
      if (photoInput.current) photoInput.current.value = '';
    }
  };

  const tabs: [Tab, string, number?][] = [
  ['basics', t('profile.tabBasics')],
  ['experience', t('profile.experience'), draft.experience.length],
  ['education', t('profile.educationSection'), draft.education.length],
  ['skills', t('profile.tabSkills')]];


  return (
    <Modal open={open} onClose={onClose} width="lg" title={t('profile.editProfile')} subtitle={t('profile.editSubtitle')}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          form.save();
        }}
        className="space-y-5">
        
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-surface-border">
          {tabs.map(([key, label, count]) =>
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-900'}`
            }>
            
              {label}
              {count !== undefined && count > 0 &&
            <span className="rounded-full bg-surface-muted px-1.5 text-[11px] tabular-nums text-ink-500">{count}</span>
            }
            </button>
          )}
        </div>

        {tab === 'basics' &&
        <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={draft.name || currentUser.name} color={currentUser.avatar} photo={draft.photo ?? undefined} size="xl" />
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-2">
                  <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
                  
                    <CameraIcon className="h-3.5 w-3.5" /> {draft.photo ? t('profile.changePhoto') : t('profile.addPhoto')}
                  </button>
                  {draft.photo &&
                <button
                  type="button"
                  onClick={() => set('photo', null)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50">
                  
                      {t('common.remove')}
                    </button>
                }
                </div>
                <p className="text-[11px] text-ink-400">{t('profile.photoHint')}</p>
                {photoError &&
              <p role="alert" className="text-xs font-medium text-red-600">
                    {photoError}
                  </p>
              }
              </div>
              <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-label={t('profile.addPhoto')}
              onChange={(e) => pickPhoto(e.target.files?.[0])} />
            
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="pf-name">{t('profile.fullName')}</label>
                <input id="pf-name" maxLength={80} value={draft.name} onChange={(e) => set('name', e.target.value)} className={field} />
              </div>
              <div>
                <label className={labelCls} htmlFor="pf-location">{t('jobs.location')}</label>
                <input id="pf-location" maxLength={60} value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="Kigali" className={field} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="pf-headline">{t('profile.headline')}</label>
                <input
                id="pf-headline"
                maxLength={120}
                value={draft.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder={t('profile.headlinePlaceholder')}
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="pf-phone">{t('apply.phone')}</label>
                <input id="pf-phone" type="tel" maxLength={20} value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+250 788 123 456" className={field} />
              </div>
              <div>
                <p className={labelCls}>{t('apply.email')}</p>
                <p className="rounded-lg bg-surface-muted px-3 py-2.5 text-sm text-ink-500">{currentUser.email}</p>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="pf-about">{t('profile.about')}</label>
              <textarea
              id="pf-about"
              rows={5}
              maxLength={2000}
              value={draft.about}
              onChange={(e) => set('about', e.target.value)}
              placeholder={t('profile.aboutPlaceholder')}
              className={`${field} resize-none`} />
            
              <p className="mt-1 text-right text-[11px] tabular-nums text-ink-400">{draft.about.length} / 2000</p>
            </div>
          </div>
        }

        {tab === 'experience' &&
        <div className="space-y-3">
            {draft.experience.map((item, i) =>
          <fieldset key={item.id} className="space-y-3 rounded-xl border border-surface-border p-4">
                <div className="flex items-center justify-between">
                  <legend className="text-xs font-bold text-ink-500">{t('profile.position', { n: i + 1 })}</legend>
                  <button
                type="button"
                onClick={() => form.removeExperience(item.id)}
                aria-label={t('common.remove')}
                className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600">
                
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`ex-role-${item.id}`}>{t('profile.jobTitle')}</label>
                    <input id={`ex-role-${item.id}`} value={item.role} onChange={(e) => form.updateExperience(item.id, { role: e.target.value })} className={field} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ex-org-${item.id}`}>{t('profile.organization')}</label>
                    <input id={`ex-org-${item.id}`} value={item.organization} onChange={(e) => form.updateExperience(item.id, { organization: e.target.value })} className={field} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ex-start-${item.id}`}>{t('profile.from')}</label>
                    <input id={`ex-start-${item.id}`} type="month" value={item.start} onChange={(e) => form.updateExperience(item.id, { start: e.target.value })} className={field} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ex-end-${item.id}`}>{t('profile.to')}</label>
                    <input
                  id={`ex-end-${item.id}`}
                  type="month"
                  disabled={item.current}
                  min={item.start || undefined}
                  value={item.current ? '' : item.end}
                  onChange={(e) => form.updateExperience(item.id, { end: e.target.value })}
                  className={`${field} disabled:bg-surface-muted disabled:text-ink-400`} />
                
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                type="checkbox"
                checked={item.current}
                onChange={(e) => form.updateExperience(item.id, { current: e.target.checked })}
                className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-400" />
              
                  {t('profile.currentRole')}
                </label>
                <div>
                  <label className={labelCls} htmlFor={`ex-desc-${item.id}`}>{t('profile.whatYouDid')}</label>
                  <textarea
                id={`ex-desc-${item.id}`}
                rows={2}
                maxLength={600}
                value={item.description}
                onChange={(e) => form.updateExperience(item.id, { description: e.target.value })}
                className={`${field} resize-none`} />
              
                </div>
              </fieldset>
          )}
            {draft.experience.length === 0 && <p className="py-4 text-center text-sm text-ink-400">{t('profile.noExperience')}</p>}
            <AddButton onClick={form.addExperience}>{t('profile.addPosition')}</AddButton>
          </div>
        }

        {tab === 'education' &&
        <div className="space-y-3">
            {draft.education.map((item, i) =>
          <fieldset key={item.id} className="space-y-3 rounded-xl border border-surface-border p-4">
                <div className="flex items-center justify-between">
                  <legend className="text-xs font-bold text-ink-500">{t('profile.school', { n: i + 1 })}</legend>
                  <button
                type="button"
                onClick={() => form.removeEducation(item.id)}
                aria-label={t('common.remove')}
                className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600">
                
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor={`ed-school-${item.id}`}>{t('profile.schoolName')}</label>
                    <input id={`ed-school-${item.id}`} value={item.school} onChange={(e) => form.updateEducation(item.id, { school: e.target.value })} placeholder="University of Rwanda" className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor={`ed-degree-${item.id}`}>{t('profile.degree')}</label>
                    <input id={`ed-degree-${item.id}`} value={item.degree} onChange={(e) => form.updateEducation(item.id, { degree: e.target.value })} placeholder="BSc Computer Science" className={field} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ed-start-${item.id}`}>{t('profile.startYear')}</label>
                    <input id={`ed-start-${item.id}`} inputMode="numeric" maxLength={4} value={item.startYear} onChange={(e) => form.updateEducation(item.id, { startYear: e.target.value.replace(/\D/g, '') })} placeholder="2019" className={field} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ed-end-${item.id}`}>{t('profile.endYear')}</label>
                    <input id={`ed-end-${item.id}`} inputMode="numeric" maxLength={4} value={item.endYear} onChange={(e) => form.updateEducation(item.id, { endYear: e.target.value.replace(/\D/g, '') })} placeholder="2023" className={field} />
                  </div>
                </div>
              </fieldset>
          )}
            {draft.education.length === 0 && <p className="py-4 text-center text-sm text-ink-400">{t('profile.noEducation')}</p>}
            <AddButton onClick={form.addEducation}>{t('profile.addSchool')}</AddButton>
          </div>
        }

        {tab === 'skills' &&
        <div className="space-y-4">
            <TagInput id="pf-skills" label={t('profile.skills')} values={draft.skills} onChange={(v) => set('skills', v)} placeholder="React, SQL, Project management" hint={t('profile.tagHint')} />
            <TagInput id="pf-certs" label={t('profile.certifications')} values={draft.certifications} onChange={(v) => set('certifications', v)} placeholder="AWS Cloud Practitioner" max={20} />
            <TagInput id="pf-langs" label={t('profile.languages')} values={draft.languages} onChange={(v) => set('languages', v)} placeholder="Kinyarwanda, English" max={10} />
          </div>
        }

        {error &&
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        }

        <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
            
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            {t('profile.saveChanges')}
          </button>
        </div>
      </form>
    </Modal>);

}

function AddButton({ onClick, children }: {onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border py-3 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-400 hover:text-brand-700">
      
      <PlusIcon className="h-4 w-4" /> {children}
    </button>);

}