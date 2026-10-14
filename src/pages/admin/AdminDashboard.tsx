import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { StatTile } from '../../components/ui/StatTile';
import { MiniBarChart, ProgressList } from '../../components/charts/MiniBarChart';

/** Buckets rows by month for the last six months using their real timestamps. */
function monthlySeries(dates: string[]): {label: string;value: number;}[] {
  const now = new Date();
  const buckets: {label: string;key: string;value: number;}[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString('en', { month: 'short' }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      value: 0
    });
  }
  dates.forEach((iso) => {
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });
  return buckets.map(({ label, value }) => ({ label, value }));
}

export function AdminDashboard() {
  const { t, formatNumber } = useTranslation();
  const { people, companies, jobs, applications, posts, comments, reports } = usePlatform();
  const platform = usePlatform();

  const likes = posts.reduce((s, p) => s + p.likes.length, 0);
  const shares = posts.reduce((s, p) => s + p.shares.length, 0);
  const connectionCount = people.reduce((sum, p) => sum + platform.personFollowers(p.id).length, 0);
  const followsTotal =
  companies.reduce((sum, c) => sum + platform.companyFollowers(c.id).length, 0) + connectionCount;

  const tiles: {label: string;value: string | number;tone?: 'default' | 'primary';}[] = [
  { label: t('admin.totalUsers'), value: formatNumber(people.length), tone: 'primary' },
  { label: t('admin.totalJobSeekers'), value: people.filter((p) => p.role === 'JOB_SEEKER').length },
  { label: t('admin.totalEmployers'), value: people.filter((p) => p.role === 'EMPLOYER').length },
  { label: t('admin.totalCompanies'), value: companies.length },
  { label: t('employer.totalJobs'), value: jobs.length },
  { label: t('employer.activeJobs'), value: jobs.filter((j) => j.open && j.approval === 'APPROVED').length },
  { label: t('admin.totalApplications'), value: applications.length },
  { label: t('employer.totalPosts'), value: posts.length },
  { label: t('employer.totalLikes'), value: formatNumber(likes) },
  { label: t('employer.totalComments'), value: comments.length },
  { label: t('employer.totalShares'), value: shares },
  { label: t('admin.totalFollows'), value: formatNumber(followsTotal) }];


  const pendingReports = reports.filter((r) => r.state === 'PENDING').length;
  const pendingJobs = jobs.filter((j) => j.approval === 'PENDING').length;
  const pendingCompanies = companies.filter((c) => c.approval === 'PENDING').length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{t('admin.dashboard')}</h1>
          <p className="text-sm text-ink-500">{t('admin.platformActivity')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/jobs"
            className="rounded-lg border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
            {t('admin.pendingApproval')} · {pendingJobs + pendingCompanies}
          </Link>
          <Link
            to="/admin/reports"
            className="rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-600">
            
            {t('admin.pendingReports')} · {pendingReports}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) =>
        <StatTile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <MiniBarChart
          title={t('admin.platformActivity')}
          caption={t('admin.totalApplications')}
          data={monthlySeries(applications.map((a) => a.appliedAt))} />
        
        <ProgressList
          title={t('admin.usersByRole')}
          items={[
          { label: t('roles.jobSeeker'), value: people.filter((p) => p.role === 'JOB_SEEKER').length, color: '#1668e3' },
          { label: t('roles.employer'), value: people.filter((p) => p.role === 'EMPLOYER').length, color: '#1f9d55' },
          { label: t('roles.admin'), value: people.filter((p) => p.role === 'ADMIN').length, color: '#0c2c51' }]
          } />
        
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <MiniBarChart
          title={t('employer.totalPosts')}
          data={monthlySeries(posts.map((p) => p.createdAt))}
          color="#1f9d55" />
        
        <MiniBarChart
          title={t('employer.totalJobs')}
          data={monthlySeries(jobs.map((j) => j.postedAt))}
          color="#eeb821" />
        
      </div>
    </div>);

}