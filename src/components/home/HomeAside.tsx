import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { PersonRow } from '../people/PersonRow';
import { JobMiniCard } from '../jobs/JobCard';
import { visibleJobs } from '../../utils/jobs';

function RailCard({ title, to, children }: {title: string;to: string;children: React.ReactNode;}) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
        <Link
          to={to}
          className="text-xs font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700">
          
          {t('common.seeAll')}
        </Link>
      </div>
      {children}
    </section>);

}

export function HomeAside() {
  const { t } = useTranslation();
  const { people, jobs, companyById, connectionState, currentUser, savedJobs } = usePlatform();

  /** Suggested by shared skills, industry, location or university. */
  const suggestions = people.
  filter(
    (p) =>
    p.id !== currentUser.id &&
    p.role !== 'ADMIN' &&
    p.status === 'ACTIVE' &&
    connectionState(p.id) === 'NONE'
  ).
  map((p) => {
    const sharedSkills = p.skills.filter((s) => currentUser.skills.includes(s)).length;
    const score =
    sharedSkills * 3 + (
    p.industry && p.industry === currentUser.industry ? 2 : 0) + (
    p.location === currentUser.location ? 1 : 0) + (
    p.university && p.university === currentUser.university ? 1 : 0);
    return { person: p, score };
  }).
  sort((a, b) => b.score - a.score).
  slice(0, 4).
  map((s) => s.person);

  const openJobs = visibleJobs(jobs, companyById).filter((j) => !savedJobs.includes(j.id));
  const matched = openJobs.filter((j) => j.skills.some((s) => currentUser.skills.includes(s)));
  const recommended = Array.from(new Set([...matched, ...openJobs])).slice(0, 3);

  return (
    <div className="space-y-5">
      <RailCard title={t('network.suggested')} to="/people">
        <ul className="space-y-4">
          {suggestions.map((person) =>
          <li key={person.id}>
              <PersonRow person={person} compact />
            </li>
          )}
          {suggestions.length === 0 &&
          <li className="py-3 text-center text-xs text-ink-400">{t('common.noResults')}</li>
          }
        </ul>
      </RailCard>

      <RailCard title={t('jobs.recommended')} to="/jobs">
        <ul className="space-y-4">
          {recommended.map((job) =>
          <li key={job.id}>
              <JobMiniCard job={job} />
            </li>
          )}
          {recommended.length === 0 &&
          <li className="py-3 text-center text-xs text-ink-400">{t('common.noResults')}</li>
          }
        </ul>
      </RailCard>
    </div>);

}