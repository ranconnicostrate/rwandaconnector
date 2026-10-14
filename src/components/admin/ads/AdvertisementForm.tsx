import React from 'react';
import { AlertCircleIcon, EyeIcon, PencilIcon } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { usePlatform } from '../../../contexts/PlatformContext';
import { Modal } from '../../ui/Modal';
import { AdMediaField } from './AdMediaField';
import { AdPreview } from './AdPreview';
import { useAdvertisementForm } from './useAdvertisementForm';
import { AD_SLOT_FIELD, AD_TYPE_KEY, AD_TYPES, AD_STATUS_KEY } from '../../../utils/ads';
import type { Advertisement, AdvertisementStatus, AdvertisementType } from '../../../types';

interface AdvertisementFormProps {
  open: boolean;
  /** Undefined creates a new ad. */
  ad?: Advertisement | null;
  onClose: () => void;
}

const field =
'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

export function AdvertisementForm({ open, ad, onClose }: AdvertisementFormProps) {
  const { t } = useTranslation();
  const { error } = usePlatform();
  const { form, set, slots, tab, setTab, localError, submit, cancel, preview, trackUpload } =
  useAdvertisementForm(ad, open, onClose);

  const statusOptions: AdvertisementStatus[] =
  ad?.status === 'EXPIRED' ? ['EXPIRED', 'DRAFT', 'PUBLISHED', 'UNPUBLISHED'] : ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'];

  return (
    <Modal
      open={open}
      onClose={cancel}
      width="lg"
      title={ad ? t('ads.editTitle') : t('ads.createTitle')}
      subtitle={t('ads.formSubtitle')}>
      
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-5">
        
        <div role="tablist" className="inline-flex rounded-lg bg-surface-muted p-1">
          {(
          [
          ['details', t('ads.tabDetails'), PencilIcon],
          ['preview', t('ads.preview'), EyeIcon]] as
          const).
          map(([key, label, Icon]) =>
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            tab === key ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-900'}`
            }>
            
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          )}
        </div>

        {tab === 'preview' ?
        <AdPreview ad={preview} /> :

        <>
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="ad-title">
                  {t('ads.title')}
                </label>
                <input
                id="ad-title"
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={t('ads.titlePlaceholder')}
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="ad-desc">
                  {t('ads.content')}
                </label>
                <textarea
                id="ad-desc"
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('ads.contentPlaceholder')}
                className={`${field} resize-none`} />
              
              </div>
            </div>

            <fieldset>
              <legend className={labelCls}>{t('ads.type')}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {AD_TYPES.map((type: AdvertisementType) =>
              <button
                key={type}
                type="button"
                aria-pressed={form.type === type}
                onClick={() => set('type', type)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                form.type === type ?
                'border-brand-400 bg-brand-50 text-brand-700' :
                'border-surface-border text-ink-700 hover:border-brand-200'}`
                }>
                
                    {t(AD_TYPE_KEY[type])}
                  </button>
              )}
              </div>
            </fieldset>

            {slots.length > 0 &&
          <div className={`grid gap-4 ${slots.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {slots.map((slot) => {
              const key = AD_SLOT_FIELD[slot];
              return (
                <AdMediaField
                  key={slot}
                  kind={slot === 'poster' ? 'image' : slot}
                  labelOverride={slot === 'poster' ? t('ads.poster') : undefined}
                  value={form[key]}
                  onChange={(ref) => set(key, ref)}
                  onUploaded={trackUpload} />);


            })}
              </div>
          }

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="ad-url">
                  {t('ads.link')} <span className="font-normal text-ink-400">({t('ads.optional')})</span>
                </label>
                <input
                id="ad-url"
                value={form.targetUrl ?? ''}
                onChange={(e) => set('targetUrl', e.target.value)}
                placeholder="https://… or /jobs"
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="ad-btn">
                  {t('ads.buttonText')} <span className="font-normal text-ink-400">({t('ads.optional')})</span>
                </label>
                <input
                id="ad-btn"
                maxLength={30}
                value={form.buttonText ?? ''}
                onChange={(e) => set('buttonText', e.target.value)}
                placeholder={t('ads.buttonPlaceholder')}
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="ad-start">
                  {t('ads.startDate')}
                </label>
                <input
                id="ad-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="ad-end">
                  {t('ads.endDate')}
                </label>
                <input
                id="ad-end"
                type="date"
                required
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={field} />
              
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="ad-status">
                  {t('ads.status')}
                </label>
                <select
                id="ad-status"
                value={form.status}
                onChange={(e) => set('status', e.target.value as AdvertisementStatus)}
                className={field}>
                
                  {statusOptions.map((s) =>
                <option key={s} value={s}>
                      {t(AD_STATUS_KEY[s])}
                    </option>
                )}
                </select>
                <p className="mt-1 text-[11px] text-ink-400">{t('ads.statusHelp')}</p>
              </div>
            </div>
          </>
        }

        {(localError || error) &&
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {localError ? t(localError) : error}
          </p>
        }

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
            
            {t('common.cancel')}
          </button>
          {tab === 'details' &&
          <button
            type="button"
            onClick={() => setTab('preview')}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
              <EyeIcon className="h-4 w-4" /> {t('ads.preview')}
            </button>
          }
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            {form.status === 'PUBLISHED' ? t('ads.saveAndPublish') : t('ads.save')}
          </button>
        </div>
      </form>
    </Modal>);

}