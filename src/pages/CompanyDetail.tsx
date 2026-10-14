import React from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheckIcon, GlobeIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { JobCard } from '../components/jobs/JobCard';
import { PostCard } from '../components/feed/PostCard';
import { isJobVisible } from '../utils/jobs';

export function CompanyDetail() {
  const { companyId = '' } = useParams();
  const { t, formatNumber } = useTranslation();
  const { companyById, jobs, posts, followedCompanies, toggleFollowCompany, companyFollowers } =
  usePlatform();
  const company = companyById(companyId);

  if (!company) {
    return (
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400">
        {t('common.noResults')}
      </p>);

  }

  const openJobs = jobs.filter((j) => j.companyId === company.id && isJobVisible(j, company));
  const companyPosts = posts.filter((p) => p.authorType === 'COMPANY' && p.authorId === company.id);
  const following = followedCompanies.includes(company.id);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar
            name={company.name}
            initials={company.logo}
            color={company.logoColor}
            photo={company.logoUrl}
            size="xl"
            square />
          
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
              {company.name}
              {company.verified && <BadgeCheckIcon className="h-5 w-5 text-brand-600" />}
            </h1>
            <p className="mt-1 text-sm text-ink-500">{company.industry}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" /> {company.location}
              </span>
              <span className="flex items-center gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" /> {company.employees} {t('company.employees')}
              </span>
              <span className="flex items-center gap-1.5">
                <GlobeIcon className="h-3.5 w-3.5" /> {company.website}
              </span>
              <span className="font-semibold text-ink-700">
                {formatNumber(companyFollowers(company.id).length)} {t('company.followers')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleFollowCompany(company.id)}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            following ?
            'border border-surface-border text-ink-700 hover:border-red-200 hover:text-red-600' :
            'bg-brand-600 text-white hover:bg-brand-700'}`
            }>
            
            {following ? t('common.following') : t('common.follow')}
          </button>
        </div>
        <p className="mt-4 border-t border-surface-border pt-4 text-sm leading-relaxed text-ink-700">
          {company.about}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-base font-bold text-ink-900">
          {t('company.openPositions')} · {openJobs.length}
        </h2>
        <div className="space-y-3">
          {openJobs.map((job) =>
          <JobCard key={job.id} job={job} />
          )}
          {openJobs.length === 0 &&
          <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
              {t('common.noResults')}
            </p>
          }
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-ink-900">{t('company.posts')}</h2>
        <div className="space-y-4">
          {companyPosts.map((post) =>
          <PostCard key={post.id} post={post} />
          )}
          {companyPosts.length === 0 &&
          <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
              {t('feed.emptyFeed')}
            </p>
          }
        </div>
      </section>
    </div>);

}