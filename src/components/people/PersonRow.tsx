import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, ClockIcon, UserPlusIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../ui/Avatar';
import type { Person } from '../../types';

interface PersonRowProps {
  person: Person;
  compact?: boolean;
  showLocation?: boolean;
}

export function PersonRow({ person, compact = false, showLocation = true }: PersonRowProps) {
  const { t } = useTranslation();
  const { connectionState, requestConnection, acceptConnection, removeConnection, connectedIds } =
  usePlatform();
  const state = connectionState(person.id);

  const action = () => {
    if (state === 'NONE') requestConnection(person.id);else
    if (state === 'INCOMING') acceptConnection(person.id);else
    if (state === 'CONNECTED') removeConnection(person.id);
  };

  const label =
  state === 'CONNECTED' ?
  t('common.connected') :
  state === 'PENDING' ?
  t('common.pending') :
  state === 'INCOMING' ?
  t('common.accept') :
  t('common.connect');

  const mutual = state === 'NONE' ? connectedIds.filter((id) => id !== person.id).length : 0;

  return (
    <div className="flex items-start gap-3">
      <Link to={`/people/${person.id}`}>
        <Avatar
          name={person.name}
          color={person.avatar}
          photo={person.photo}
          size={compact ? 'sm' : 'md'} />
        
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/people/${person.id}`}
          className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
          
          {person.name}
        </Link>
        <p className="truncate text-xs text-ink-500">{person.headline}</p>
        {showLocation && <p className="truncate text-xs text-ink-400">{person.location}</p>}
        {mutual > 0 &&
        <p className="mt-0.5 truncate text-[11px] text-ink-400">{t('network.mutual', { count: mutual })}</p>
        }
      </div>
      <button
        type="button"
        onClick={action}
        disabled={state === 'PENDING'}
        className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
        state === 'CONNECTED' ?
        'border border-surface-border text-ink-500 hover:border-red-200 hover:text-red-600' :
        state === 'PENDING' ?
        'border border-surface-border text-ink-400' :
        'bg-brand-600 text-white hover:bg-brand-700'}`
        }>
        
        {state === 'CONNECTED' ?
        <CheckIcon className="h-3.5 w-3.5" /> :
        state === 'PENDING' ?
        <ClockIcon className="h-3.5 w-3.5" /> :

        <UserPlusIcon className="h-3.5 w-3.5" />
        }
        {label}
      </button>
    </div>);

}