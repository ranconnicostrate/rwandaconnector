import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../../components/ui/Avatar';

export function AdminCompanies() {
  const { t, formatNumber } = useTranslation();
  const { companies, setCompanyApproval, verifyCompany, companyFollowers } = usePlatform();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.companies')}</h1>

      <ul className="space-y-3">
        {companies.map((company) =>
        <li
          key={company.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-surface-border bg-white p-4 shadow-card">
          
            <Avatar name={company.name} initials={company.logo} color={company.logoColor} size="md" square />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                {company.name}
                {company.verified && <BadgeCheckIcon className="h-4 w-4 text-brand-600" />}
              </p>
              <p className="text-xs text-ink-500">
                {company.industry} · {company.location} ·{' '}
                {formatNumber(companyFollowers(company.id).length)} {t('company.followers')}
              </p>
            </div>
            <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
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
            <div className="flex flex-wrap gap-2">
              <button
              type="button"
              onClick={() => setCompanyApproval(company.id, 'APPROVED')}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
                {t('admin.approve')}
              </button>
              <button
              type="button"
              onClick={() => verifyCompany(company.id)}
              disabled={company.verified}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700 disabled:opacity-40">
              
                {t('admin.verify')}
              </button>
              <button
              type="button"
              onClick={() => setCompanyApproval(company.id, 'REJECTED')}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
              
                {t('admin.suspend')}
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>);

}