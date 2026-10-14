import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { PostCard } from '../../components/feed/PostCard';

export function AdminPosts() {
  const { t } = useTranslation();
  const { posts, authorOf } = usePlatform();
  const [query, setQuery] = useState('');

  const rows = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.body.toLowerCase().includes(q) || authorOf(p).name.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.posts')}</h1>

      <div className="relative rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <SearchIcon className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          className="w-full rounded-xl border border-surface-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none" />
        
      </div>

      <p className="text-xs text-ink-400">{t('admin.moderation')}</p>

      <div className="space-y-4">
        {rows.map((post) =>
        <PostCard key={post.id} post={post} />
        )}
        {rows.length === 0 &&
        <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
            {t('common.noResults')}
          </p>
        }
      </div>
    </div>);

}