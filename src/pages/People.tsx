import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { PersonRow } from '../components/people/PersonRow';

export function People() {
  const { t } = useTranslation();
  const { people, currentUser } = usePlatform();
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('ALL');

  const industries = useMemo(
    () => Array.from(new Set(people.map((p) => p.industry).filter(Boolean))) as string[],
    [people]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.
    filter((p) => p.id !== currentUser.id && p.status === 'ACTIVE').
    filter(
      (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.headline.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
    ).
    filter((p) => industry === 'ALL' || p.industry === industry);
  }, [people, query, industry, currentUser.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('network.peopleYouMayKnow')}</h1>

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 shadow-card sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full rounded-xl border border-surface-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none" />
          
        </div>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          aria-label={t('company.industry')}
          className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none">
          
          <option value="ALL">{t('common.all')}</option>
          {industries.map((ind) =>
          <option key={ind} value={ind}>
              {ind}
            </option>
          )}
        </select>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {results.map((person) =>
        <li key={person.id} className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
            <PersonRow person={person} />
          </li>
        )}
        {results.length === 0 &&
        <li className="sm:col-span-2 rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
            {t('common.noResults')}
          </li>
        }
      </ul>
    </div>);

}