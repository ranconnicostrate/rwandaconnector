import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  FilmIcon,
  ImageIcon,
  MegaphoneIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  Trash2Icon,
  TypeIcon,
  LayersIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AdvertisementForm } from '../../components/admin/ads/AdvertisementForm';
import { AdPreview } from '../../components/admin/ads/AdPreview';
import { useAdvertisementTable, PAGE_SIZE, type AdSort } from '../../components/admin/ads/useAdvertisementTable';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import {
  AD_STATUSES,
  AD_STATUS_KEY,
  AD_STATUS_TONE,
  AD_TYPES,
  AD_TYPE_KEY,
  adSchedule,
  dateFromKey } from
'../../utils/ads';
import type { Advertisement, AdvertisementStatus, AdvertisementType } from '../../types';

const TYPE_ICON: Record<AdvertisementType, typeof ImageIcon> = {
  TEXT: TypeIcon,
  IMAGE: ImageIcon,
  ANIMATION: SparklesIcon,
  VIDEO: FilmIcon,
  MIXED: LayersIcon
};

export function AdminAdvertisements() {
  const { t, formatDate, formatNumber } = useTranslation();
  const { advertisements, liveAdvertisements, setAdvertisementStatus, deleteAdvertisement } = usePlatform();
  const table = useAdvertisementTable(advertisements);

  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<Advertisement | null>(null);
  const [deleting, setDeleting] = useState<Advertisement | null>(null);

  const date = (key: string) => formatDate(dateFromKey(key));
  const statusTabs: (AdvertisementStatus | 'ALL')[] = ['ALL', ...AD_STATUSES];

  const iconBtn =
  'rounded-lg p-2 text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900';

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{t('nav.advertisements')}</h1>
          <p className="text-sm text-ink-500">
            {t('ads.liveSummary', { count: formatNumber(liveAdvertisements.length) })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
          
          <PlusIcon className="h-4 w-4" /> {t('ads.create')}
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        <div className="space-y-3 border-b border-surface-border p-4">
          <div role="tablist" aria-label={t('ads.status')} className="flex flex-wrap gap-1.5">
            {statusTabs.map((s) =>
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={table.status === s}
              onClick={() => table.setStatus(s)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              table.status === s ? 'bg-navy-800 text-white' : 'bg-surface-muted text-ink-700 hover:bg-navy-50'}`
              }>
              
                {s === 'ALL' ? t('common.all') : t(AD_STATUS_KEY[s])}
                <span className={`tabular-nums ${table.status === s ? 'text-navy-100' : 'text-ink-400'}`}>
                  {table.counts[s]}
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={table.query}
                onChange={(e) => table.setQuery(e.target.value)}
                placeholder={t('ads.search')}
                aria-label={t('ads.search')}
                className="w-full rounded-xl border border-surface-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none" />
              
            </div>
            <select
              value={table.type}
              onChange={(e) => table.setType(e.target.value as AdvertisementType | 'ALL')}
              aria-label={t('ads.type')}
              className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none">
              
              <option value="ALL">{t('ads.allTypes')}</option>
              {AD_TYPES.map((type) =>
              <option key={type} value={type}>
                  {t(AD_TYPE_KEY[type])}
                </option>
              )}
            </select>
            <select
              value={table.sort}
              onChange={(e) => table.setSort(e.target.value as AdSort)}
              aria-label={t('ads.sort')}
              className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none">
              
              <option value="startDesc">{t('ads.sortStartDesc')}</option>
              <option value="startAsc">{t('ads.sortStartAsc')}</option>
              <option value="endAsc">{t('ads.sortEndingSoon')}</option>
              <option value="updated">{t('ads.sortUpdated')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">{t('ads.advertisement')}</th>
                <th className="px-4 py-3">{t('ads.type')}</th>
                <th className="px-4 py-3">{t('ads.status')}</th>
                <th className="px-4 py-3">{t('ads.startDate')}</th>
                <th className="px-4 py-3">{t('ads.endDate')}</th>
                <th className="px-4 py-3 text-right">{t('ads.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((ad) => {
                const TypeIcon = TYPE_ICON[ad.type];
                const schedule = adSchedule(ad);
                const canPublish = ad.status === 'DRAFT' || ad.status === 'UNPUBLISHED';
                return (
                  <tr key={ad.id} className="border-t border-surface-border align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb ad={ad} />
                        <div className="min-w-0 max-w-[280px]">
                          <p className="truncate font-semibold text-ink-900">{ad.title}</p>
                          <p className="truncate text-xs text-ink-500">{ad.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-ink-700">
                        <TypeIcon className="h-4 w-4 text-ink-400" /> {t(AD_TYPE_KEY[ad.type])}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${AD_STATUS_TONE[ad.status]}`}>
                        {t(AD_STATUS_KEY[ad.status])}
                      </span>
                      {schedule &&
                      <p className={`mt-1 text-[11px] ${schedule === 'LIVE' ? 'text-leaf-600' : 'text-ink-400'}`}>
                          {schedule === 'LIVE' ? t('ads.liveNow') : t('ads.startsOn', { date: date(ad.startDate) })}
                        </p>
                      }
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-700">{date(ad.startDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-700">{date(ad.endDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button type="button" onClick={() => setPreviewing(ad)} className={iconBtn} aria-label={t('ads.preview')} title={t('ads.preview')}>
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditing(ad)} className={iconBtn} aria-label={t('common.edit')} title={t('common.edit')}>
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {ad.status === 'PUBLISHED' ?
                        <button
                          type="button"
                          onClick={() => setAdvertisementStatus(ad.id, 'UNPUBLISHED')}
                          className="ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-amber-200 hover:text-amber-700">
                          
                            <EyeOffIcon className="h-3.5 w-3.5" /> {t('ads.unpublish')}
                          </button> :
                        canPublish ?
                        <button
                          type="button"
                          onClick={() => setAdvertisementStatus(ad.id, 'PUBLISHED')}
                          className="ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
                          
                            <SendIcon className="h-3.5 w-3.5" /> {t('ads.publish')}
                          </button> :

                        <button
                          type="button"
                          onClick={() => setEditing(ad)}
                          className="ml-1 whitespace-nowrap rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
                          
                            {t('ads.extend')}
                          </button>
                        }
                        <button
                          type="button"
                          onClick={() => setDeleting(ad)}
                          className="ml-0.5 rounded-lg p-2 text-ink-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                          aria-label={t('ads.delete')}
                          title={t('ads.delete')}>
                          
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>

          {table.rows.length === 0 &&
          <div className="px-6 py-14 text-center">
              <MegaphoneIcon className="mx-auto h-8 w-8 text-ink-300" />
              <p className="mt-3 text-sm font-semibold text-ink-900">
                {advertisements.length === 0 ? t('ads.emptyTitle') : t('common.noResults')}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {advertisements.length === 0 ? t('ads.emptyBody') : t('ads.noMatchBody')}
              </p>
              {table.filtersActive &&
            <button
              type="button"
              onClick={table.clear}
              className="mt-4 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
              
                  {t('ads.clearFilters')}
                </button>
            }
            </div>
          }
        </div>

        {table.total > PAGE_SIZE &&
        <footer className="flex items-center justify-between gap-3 border-t border-surface-border px-4 py-3 text-xs text-ink-500">
            <span>
              {t('ads.pageOf', {
              from: (table.page - 1) * PAGE_SIZE + 1,
              to: Math.min(table.page * PAGE_SIZE, table.total),
              total: table.total
            })}
            </span>
            <div className="flex items-center gap-1">
              <button
              type="button"
              disabled={table.page === 1}
              onClick={() => table.setPage(table.page - 1)}
              aria-label={t('ads.previous')}
              className="rounded-lg border border-surface-border p-1.5 transition-colors duration-150 hover:border-brand-200 disabled:opacity-40">
              
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="px-2 font-semibold tabular-nums text-ink-700">
                {table.page} / {table.pageCount}
              </span>
              <button
              type="button"
              disabled={table.page === table.pageCount}
              onClick={() => table.setPage(table.page + 1)}
              aria-label={t('ads.next')}
              className="rounded-lg border border-surface-border p-1.5 transition-colors duration-150 hover:border-brand-200 disabled:opacity-40">
              
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </footer>
        }
      </section>

      <AdvertisementForm
        open={creating || !!editing}
        ad={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }} />
      

      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        width="lg"
        title={previewing?.title ?? ''}
        subtitle={previewing ? `${t(AD_STATUS_KEY[previewing.status])} · ${date(previewing.startDate)} – ${date(previewing.endDate)}` : undefined}>
        
        {previewing && <AdPreview ad={previewing} />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('ads.delete')}
        message={t('ads.confirmDelete')}
        detail={deleting?.title}
        confirmLabel={t('ads.delete')}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteAdvertisement(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}

function Thumb({ ad }: {ad: Advertisement;}) {
  const ref = ad.imageUrl ?? ad.animationUrl ?? ad.posterUrl;
  const { url } = useMediaUrl(ref);
  const Icon = TYPE_ICON[ad.type];
  return (
    <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4 text-ink-400" />}
    </div>);

}