import React, { useState } from 'react';
import { PencilIcon, ThumbsUpIcon, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../ui/Avatar';
import type { Comment } from '../../types';

function CommentItem({ comment, depth = 0 }: {comment: Comment;depth?: number;}) {
  const { t, formatRelative } = useTranslation();
  const {
    personById,
    currentUser,
    role,
    toggleCommentLike,
    deleteComment,
    editComment,
    addComment,
    comments,
    posts,
    companyById
  } = usePlatform();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);

  const author = personById(comment.authorId);
  const liked = comment.likes.includes(currentUser.id);
  const replies = comments.filter((c) => c.parentId === comment.id);
  const post = posts.find((p) => p.id === comment.postId);
  const postOwnerId =
  post?.authorType === 'COMPANY' ? companyById(post.authorId)?.ownerId : post?.authorId;
  const canModerate =
  comment.authorId === currentUser.id || postOwnerId === currentUser.id || role === 'ADMIN';

  return (
    <li className={depth > 0 ? 'ml-10 mt-3' : 'mt-3'}>
      <div className="flex items-start gap-2.5">
        <Link to={`/people/${comment.authorId}`}>
          <Avatar name={author?.name ?? ''} color={author?.avatar} photo={author?.photo} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl rounded-tl-sm bg-surface-muted px-3.5 py-2.5">
            <div className="flex items-baseline gap-2">
              <Link
                to={`/people/${comment.authorId}`}
                className="truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                
                {author?.name}
              </Link>
              <p className="truncate text-[11px] text-ink-400">{author?.headline}</p>
            </div>
            {editing ?
            <form
              className="mt-2 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                editComment(comment.id, draft);
                setEditing(false);
              }}>
              
                <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
              
                <button
                type="submit"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                
                  {t('common.save')}
                </button>
                <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.body);
                }}
                className="text-xs font-semibold text-ink-500 hover:text-ink-900">
                
                  {t('common.cancel')}
                </button>
              </form> :

            <p className="mt-1 text-sm leading-relaxed text-ink-700">{comment.body}</p>
            }
          </div>
          <div className="mt-1 flex items-center gap-3 pl-1 text-xs">
            <button
              type="button"
              onClick={() => toggleCommentLike(comment.id)}
              aria-pressed={liked}
              className={`font-semibold transition-colors duration-150 ${
              liked ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'}`
              }>
              
              {t('common.like')}
            </button>
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900">
              
              {t('feed.reply')}
            </button>
            <span className="text-ink-400">
              {formatRelative(comment.createdAt)}
              {comment.editedAt ? ` · ${t('feed.edited')}` : ''}
            </span>
            {comment.likes.length > 0 &&
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold text-ink-500 ring-1 ring-surface-border">
                <ThumbsUpIcon className="h-3 w-3 text-brand-600" />
                {comment.likes.length}
              </span>
            }
            <span className="ml-auto flex items-center gap-2">
              {comment.authorId === currentUser.id && !editing &&
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={t('common.edit')}
                className="text-ink-400 transition-colors duration-150 hover:text-brand-700">
                
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              }
              {canModerate &&
              <button
                type="button"
                onClick={() => deleteComment(comment.id)}
                aria-label={t('common.remove')}
                className="text-ink-400 transition-colors duration-150 hover:text-red-600">
                
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              }
            </span>
          </div>

          {replying &&
          <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reply.trim()) return;
              addComment(comment.postId, reply, comment.id);
              setReply('');
              setReplying(false);
            }}>
            
              <input
              autoFocus
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t('feed.writeComment')}
              className="flex-1 rounded-full border border-surface-border px-3.5 py-2 text-sm focus:border-brand-400 focus:outline-none" />
            
              <button
              type="submit"
              className="rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
                {t('feed.reply')}
              </button>
            </form>
          }
        </div>
      </div>

      {replies.length > 0 &&
      <ul>
          {replies.map((r) =>
        <CommentItem key={r.id} comment={r} depth={depth + 1} />
        )}
        </ul>
      }
    </li>);

}

export function CommentThread({ postId }: {postId: string;}) {
  const { t } = useTranslation();
  const { commentsFor, currentUser, addComment } = usePlatform();
  const roots = commentsFor(postId).filter((c) => !c.parentId);
  const [draft, setDraft] = useState('');

  return (
    <div>
      <form
        className="flex items-center gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          addComment(postId, draft);
          setDraft('');
        }}>
        
        <Avatar name={currentUser.name} color={currentUser.avatar} photo={currentUser.photo} size="sm" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('feed.writeComment')}
          aria-label={t('feed.writeComment')}
          className="flex-1 rounded-full border border-surface-border bg-surface-muted px-4 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none" />
        
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:bg-brand-200">
          
          {t('common.post')}
        </button>
      </form>

      <ul>
        {roots.map((c) =>
        <CommentItem key={c.id} comment={c} />
        )}
      </ul>
    </div>);

}