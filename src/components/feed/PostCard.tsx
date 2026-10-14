import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheckIcon,
  BookmarkIcon,
  EyeIcon,
  EyeOffIcon,
  FlagIcon,
  Link2Icon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Repeat2Icon,
  Share2Icon,
  ThumbsUpIcon,
  Trash2Icon,
  UsersIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../ui/Avatar';
import { CommentThread } from './CommentThread';
import { EngagementModal, type EngagementTab } from './EngagementModal';
import type { Post } from '../../types';

export function PostCard({ post }: {post: Post;}) {
  const { t, formatRelative, formatNumber } = useTranslation();
  const {
    authorOf,
    currentUser,
    role,
    toggleLike,
    sharePost,
    toggleSavePost,
    savedPosts,
    commentsFor,
    deletePost,
    hidePost,
    addReport,
    jobById,
    posts,
    companyById
  } = usePlatform();

  const [showComments, setShowComments] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [engagement, setEngagement] = useState<EngagementTab | null>(null);
  const [copied, setCopied] = useState(false);

  const original = post.sharedFrom ? posts.find((p) => p.id === post.sharedFrom) : undefined;
  const display = original ?? post;
  const author = authorOf(display);
  const sharer = post.sharedFrom ? authorOf(post) : null;
  const liked = display.likes.includes(currentUser.id);
  const saved = savedPosts.includes(display.id);
  const comments = commentsFor(display.id);
  const job = display.jobId ? jobById(display.jobId) : undefined;
  const ownerId =
  display.authorType === 'COMPANY' ? companyById(display.authorId)?.ownerId : display.authorId;
  const isOwner = ownerId === currentUser.id;

  // A shared post whose original was removed has nothing to render.
  if (post.sharedFrom && !original) return null;
  if (display.hidden && role !== 'ADMIN' && !isOwner) return null;

  const copyLink = async () => {
    const url = `${window.location.origin}/?post=${display.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {

      /* clipboard unavailable — the confirmation still tells the user the link */}
    setCopied(true);
    setShareOpen(false);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const media = display.media[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
      {sharer &&
      <p className="flex items-center gap-2 border-b border-surface-border px-5 py-2.5 text-xs text-ink-500">
          <Repeat2Icon className="h-3.5 w-3.5" />
          <span className="font-semibold text-ink-700">{sharer.name}</span> {t('feed.sharedBy')}
        </p>
      }

      <header className="flex items-start gap-3 px-5 pt-4">
        <Link to={author.href}>
          <Avatar
            name={author.name}
            initials={author.initials}
            color={author.color}
            photo={author.photo}
            size="md"
            square={display.authorType === 'COMPANY'} />
          
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Link to={author.href} className="truncate hover:text-brand-700">
              {author.name}
            </Link>
            {author.verified && <BadgeCheckIcon className="h-4 w-4 shrink-0 text-brand-600" />}
          </p>
          <p className="truncate text-xs text-ink-500">
            {author.subtitle} · {formatRelative(display.createdAt)}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t('common.actions')}
            aria-expanded={menuOpen}
            className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
            
            <MoreHorizontalIcon className="h-5 w-5" />
          </button>
          {menuOpen &&
          <div
            role="menu"
            className="absolute right-0 z-30 mt-1 w-56 animate-fade-up overflow-hidden rounded-xl border border-surface-border bg-white py-1 shadow-pop">
            
              <button
              type="button"
              role="menuitem"
              onClick={() => {
                toggleSavePost(display.id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
              
                <BookmarkIcon className="h-4 w-4 text-ink-400" />
                {saved ? t('feed.unsavePost') : t('feed.savePost')}
              </button>
              {!isOwner &&
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                addReport('POST', display.id, `${t('nav.posts')}: ${author.name}`, t('common.reportReason'));
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
              
                  <FlagIcon className="h-4 w-4 text-ink-400" />
                  {t('common.report')}
                </button>
            }
              {role === 'ADMIN' &&
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                hidePost(display.id, !display.hidden);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
              
                  <EyeOffIcon className="h-4 w-4 text-ink-400" />
                  {display.hidden ? t('admin.restore') : t('admin.hidePost')}
                </button>
            }
              {(isOwner || role === 'ADMIN') &&
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                deletePost(post.id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              
                  <Trash2Icon className="h-4 w-4" />
                  {t('common.remove')}
                </button>
            }
            </div>
          }
        </div>
      </header>

      {display.hidden &&
      <p className="mx-5 mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          {t('admin.hiddenNotice')}
        </p>
      }

      {display.body &&
      <div className="whitespace-pre-line px-5 pb-3 pt-3 text-sm leading-relaxed text-ink-700">
          {display.body.split(/(#[\w]+)/g).map((chunk, i) =>
        chunk.startsWith('#') ?
        <span key={i} className="font-semibold text-brand-600">
                {chunk}
              </span> :

        <React.Fragment key={i}>{chunk}</React.Fragment>

        )}
        </div>
      }

      {media &&
      <div className="relative">
          {media.kind === 'VIDEO' ?
        <video src={media.url} controls className="max-h-96 w-full bg-navy-900 object-contain">
              <track kind="captions" />
            </video> :

        <img src={media.url} alt="" className="max-h-96 w-full object-cover" />
        }
          {display.mediaOverlay &&
        <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col justify-center bg-navy-800/95 p-6 sm:w-72">
              <h3 className="text-xl font-bold leading-tight text-white">{display.mediaOverlay.title}</h3>
              <p className="mt-2 text-sm text-navy-100">{display.mediaOverlay.body}</p>
              {job &&
          <Link
            to={`/jobs/${job.id}?apply=1`}
            className="mt-4 inline-flex w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
                  {t('jobs.applyNow')}
                </Link>
          }
            </div>
        }
        </div>
      }

      {display.media.length > 1 &&
      <ul className="grid grid-cols-3 gap-1 px-5 pb-2">
          {display.media.slice(1).map((m) =>
        <li key={m.url}>
              {m.kind === 'VIDEO' ?
          <video src={m.url} controls className="h-24 w-full rounded-lg bg-navy-900 object-cover" /> :

          <img src={m.url} alt="" className="h-24 w-full rounded-lg object-cover" />
          }
            </li>
        )}
        </ul>
      }

      {display.kind === 'JOB' && job && !media &&
      <div className="mx-5 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-muted p-4">
          <div>
            <p className="text-sm font-bold text-ink-900">{job.title}</p>
            <p className="text-xs text-ink-500">
              {job.location} · {job.experience}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
            to={`/jobs/${job.id}`}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:text-brand-700">
            
              {t('common.viewAll')}
            </Link>
            <Link
            to={`/jobs/${job.id}?apply=1`}
            className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
              {t('jobs.applyNow')}
            </Link>
          </div>
        </div>
      }

      <div className="flex flex-wrap items-center gap-4 px-5 py-2.5 text-xs text-ink-500">
        <button
          type="button"
          onClick={() => setEngagement('likes')}
          className="flex items-center gap-1.5 transition-colors duration-150 hover:text-brand-700">
          
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600">
            <ThumbsUpIcon className="h-3 w-3 text-white" />
          </span>
          <span className="font-semibold">
            {formatNumber(display.likes.length)} {t('feed.likes')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEngagement('comments')}
          className="flex items-center gap-1.5 transition-colors duration-150 hover:text-brand-700">
          
          <MessageCircleIcon className="h-4 w-4" />
          <span className="font-semibold">
            {formatNumber(comments.length)} {t('feed.comments')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEngagement('shares')}
          className="flex items-center gap-1.5 transition-colors duration-150 hover:text-brand-700">
          
          <Share2Icon className="h-4 w-4" />
          <span className="font-semibold">
            {formatNumber(display.shares.length)} {t('feed.shares')}
          </span>
        </button>
        {isOwner &&
        <span className="flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4" />
            {formatNumber(display.views)} {t('employer.postViews')}
          </span>
        }
      </div>

      <div className="relative flex items-center gap-1 border-t border-surface-border px-3 py-1.5">
        <button
          type="button"
          onClick={() => toggleLike(display.id)}
          aria-pressed={liked}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-150 ${
          liked ? 'text-brand-600' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
          }>
          
          <ThumbsUpIcon className="h-[18px] w-[18px]" fill={liked ? 'currentColor' : 'none'} />
          {t('common.like')}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
          <MessageCircleIcon className="h-[18px] w-[18px]" />
          {t('common.comment')}
        </button>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          aria-expanded={shareOpen}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-ink-500 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
          
          <Share2Icon className="h-[18px] w-[18px]" />
          {t('common.share')}
        </button>

        {shareOpen &&
        <div className="absolute bottom-14 right-3 z-30 w-60 animate-fade-up overflow-hidden rounded-xl border border-surface-border bg-white py-1 shadow-pop">
            <button
            type="button"
            onClick={() => {
              sharePost(display.id, true);
              setShareOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
            
              <Repeat2Icon className="h-4 w-4 text-ink-400" /> {t('feed.shareToFeed')}
            </button>
            <button
            type="button"
            onClick={() => {
              sharePost(display.id, false);
              setShareOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
            
              <UsersIcon className="h-4 w-4 text-ink-400" /> {t('feed.shareWithConnection')}
            </button>
            <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted">
            
              <Link2Icon className="h-4 w-4 text-ink-400" /> {t('common.copyLink')}
            </button>
          </div>
        }
      </div>

      <div className="border-t border-surface-border px-5 py-3">
        {!showComments && comments.length > 0 &&
        <button
          type="button"
          onClick={() => setShowComments(true)}
          className="text-xs font-semibold text-ink-500 transition-colors duration-150 hover:text-brand-700">
          
            {t('feed.viewAllComments', { count: comments.length })}
          </button>
        }
        {(showComments || comments.length === 0) && <CommentThread postId={display.id} />}
      </div>

      {copied &&
      <p role="status" className="px-5 pb-3 text-xs font-medium text-leaf-600">
          {t('common.linkCopied')}
        </p>
      }

      <EngagementModal
        post={engagement ? display : null}
        tab={engagement ?? 'likes'}
        onTabChange={(tb) => setEngagement(tb)}
        onClose={() => setEngagement(null)} />
      
    </article>);

}