import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ClockIcon,
  FileTextIcon,
  FlameIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { JobMiniCard } from '../jobs/JobCard';
import { IMAGES, trendingTopics } from '../../data/posts';
import { visibleJobs } from '../../utils/jobs';
import { AdCarousel } from '../ads/AdCarousel';

export function RightRail() {
  const { t, formatNumber } = useTranslation();
  const { connections, posts, currentUser, unreadMessages, jobs, companyById } = usePlatform();

  const connected = Object.values(connections).filter((s) => s === 'CONNECTED').length;
  const incoming = Object.values(connections).filter((s) => s === 'INCOMING').length;
  const myCompanyId = currentUser.companyId;
  const myPosts = posts.filter(
    (p) => p.authorId === currentUser.id || myCompanyId && p.authorId === myCompanyId
  ).length;

  const stats = [
  { icon: UsersIcon, value: connected, label: t('stats.myConnections'), tone: 'bg-brand-50 text-brand-600', to: '/network' },
  { icon: ClockIcon, value: incoming, label: t('stats.pendingRequests'), tone: 'bg-amber-50 text-amber-600', to: '/network' },
  { icon: FileTextIcon, value: myPosts, label: t('stats.myPosts'), tone: 'bg-leaf-50 text-leaf-600', to: '/profile' },
  { icon: MessageSquareIcon, value: unreadMessages, label: t('stats.messages'), tone: 'bg-violet-50 text-violet-600', to: '/messages' }];


  const latest = visibleJobs(jobs, companyById).slice(0, 4);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-ink-900">{t('stats.quickStats')}</h2>
        <ul className="space-y-3">
          {stats.map((s) =>
          <li key={s.label}>
              <Link
              to={s.to}
              className="flex items-center gap-3 rounded-xl p-1 transition-colors duration-150 hover:bg-surface-muted">
              
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold leading-none tabular-nums text-ink-900">
                    {formatNumber(s.value)}
                  </span>
                  <span className="block text-xs text-ink-500">{s.label}</span>
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>

      <AdCarousel layout="card" startIndex={1} />

      <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <FlameIcon className="h-4 w-4 text-orange-500" />
            {t('jobs.trending')}
          </h2>
          <Link to="/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            {t('common.seeAll')}
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) =>
          <li key={topic}>
              <Link
              to={`/jobs?q=${encodeURIComponent(topic.replace('#', ''))}`}
              className="inline-block rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors duration-150 hover:bg-brand-100">
              
                {topic}
              </Link>
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <TrendingUpIcon className="h-4 w-4 text-brand-600" />
            {t('jobs.latest')}
          </h2>
          <Link to="/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            {t('common.seeAll')}
          </Link>
        </div>
        <ul className="space-y-4">
          {latest.map((job) =>
          <li key={job.id}>
              <JobMiniCard job={job} showBadge />
            </li>
          )}
          {latest.length === 0 && <li className="py-4 text-center text-xs text-ink-400">{t('common.noResults')}</li>}
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-navy-800 p-5">
        <img
          src={IMAGES.network}
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 left-0 h-full w-1/2 object-cover opacity-70" />
        
        <div className="relative ml-auto w-2/3">
          <h2 className="text-base font-bold leading-snug text-white">{t('network.growNetwork')}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-navy-100">{t('network.growBody')}</p>
          <Link
            to="/people"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            {t('network.findPeople')} <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>);

}