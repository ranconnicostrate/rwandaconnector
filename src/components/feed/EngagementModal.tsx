import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../ui/Modal';
import { PersonRow } from '../people/PersonRow';
import { Avatar } from '../ui/Avatar';
import type { Post } from '../../types';

export type EngagementTab = 'likes' | 'comments' | 'shares';

interface Props {
  post: Post | null;
  tab: EngagementTab;
  onTabChange: (tab: EngagementTab) => void;
  onClose: () => void;
}

const PAGE = 6;

export function EngagementModal({ post, tab, onTabChange, onClose }: Props) {
  const { t, formatRelative } = useTranslation();
  const { personById, commentsFor } = usePlatform();
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);

  const comments = post ? commentsFor(post.id) : [];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source =
    !post ?
    [] :
    tab === 'comments' ?
    comments.map((c) => ({ person: personById(c.authorId), comment: c })) :
    (tab === 'likes' ? post.likes : post.shares).map((id) => ({
      person: personById(id),
      comment: undefined
    }));
    return source.
    filter((row): row is {person: NonNullable<typeof row.person>;comment: typeof row.comment;} =>
    Boolean(row.person)
    ).
    filter(
      (row) =>
      !q ||
      row.person.name.toLowerCase().includes(q) ||
      row.person.headline.toLowerCase().includes(q)
    );
  }, [post, tab, comments, personById, query]);

  const titles: Record<EngagementTab, string> = {
    likes: t('feed.peopleWhoLiked'),
    comments: t('feed.peopleWhoCommented'),
    shares: t('feed.peopleWhoShared')
  };

  const tabs: {key: EngagementTab;label: string;count: number;}[] = [
  { key: 'likes', label: t('feed.likes'), count: post?.likes.length ?? 0 },
  { key: 'comments', label: t('feed.comments'), count: comments.length },
  { key: 'shares', label: t('feed.shares'), count: post?.shares.length ?? 0 }];


  return (
    <Modal open={Boolean(post)} onClose={onClose} title={titles[tab]}>
      <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
        {tabs.map((tb) =>
        <button
          key={tb.key}
          type="button"
          onClick={() => {
            onTabChange(tb.key);
            setShown(PAGE);
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
          tab === tb.key ? 'bg-white text-navy-800 shadow-sm' : 'text-ink-500 hover:text-ink-900'}`
          }>
          
            {tb.label} · {tb.count}
          </button>
        )}
      </div>

      <div className="relative mt-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          className="w-full rounded-lg border border-surface-border py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none" />
        
      </div>

      <ul className="mt-4 space-y-4">
        {rows.slice(0, shown).map((row, i) =>
        <li key={`${row.person.id}-${i}`}>
            {row.comment ?
          <div className="flex items-start gap-3">
                <Avatar name={row.person.name} color={row.person.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{row.person.name}</p>
                  <p className="text-xs text-ink-500">
                    {row.person.headline} · {row.person.location}
                  </p>
                  <p className="mt-1 rounded-xl rounded-tl-sm bg-surface-muted px-3 py-2 text-sm text-ink-700">
                    {row.comment.body}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">{formatRelative(row.comment.createdAt)}</p>
                </div>
              </div> :

          <PersonRow person={row.person} />
          }
          </li>
        )}
        {rows.length === 0 && <li className="py-6 text-center text-sm text-ink-400">{t('common.noResults')}</li>}
      </ul>

      {shown < rows.length &&
      <button
        type="button"
        onClick={() => setShown((s) => s + PAGE)}
        className="mt-4 w-full rounded-lg border border-surface-border py-2 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
        
          {t('common.loadMore')}
        </button>
      }
    </Modal>);

}