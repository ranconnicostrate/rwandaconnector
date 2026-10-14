import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheckIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { isJobVisible } from '../utils/jobs';

export function Companies() {
  const { t, formatNumber } = useTranslation();
  const { companies, jobs, followedCompanies, toggleFollowCompany, companyFollowers } = usePlatform();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.companies')}</h1>

      <ul className="grid gap-3 sm:grid-cols-2">
        {companies
        // Companies awaiting verification can already hire, so list them too.
        .filter((c) => c.approval !== 'REJECTED' && c.status !== 'SUSPENDED').
        map((company) => {
          const open = jobs.filter((j) => j.companyId === company.id && isJobVisible(j, company)).length;
          const following = followedCompanies.includes(company.id);
          return (
            <li
              key={company.id}
              className="flex flex-col rounded-2xl border border-surface-border bg-white p-5 shadow-card">
              
                <div className="flex items-start gap-3">
                  <Avatar
                  name={company.name}
                  initials={company.logo}
                  color={company.logoColor}
                  photo={company.logoUrl}
                  size="lg"
                  square />
                
                  <div className="min-w-0 flex-1">
                    <Link
                    to={`/companies/${company.id}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-ink-900 hover:text-brand-700">
                    
                      <span className="truncate">{company.name}</span>
                      {company.verified && <BadgeCheckIcon className="h-4 w-4 shrink-0 text-brand-600" />}
                    </Link>
                    <p className="truncate text-xs text-ink-500">
                      {company.industry} · {company.location}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-700">{company.about}</p>
                <dl className="mt-3 flex gap-5 text-xs text-ink-500">
                  <div>
                    <dt className="font-semibold text-ink-700">
                      {formatNumber(companyFollowers(company.id).length)}
                    </dt>
                    <dd>{t('company.followers')}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-700">{open}</dt>
                    <dd>{t('company.openPositions')}</dd>
                  </div>
                </dl>
                <button
                type="button"
                onClick={() => toggleFollowCompany(company.id)}
                className={`mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                following ?
                'border border-surface-border text-ink-700 hover:border-red-200 hover:text-red-600' :
                'bg-brand-600 text-white hover:bg-brand-700'}`
                }>
                
                  {following ? t('common.following') : t('common.follow')}
                </button>
              </li>);

        })}
      </ul>
    </div>);

}