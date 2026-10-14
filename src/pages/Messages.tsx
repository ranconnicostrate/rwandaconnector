import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, SendIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';

export function Messages() {
  const { t, formatRelative } = useTranslation();
  const {
    conversations,
    messages,
    personById,
    currentUser,
    sendMessage,
    markConversationRead,
    unreadIn
  } = usePlatform();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const otherOf = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    const otherId = conv?.participantIds.find((p) => p !== currentUser.id);
    return otherId ? personById(otherId) : undefined;
  };

  const thread = useMemo(
    () =>
    messages.
    filter((m) => m.conversationId === activeId).
    sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [messages, activeId]
  );

  useEffect(() => {
    if (activeId) markConversationRead(activeId);
  }, [activeId, thread.length, markConversationRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.length]);

  const filtered = conversations.filter((c) => {
    const person = otherOf(c.id);
    return !query || person?.name.toLowerCase().includes(query.toLowerCase());
  });

  const activePerson = activeId ? otherOf(activeId) : undefined;

  if (conversations.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-surface-border bg-white p-10 text-center shadow-card">
        <h1 className="text-lg font-bold text-ink-900">{t('messages.title')}</h1>
        <p className="mt-2 text-sm text-ink-500">{t('messages.noConversations')}</p>
        <Link
          to="/people"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
          
          {t('network.findPeople')}
        </Link>
      </div>);

  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card md:grid-cols-[280px_minmax(0,1fr)] md:gap-0">
      <aside className="border-surface-border md:border-r">
        <div className="border-b border-surface-border p-3">
          <h1 className="mb-3 px-1 text-base font-bold text-ink-900">{t('messages.title')}</h1>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('messages.searchConversations')}
              aria-label={t('messages.searchConversations')}
              className="w-full rounded-lg border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:bg-white focus:outline-none" />
            
          </div>
        </div>
        <ul className="max-h-[520px] overflow-y-auto scrollbar-thin">
          {filtered.map((conv) => {
            const person = otherOf(conv.id);
            const last = messages.
            filter((m) => m.conversationId === conv.id).
            sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)).
            slice(-1)[0];
            const unread = unreadIn(conv.id);
            return (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(conv.id)}
                  className={`flex w-full items-start gap-3 border-b border-surface-border px-3 py-3 text-left transition-colors duration-150 ${
                  activeId === conv.id ? 'bg-brand-50' : 'hover:bg-surface-muted'}`
                  }>
                  
                  <Avatar name={person?.name ?? ''} color={person?.avatar} photo={person?.photo} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{person?.name}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {last?.body ?? t('messages.empty')}
                    </span>
                  </span>
                  {unread > 0 &&
                  <span className="mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                      {unread}
                    </span>
                  }
                </button>
              </li>);

          })}
          {filtered.length === 0 &&
          <li className="p-6 text-center text-sm text-ink-400">{t('common.noResults')}</li>
          }
        </ul>
      </aside>

      <section className="flex min-h-[520px] flex-col">
        {activePerson ?
        <>
            <header className="flex items-center gap-3 border-b border-surface-border px-5 py-3">
              <Avatar name={activePerson.name} color={activePerson.avatar} photo={activePerson.photo} size="sm" />
              <div className="min-w-0">
                <Link
                to={`/people/${activePerson.id}`}
                className="block truncate text-sm font-bold text-ink-900 hover:text-brand-700">
                
                  {activePerson.name}
                </Link>
                <p className="truncate text-xs text-ink-500">{activePerson.headline}</p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-5">
              {thread.map((m) => {
              const mine = m.senderId === currentUser.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    mine ?
                    'rounded-br-sm bg-brand-600 text-white' :
                    'rounded-bl-sm bg-surface-muted text-ink-700'}`
                    }>
                    
                      <p>{m.body}</p>
                      <p className={`mt-1 text-[11px] ${mine ? 'text-brand-100' : 'text-ink-400'}`}>
                        {formatRelative(m.createdAt)}
                      </p>
                    </div>
                  </div>);

            })}
              {thread.length === 0 &&
            <p className="py-10 text-center text-sm text-ink-400">{t('messages.startThread')}</p>
            }
              <div ref={endRef} />
            </div>

            <form
            className="flex items-center gap-2 border-t border-surface-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              sendMessage(activeId, draft);
              setDraft('');
            }}>
            
              <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('messages.typeMessage')}
              aria-label={t('messages.typeMessage')}
              className="flex-1 rounded-full border border-surface-border px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none" />
            
              <button
              type="submit"
              disabled={!draft.trim()}
              aria-label={t('messages.send')}
              className="rounded-full bg-brand-600 p-2.5 text-white transition-colors duration-150 hover:bg-brand-700 disabled:bg-brand-200">
              
                <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </> :

        <p className="m-auto text-sm text-ink-400">{t('messages.empty')}</p>
        }
      </section>
    </div>);

}