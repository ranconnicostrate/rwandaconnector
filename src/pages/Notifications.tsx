import React from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  FileCheck2Icon,
  FileTextIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  Share2Icon,
  ShieldIcon,
  ThumbsUpIcon,
  UserPlusIcon,
  UsersIcon } from
'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import type { NotificationKind } from '../types';

const ICONS: Record<NotificationKind, typeof ThumbsUpIcon> = {
  connectionRequest: UserPlusIcon,
  connectionAccepted: UsersIcon,
  newFollower: UserPlusIcon,
  liked: ThumbsUpIcon,
  commented: MessageCircleIcon,
  shared: Share2Icon,
  message: MessageSquareIcon,
  application: FileTextIcon,
  statusChange: FileCheck2Icon,
  newJob: BriefcaseIcon,
  adminAction: ShieldIcon
};

const LINKS: Partial<Record<NotificationKind, string>> = {
  connectionRequest: '/network',
  connectionAccepted: '/network',
  newFollower: '/network',
  message: '/messages',
  statusChange: '/applications',
  application: '/employer/applicants'
};

export function Notifications() {
  const { t, formatRelative } = useTranslation();
  const { notifications, personById, markAllNotificationsRead } = usePlatform();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900">{t('notifications.title')}</h1>
        {notifications.some((n) => !n.read) &&
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="text-sm font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700">
          
            {t('notifications.markAllRead')}
          </button>
        }
      </header>

      <ul className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        {notifications.map((n) => {
          const actor = personById(n.actorId);
          const Icon = ICONS[n.kind];
          const message = t(`notifications.${n.kind}`, {
            name: actor?.name ?? '',
            status: n.meta?.statusKey ? t(n.meta.statusKey) : ''
          });
          const href = n.meta?.jobId ? `/jobs/${n.meta.jobId}` : LINKS[n.kind];
          const body =
          <>
              <Avatar name={actor?.name ?? ''} color={actor?.avatar} photo={actor?.photo} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-700">{message}</p>
                <p className="mt-0.5 text-xs text-ink-400">{formatRelative(n.createdAt)}</p>
              </div>
              <span className="rounded-lg bg-surface-muted p-2 text-ink-500" aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
            </>;

          return (
            <li
              key={n.id}
              className={`border-b border-surface-border last:border-b-0 ${n.read ? '' : 'bg-brand-50/60'}`}>
              
              {href ?
              <Link
                to={href}
                className="flex items-start gap-3 px-5 py-4 transition-colors duration-150 hover:bg-surface-muted">
                
                  {body}
                </Link> :

              <div className="flex items-start gap-3 px-5 py-4">{body}</div>
              }
            </li>);

        })}
        {notifications.length === 0 &&
        <li className="p-10 text-center text-sm text-ink-400">{t('notifications.empty')}</li>
        }
      </ul>
    </div>);

}