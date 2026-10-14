import React from 'react';
import { EyeIcon, MessageCircleIcon, Share2Icon, ThumbsUpIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { StatTile } from '../../components/ui/StatTile';
import { MiniBarChart } from '../../components/charts/MiniBarChart';

export function EmployerAnalytics() {
  const { t, formatNumber, formatRelative } = useTranslation();
  const { posts, currentUser, companyById, commentsFor, companyFollowers } = usePlatform();
  const company = companyById(currentUser.companyId ?? '');
  const companyPosts = posts.filter((p) => p.authorType === 'COMPANY' && p.authorId === company?.id);

  const likes = companyPosts.reduce((s, p) => s + p.likes.length, 0);
  const shares = companyPosts.reduce((s, p) => s + p.shares.length, 0);
  const comments = companyPosts.reduce((s, p) => s + commentsFor(p.id).length, 0);
  const views = companyPosts.reduce((s, p) => s + p.views, 0);
  const engagement = views ? Math.round((likes + shares + comments) / views * 1000) / 10 : 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">{t('nav.analytics')}</h1>
        <p className="text-sm text-ink-500">{company?.name}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile
          label={t('employer.postViews')}
          value={formatNumber(views)}
          icon={<EyeIcon className="h-4 w-4" />}
          tone="primary"
          hint={t('employer.engagement') + `: ${engagement}%`} />
        
        <StatTile label={t('employer.totalLikes')} value={formatNumber(likes)} icon={<ThumbsUpIcon className="h-4 w-4" />} />
        <StatTile
          label={t('employer.totalComments')}
          value={formatNumber(comments)}
          icon={<MessageCircleIcon className="h-4 w-4" />} />
        
        <StatTile label={t('employer.totalShares')} value={formatNumber(shares)} icon={<Share2Icon className="h-4 w-4" />} />
        <StatTile
          label={t('employer.companyFollowers')}
          value={formatNumber(company ? companyFollowers(company.id).length : 0)}
          icon={<UsersIcon className="h-4 w-4" />} />
        
        <StatTile label={t('employer.totalPosts')} value={companyPosts.length} />
      </div>

      <MiniBarChart
        title={t('employer.postPerformance')}
        caption={t('employer.engagement')}
        data={companyPosts.map((p, i) => ({
          label: `#${i + 1}`,
          value: p.likes.length + p.shares.length + commentsFor(p.id).length
        }))} />
      

      <section className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        <h2 className="border-b border-surface-border px-5 py-4 text-sm font-bold text-ink-900">
          {t('company.posts')}
        </h2>
        <ul>
          {companyPosts.map((p) =>
          <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-surface-border px-5 py-4 last:border-b-0">
              <p className="min-w-0 flex-1 truncate text-sm text-ink-700">{p.body}</p>
              <span className="text-xs text-ink-400">{formatRelative(p.createdAt)}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <ThumbsUpIcon className="h-3.5 w-3.5 text-brand-600" /> {p.likes.length}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <MessageCircleIcon className="h-3.5 w-3.5 text-brand-600" /> {commentsFor(p.id).length}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <Share2Icon className="h-3.5 w-3.5 text-brand-600" /> {p.shares.length}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <EyeIcon className="h-3.5 w-3.5 text-ink-400" /> {formatNumber(p.views)}
              </span>
            </li>
          )}
          {companyPosts.length === 0 && <li className="p-8 text-center text-sm text-ink-400">{t('feed.emptyFeed')}</li>}
        </ul>
      </section>
    </div>);

}