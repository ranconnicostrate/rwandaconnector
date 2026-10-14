import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  CalendarClockIcon,
  GraduationCapIcon,
  MapPinIcon,
  TrendingUpIcon,
  UsersIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../ui/Avatar';
import { JobDistance } from './JobDistance';
import { JobLocationActions } from './JobLocationActions';
import { JOB_TYPE_KEY } from '../../utils/jobs';
import { jobAddress, workMode } from '../../utils/geo';
import type { Job } from '../../types';

export const TYPE_KEY = JOB_TYPE_KEY;

export function JobCard({ job }: {job: Job;}) {
  const { t, formatSalary, formatRelative, formatDate } = useTranslation();
  const { companyById, savedJobs, toggleSaveJob, applications, currentUser, role } = usePlatform();
  const company = companyById(job.companyId);
  const saved = savedJobs.includes(job.id);
  const applied = applications.some((a) => a.jobId === job.id && a.applicantId === currentUser.id);
  const isSeeker = role === 'JOB_SEEKER';
  const expired = new Date(job.deadline).getTime() < Date.now();

  return (
    <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-card transition-colors duration-150 hover:border-brand-200">
      <div className="flex items-start gap-4">
        <Link to={`/companies/${job.companyId}`}>
          <Avatar
            name={company?.name ?? ''}
            initials={company?.logo}
            color={company?.logoColor}
            photo={company?.logoUrl}
            size="lg"
            square />
          
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-ink-900">
                <Link to={`/jobs/${job.id}`} className="hover:text-brand-700">
                  {job.title}
                </Link>
              </h3>
              <Link to={`/companies/${job.companyId}`} className="text-sm text-ink-500 hover:text-brand-700">
                {company?.name}
              </Link>
            </div>
            {isSeeker &&
            <button
              type="button"
              onClick={() => toggleSaveJob(job.id)}
              aria-pressed={saved}
              aria-label={t('jobs.saveJob')}
              className={`rounded-lg p-2 transition-colors duration-150 ${
              saved ? 'text-brand-600' : 'text-ink-400 hover:bg-surface-muted hover:text-ink-700'}`
              }>
              
                <BookmarkIcon className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
              </button>
            }
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5" />
              <dd>{workMode(job) === 'REMOTE' ? t('geo.remote') : jobAddress(job)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              <dd>{job.experience}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCapIcon className="h-3.5 w-3.5" />
              <dd>{job.education}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              <dd>
                {job.positions} {t('jobs.positions')}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarClockIcon className="h-3.5 w-3.5" />
              <dd className={expired ? 'font-semibold text-red-600' : undefined}>
                {t('jobs.deadline')}: {formatDate(job.deadline)}
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-leaf-50 px-2 py-1 text-xs font-bold text-leaf-600">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-ink-700">
              {t(TYPE_KEY[job.type])}
            </span>
            {workMode(job) !== 'ON_SITE' &&
            <span className="rounded-md bg-gold-400/20 px-2 py-1 text-xs font-semibold text-ink-700">
                {workMode(job) === 'REMOTE' ? t('geo.remote') : t('geo.hybrid')}
              </span>
            }
            <JobDistance job={job} />
            <span className="text-xs text-ink-400">
              {t('jobs.posted')} {formatRelative(job.postedAt)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isSeeker ?
            <>
                <Link
                to={`/jobs/${job.id}${applied ? '' : '?apply=1'}`}
                aria-disabled={applied}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                applied ?
                'bg-leaf-50 text-leaf-600' :
                'bg-brand-600 text-white hover:bg-brand-700'}`
                }>
                
                  {applied ? t('jobs.applied') : t('jobs.applyNow')}
                </Link>
                <button
                type="button"
                onClick={() => toggleSaveJob(job.id)}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
                
                  {saved ? t('common.saved') : t('jobs.saveJob')}
                </button>
              </> :

            <Link
              to={`/jobs/${job.id}`}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
                {t('common.viewAll')}
              </Link>
            }
            <JobLocationActions job={job} />
            <Link
              to={`/companies/${job.companyId}`}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-500 transition-colors duration-150 hover:text-brand-700">
              
              {t('common.viewCompany')}
            </Link>
          </div>
        </div>
      </div>
    </article>);

}

export function JobMiniCard({ job, showBadge }: {job: Job;showBadge?: boolean;}) {
  const { t, formatSalary } = useTranslation();
  const { companyById, savedJobs, toggleSaveJob, role } = usePlatform();
  const company = companyById(job.companyId);
  const saved = savedJobs.includes(job.id);

  return (
    <div className="flex items-start gap-3">
      <Avatar
        name={company?.name ?? ''}
        initials={company?.logo}
        color={company?.logoColor}
        photo={company?.logoUrl}
        size="md"
        square />
      
      <div className="min-w-0 flex-1">
        <Link to={`/jobs/${job.id}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
          {job.title}
        </Link>
        <p className="truncate text-xs text-ink-500">{company?.name}</p>
        <p className="truncate text-xs text-ink-400">
          {job.location} · {t(TYPE_KEY[job.type])}
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold text-leaf-600">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </p>
      </div>
      {showBadge ?
      <span className="rounded-md bg-leaf-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-leaf-600">
          {t('common.new')}
        </span> :

      role === 'JOB_SEEKER' &&
      <button
        type="button"
        onClick={() => toggleSaveJob(job.id)}
        aria-pressed={saved}
        aria-label={t('jobs.saveJob')}
        className={`rounded-lg p-1.5 transition-colors duration-150 ${
        saved ? 'text-brand-600' : 'text-ink-400 hover:text-ink-700'}`
        }>
        
            <BookmarkIcon className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>

      }
    </div>);

}