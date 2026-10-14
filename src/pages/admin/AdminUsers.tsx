import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../../components/ui/Avatar';
import type { Role } from '../../types';

export function AdminUsers() {
  const { t } = useTranslation();
  const { people, setUserStatus } = usePlatform();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');

  const rows = people.
  filter((p) => role === 'ALL' || p.role === role).
  filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.users')}</h1>

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
          value={role}
          onChange={(e) => setRole(e.target.value as Role | 'ALL')}
          aria-label={t('roles.switchRole')}
          className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none">
          
          <option value="ALL">{t('common.all')}</option>
          <option value="JOB_SEEKER">{t('roles.jobSeeker')}</option>
          <option value="EMPLOYER">{t('roles.employer')}</option>
          <option value="ADMIN">{t('roles.admin')}</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('common.name')}</th>
              <th className="px-5 py-3 font-semibold">{t('roles.switchRole')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.location')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.status')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person) =>
            <tr key={person.id} className="border-b border-surface-border last:border-b-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={person.name} color={person.avatar} size="sm" />
                    <div>
                      <p className="font-semibold text-ink-900">{person.name}</p>
                      <p className="text-xs text-ink-400">{person.headline}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-700">
                  {person.role === 'JOB_SEEKER' ?
                t('roles.jobSeeker') :
                person.role === 'EMPLOYER' ?
                t('roles.employer') :
                t('roles.admin')}
                </td>
                <td className="px-5 py-3 text-ink-500">{person.location}</td>
                <td className="px-5 py-3">
                  <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  person.status === 'ACTIVE' ? 'bg-leaf-50 text-leaf-600' : 'bg-red-50 text-red-600'}`
                  }>
                  
                    {person.status === 'ACTIVE' ? t('admin.active') : t('admin.suspended')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                  type="button"
                  disabled={person.role === 'ADMIN'}
                  onClick={() => setUserStatus(person.id, person.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                  className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700 disabled:opacity-40">
                  
                    {person.status === 'ACTIVE' ? t('admin.suspend') : t('admin.activate')}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}