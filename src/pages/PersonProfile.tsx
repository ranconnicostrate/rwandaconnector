import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, ClockIcon, MapPinIcon, MessageSquareIcon, UserPlusIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { PostCard } from '../components/feed/PostCard';

export function PersonProfile() {
  const { personId = '' } = useParams();
  const navigate = useNavigate();
  const { t, formatNumber } = useTranslation();
  const {
    personById,
    currentUser,
    posts,
    connectionState,
    requestConnection,
    acceptConnection,
    removeConnection,
    followedPeople,
    toggleFollowPerson,
    personFollowers,
    openConversation,
    connectedIds
  } = usePlatform();

  const person = personById(personId);

  if (!person) {
    return (
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
        {t('common.noResults')}
      </p>);

  }

  if (person.id === currentUser.id) return <Link to="/profile" className="sr-only">{t('nav.myProfile')}</Link>;

  const state = connectionState(person.id);
  const following = followedPeople.includes(person.id);
  const theirPosts = posts.filter((p) => p.authorType === 'PERSON' && p.authorId === person.id);
  const mutual = connectedIds.filter((id) => id !== person.id).length;

  const connectLabel =
  state === 'CONNECTED' ?
  t('common.connected') :
  state === 'PENDING' ?
  t('common.pending') :
  state === 'INCOMING' ?
  t('common.accept') :
  t('common.connect');

  const onConnect = () => {
    if (state === 'NONE') requestConnection(person.id);else
    if (state === 'INCOMING') acceptConnection(person.id);else
    if (state === 'CONNECTED') removeConnection(person.id);
  };

  const message = () => {
    const id = openConversation(person.id);
    if (id) navigate('/messages');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        <div className="h-24 bg-navy-700" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
          <div className="-mt-10">
            <span className="inline-block rounded-full ring-4 ring-white">
              <Avatar name={person.name} color={person.avatar} photo={person.photo} size="xl" />
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-2">
            <h1 className="text-2xl font-extrabold text-ink-900">{person.name}</h1>
            <p className="text-sm text-ink-700">{person.headline}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" /> {person.location}
              </span>
              <span>
                {formatNumber(personFollowers(person.id).length)} {t('network.followers')}
              </span>
              {mutual > 0 && <span>{t('network.mutual', { count: mutual })}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            <button
              type="button"
              onClick={onConnect}
              disabled={state === 'PENDING'}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
              state === 'CONNECTED' ?
              'border border-surface-border text-ink-700 hover:border-red-200 hover:text-red-600' :
              state === 'PENDING' ?
              'border border-surface-border text-ink-400' :
              'bg-brand-600 text-white hover:bg-brand-700'}`
              }>
              
              {state === 'CONNECTED' ?
              <CheckIcon className="h-4 w-4" /> :
              state === 'PENDING' ?
              <ClockIcon className="h-4 w-4" /> :

              <UserPlusIcon className="h-4 w-4" />
              }
              {connectLabel}
            </button>
            <button
              type="button"
              onClick={() => toggleFollowPerson(person.id)}
              className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
              
              {following ? t('common.following') : t('common.follow')}
            </button>
            <button
              type="button"
              onClick={message}
              className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
              
              <MessageSquareIcon className="h-4 w-4" /> {t('messages.send')}
            </button>
          </div>
        </div>
      </header>

      {person.about &&
      <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-400">{t('profile.about')}</h2>
          <p className="text-sm leading-relaxed text-ink-700">{person.about}</p>
        </section>
      }

      {person.skills.length > 0 &&
      <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">{t('profile.skills')}</h2>
          <ul className="flex flex-wrap gap-2">
            {person.skills.map((skill) =>
          <li key={skill} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {skill}
              </li>
          )}
          </ul>
        </section>
      }

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">{t('profile.activity')}</h2>
        <div className="space-y-4">
          {theirPosts.map((post) =>
          <PostCard key={post.id} post={post} />
          )}
          {theirPosts.length === 0 &&
          <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
              {t('feed.emptyFeed')}
            </p>
          }
        </div>
      </section>
    </div>);

}