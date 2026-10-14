import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheckIcon, BookmarkIcon, CalendarClockIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { ApplyModal } from '../components/jobs/ApplyModal';
import { TYPE_KEY } from '../components/jobs/JobCard';
import { JobDistance } from '../components/jobs/JobDistance';
import { JobLocationActions } from '../components/jobs/JobLocationActions';
import { jobAddress, workMode } from '../utils/geo';

export function JobDetail() {
  const { jobId = '' } = useParams();
  const [params] = useSearchParams();
  const { t, formatSalary, formatDate, formatRelative } = useTranslation();
  const { jobById, companyById, savedJobs, toggleSaveJob, applications, currentUser, followedCompanies, toggleFollowCompany } =
  usePlatform();
  const job = jobById(jobId);
  const [applyOpen, setApplyOpen] = useState(params.get('apply') === '1');

  if (!job) {
    return (
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400">
        {t('common.noResults')}
      </p>);

  }

  const company = companyById(job.companyId);
  const saved = savedJobs.includes(job.id);
  const applied = applications.some((a) => a.jobId === job.id && a.applicantId === currentUser.id);
  const following = followedCompanies.includes(job.companyId);

  const Section = ({ title, items }: {title: string;items: string[];}) =>
  <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">{title}</h2>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) =>
      <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            {item}
          </li>
      )}
      </ul>
    </section>;


  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
        <div className="flex items-start gap-4">
          <Avatar name={company?.name ?? ''} initials={company?.logo} color={company?.logoColor} size="xl" square />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight text-ink-900">{job.title}</h1>
            <Link
              to={`/companies/${job.companyId}`}
              className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
              
              {company?.name}
              {company?.verified && <BadgeCheckIcon className="h-4 w-4 text-brand-600" />}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" />{' '}
                {workMode(job) === 'REMOTE' ? t('geo.remoteNoWorkplace') : jobAddress(job)}
              </span>
              <JobDistance job={job} />
              <span className="flex items-center gap-1.5">
                <CalendarClockIcon className="h-3.5 w-3.5" /> {t('jobs.deadline')}: {formatDate(job.deadline)}
              </span>
              <span>
                {t('jobs.posted')} {formatRelative(job.postedAt)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-leaf-50 px-2.5 py-1 text-sm font-bold text-leaf-600">
                {formatSalary(job.salaryMin, job.salaryMax)} {t('jobs.perMonth')}
              </span>
              <span className="rounded-md bg-surface-muted px-2.5 py-1 text-sm font-medium text-ink-700">
                {t(TYPE_KEY[job.type])}
              </span>
              {workMode(job) !== 'ON_SITE' &&
              <span className="rounded-md bg-gold-400/20 px-2.5 py-1 text-sm font-semibold text-ink-700">
                  {workMode(job) === 'REMOTE' ? t('geo.remote') : t('geo.hybrid')}
                </span>
              }
              <span className="rounded-md bg-surface-muted px-2.5 py-1 text-sm font-medium text-ink-700">
                {job.experience}
              </span>
              <span className="rounded-md bg-surface-muted px-2.5 py-1 text-sm font-medium text-ink-700">
                {job.education}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-y border-surface-border py-4">
          <button
            type="button"
            disabled={applied}
            onClick={() => setApplyOpen(true)}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            applied ? 'bg-leaf-50 text-leaf-600' : 'bg-brand-600 text-white hover:bg-brand-700'}`
            }>
            
            {applied ? t('jobs.applied') : t('jobs.applyNow')}
          </button>
          <button
            type="button"
            onClick={() => toggleSaveJob(job.id)}
            className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
            <BookmarkIcon className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
            {saved ? t('common.saved') : t('jobs.saveJob')}
          </button>
          <JobLocationActions job={job} size="md" />
          <Link
            to={`/companies/${job.companyId}`}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
            {t('common.viewCompany')}
          </Link>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">{t('jobs.description')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{job.description}</p>
        </section>
        <Section title={t('jobs.responsibilities')} items={job.responsibilities} />
        <Section title={t('jobs.requirements')} items={job.requirements} />
        <Section title={t('jobs.benefits')} items={job.benefits} />
      </article>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <Avatar name={company?.name ?? ''} initials={company?.logo} color={company?.logoColor} size="lg" square />
          <h2 className="mt-3 text-base font-bold text-ink-900">{company?.name}</h2>
          <p className="text-xs text-ink-500">
            {company?.industry} · {company?.location}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{company?.about}</p>
          <button
            type="button"
            onClick={() => toggleFollowCompany(job.companyId)}
            className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            following ?
            'border border-surface-border text-ink-700 hover:border-red-200 hover:text-red-600' :
            'bg-brand-600 text-white hover:bg-brand-700'}`
            }>
            
            {following ? t('common.following') : t('common.follow')}
          </button>
        </section>

        <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold text-ink-900">{t('apply.skills')}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {job.skills.map((skill) =>
            <li key={skill} className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-700">
                {skill}
              </li>
            )}
          </ul>
        </section>
      </aside>

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>);

}