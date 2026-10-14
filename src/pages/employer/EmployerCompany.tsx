import React, { useState } from 'react';
import { BadgeCheckIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../../components/ui/Avatar';
import { readUpload, UploadError } from '../../utils/upload';

export function EmployerCompany() {
  const { t, formatNumber } = useTranslation();
  const { currentUser, companyById, updateCompany, companyFollowers, jobs, posts } = usePlatform();
  const company = companyById(currentUser.companyId ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!company) {
    return (
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
        {t('common.noResults')}
      </p>);

  }

  const field =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

  const onLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const result = await readUpload(file, 'image');
      updateCompany(company.id, { logoUrl: result.url });
    } catch (e) {
      setUploadError(
        e instanceof UploadError ?
        `${e.message}${e.limitMb ? ` (max ${e.limitMb} MB)` : ''}` :
        t('common.uploadFailed')
      );
    } finally {
      setUploading(false);
    }
  };

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateCompany(
      company.id,
      {
        name: String(data.get('name') ?? '').trim() || company.name,
        industry: String(data.get('industry') ?? ''),
        location: String(data.get('location') ?? ''),
        website: String(data.get('website') ?? ''),
        employees: String(data.get('employees') ?? ''),
        about: String(data.get('about') ?? '')
      }
    );
  };

  const openJobs = jobs.filter((j) => j.companyId === company.id && j.open);
  const companyPosts = posts.filter((p) => p.authorType === 'COMPANY' && p.authorId === company.id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <Avatar
          name={company.name}
          initials={company.logo}
          color={company.logoColor}
          photo={company.logoUrl}
          size="xl"
          square />
        
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-ink-900">
            {company.name}
            {company.verified && <BadgeCheckIcon className="h-5 w-5 text-brand-600" />}
          </h1>
          <p className="mt-1 text-xs text-ink-500">
            {formatNumber(companyFollowers(company.id).length)} {t('company.followers')} ·{' '}
            {openJobs.length} {t('company.openPositions')} · {companyPosts.length} {t('company.posts')}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
            company.approval === 'APPROVED' ?
            'bg-leaf-50 text-leaf-600' :
            company.approval === 'PENDING' ?
            'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-600'}`
            }>
            
            {company.approval === 'APPROVED' ?
            t('admin.active') :
            company.approval === 'PENDING' ?
            t('admin.pendingApproval') :
            t('common.reject')}
          </span>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
          {uploading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <UploadCloudIcon className="h-4 w-4" />}
          {t('company.uploadLogo')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => onLogo(e.target.files?.[0])} />
          
        </label>
      </header>

      {uploadError &&
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {uploadError}
        </p>
      }

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink-900">{t('company.profile')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="c-name">
              {t('company.name')}
            </label>
            <input id="c-name" name="name" defaultValue={company.name} required className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-industry">
              {t('company.industry')}
            </label>
            <input id="c-industry" name="industry" defaultValue={company.industry} className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-location">
              {t('jobs.location')}
            </label>
            <input id="c-location" name="location" defaultValue={company.location} className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-website">
              {t('company.website')}
            </label>
            <input id="c-website" name="website" defaultValue={company.website} className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-employees">
              {t('company.employees')}
            </label>
            <input id="c-employees" name="employees" defaultValue={company.employees} className={field} />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="c-about">
            {t('company.about')}
          </label>
          <textarea
            id="c-about"
            name="about"
            rows={4}
            defaultValue={company.about}
            className={`${field} resize-none`} />
          
        </div>
        <div className="flex justify-end border-t border-surface-border pt-4">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>);

}