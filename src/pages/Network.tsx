import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { PersonRow } from '../components/people/PersonRow';
import { Avatar } from '../components/ui/Avatar';

type Tab = 'invitations' | 'connections' | 'followers' | 'following';

export function Network() {
  const { t } = useTranslation();
  const {
    people,
    connections,
    acceptConnection,
    removeConnection,
    followedPeople,
    toggleFollowPerson,
    currentUser
  } = usePlatform();
  const [tab, setTab] = useState<Tab>('invitations');

  const byState = (state: string) =>
  people.filter((p) => p.id !== currentUser.id && connections[p.id] === state);

  const invitations = byState('INCOMING');
  const connected = byState('CONNECTED');
  const following = people.filter((p) => followedPeople.includes(p.id));
  const followers = people.filter(
    (p) => p.id !== currentUser.id && p.role === 'JOB_SEEKER' && !followedPeople.includes(p.id)
  );

  const tabs: {key: Tab;label: string;count: number;}[] = [
  { key: 'invitations', label: t('network.invitations'), count: invitations.length },
  { key: 'connections', label: t('network.connections'), count: connected.length },
  { key: 'followers', label: t('network.followers'), count: followers.length },
  { key: 'following', label: t('network.following'), count: following.length }];


  const list =
  tab === 'invitations' ? invitations : tab === 'connections' ? connected : tab === 'followers' ? followers : following;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('network.title')}</h1>

      <div role="tablist" className="flex flex-wrap gap-2 rounded-2xl border border-surface-border bg-white p-2 shadow-card">
        {tabs.map((tb) =>
        <button
          key={tb.key}
          role="tab"
          aria-selected={tab === tb.key}
          type="button"
          onClick={() => setTab(tb.key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
          tab === tb.key ? 'bg-navy-700 text-white' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
          }>
          
            {tb.label} · {tb.count}
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {list.map((person) =>
        <li key={person.id} className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
            {tab === 'invitations' ?
          <div className="flex items-center gap-3">
                <Avatar name={person.name} color={person.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{person.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {person.headline} · {person.location}
                  </p>
                </div>
                <button
              type="button"
              onClick={() => removeConnection(person.id)}
              className="rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
              
                  {t('common.reject')}
                </button>
                <button
              type="button"
              onClick={() => acceptConnection(person.id)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
                  {t('common.accept')}
                </button>
              </div> :
          tab === 'following' || tab === 'followers' ?
          <div className="flex items-center gap-3">
                <Avatar name={person.name} color={person.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{person.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {person.headline} · {person.location}
                  </p>
                </div>
                <button
              type="button"
              onClick={() => toggleFollowPerson(person.id)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors duration-150 ${
              followedPeople.includes(person.id) ?
              'border border-surface-border text-ink-700 hover:border-red-200 hover:text-red-600' :
              'bg-brand-600 text-white hover:bg-brand-700'}`
              }>
              
                  {followedPeople.includes(person.id) ? t('common.following') : t('common.follow')}
                </button>
              </div> :

          <PersonRow person={person} />
          }
          </li>
        )}
        {list.length === 0 &&
        <li className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
            {t('common.noResults')}
          </li>
        }
      </ul>
    </div>);

}