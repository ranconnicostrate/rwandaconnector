import React from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  Share2Icon,
  ThumbsUpIcon,
  UserCheckIcon,
  UsersIcon,
  XCircleIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressList } from '../../components/charts/MiniBarChart';
import { Avatar } from '../../components/ui/Avatar';
import { ApplicantsByJob } from '../../components/employer/ApplicantsByJob';
import { ALL_STATUSES, STATUS_KEY, STATUS_TONE } from '../../utils/status';

export function EmployerDashboard() {
  const { t, formatNumber, formatDate } = useTranslation();
  const {
    jobs,
    applications,
    currentUser,
    companyById,
    personById,
    posts,
    commentsFor,
    companyFollowers
  } = usePlatform();

  const company = companyById(currentUser.companyId ?? '');
  const myJobs = jobs.filter((j) => j.ownerId === currentUser.id);
  const myJobIds = myJobs.map((j) => j.id);
  const myApps = applications.filter((a) => myJobIds.includes(a.jobId));
  const companyPosts = posts.filter((p) => p.authorType === 'COMPANY' && p.authorId === company?.id);

  const likes = companyPosts.reduce((s, p) => s + p.likes.length, 0);
  const shares = companyPosts.reduce((s, p) => s + p.shares.length, 0);
  const commentCount = companyPosts.reduce((s, p) => s + commentsFor(p.id).length, 0);

  const count = (status: string) => myApps.filter((a) => a.status === status).length;
  const recent = [...myApps].
  sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt)).
  slice(0, 5);

  const tiles: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    tone?: 'default' | 'primary';
  }[] = [
  { label: t('employer.totalJobs'), value: myJobs.length, icon: <BriefcaseIcon className="h-4 w-4" />, tone: 'primary' as const },
  { label: t('employer.activeJobs'), value: myJobs.filter((j) => j.open).length, icon: <CheckCircle2Icon className="h-4 w-4" /> },
  { label: t('employer.closedJobs'), value: myJobs.filter((j) => !j.open).length, icon: <XCircleIcon className="h-4 w-4" /> },
  { label: t('employer.totalApplicants'), value: myApps.length, icon: <UsersIcon className="h-4 w-4" /> },
  { label: t('employer.shortlisted'), value: count('SHORTLISTED'), icon: <UserCheckIcon className="h-4 w-4" /> },
  { label: t('employer.interviews'), value: count('INTERVIEW'), icon: <UsersIcon className="h-4 w-4" /> },
  { label: t('employer.hired'), value: count('HIRED'), icon: <CheckCircle2Icon className="h-4 w-4" /> },
  {
    label: t('employer.companyFollowers'),
    value: formatNumber(company ? companyFollowers(company.id).length : 0),
    icon: <UsersIcon className="h-4 w-4" />
  },
  { label: t('employer.totalLikes'), value: likes, icon: <ThumbsUpIcon className="h-4 w-4" /> },
  { label: t('employer.totalComments'), value: commentCount, icon: <MessageCircleIcon className="h-4 w-4" /> },
  { label: t('employer.totalShares'), value: shares, icon: <Share2Icon className="h-4 w-4" /> },
  { label: t('employer.totalPosts'), value: companyPosts.length, icon: <BriefcaseIcon className="h-4 w-4" /> }];


  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{t('employer.dashboard')}</h1>
          <p className="text-sm text-ink-500">{company?.name}</p>
        </div>
        <Link
          to="/employer/jobs"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
          
          {t('employer.createJob')}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) =>
        <StatTile key={tile.label} label={tile.label} value={tile.value} icon={tile.icon} tone={tile.tone} />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ApplicantsByJob />

        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
            <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
              <h2 className="text-sm font-bold text-ink-900">{t('employer.recentApplicants')}</h2>
              <Link
                to="/employer/applicants"
                className="text-xs font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700">
                
                {t('common.seeAll')}
              </Link>
            </header>
            <ul>
              {recent.map((app) => {
                const person = personById(app.applicantId);
                const job = jobs.find((j) => j.id === app.jobId);
                return (
                  <li key={app.id} className="border-b border-surface-border last:border-b-0">
                    <Link
                      to={`/employer/applicants?job=${app.jobId}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-muted">
                      
                      <Avatar name={app.fullName} color={person?.avatar} photo={person?.photo} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">{app.fullName}</span>
                        <span className="block truncate text-xs text-ink-500">{job?.title}</span>
                        <span className="block truncate text-[11px] text-ink-400">
                          {formatDate(app.appliedAt)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[app.status]}`}>
                        
                        {t(STATUS_KEY[app.status])}
                      </span>
                    </Link>
                  </li>);

              })}
              {recent.length === 0 &&
              <li className="p-8 text-center text-sm text-ink-400">{t('employer.noApplicantsYet')}</li>
              }
            </ul>
          </section>

          <ProgressList
            title={t('employer.pipeline')}
            items={ALL_STATUSES.map((s, i) => ({
              label: t(STATUS_KEY[s]),
              value: count(s),
              color: ['#8a94a6', '#2f7fee', '#7c3aed', '#eeb821', '#1f9d55', '#ef4444'][i]
            }))} />
          
        </div>
      </div>
    </div>);

}