import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as db from '../services/db';
import { AppError } from '../services/db';
import { useAuth } from './AuthContext';
import { isAdLive, todayKey } from '../utils/ads';
import type {
  Advertisement,
  AppNotification,
  Application,
  ApplicationStatus,
  Comment,
  Company,
  ConnectionState,
  Conversation,
  Database,
  Job,
  Message,
  Person,
  Post,
  Report,
  ReportTarget,
  Role } from
'../types';

interface Author {
  name: string;
  subtitle: string;
  color: string;
  initials: string;
  photo?: string;
  verified: boolean;
  href: string;
}

interface PlatformValue {
  currentUser: Person;
  role: Role;
  /** Whole-platform tables (read-only views of the store). */
  people: Person[];
  companies: Company[];
  jobs: Job[];
  posts: Post[];
  comments: Comment[];
  applications: Application[];
  reports: Report[];
  /** Scoped to the signed-in user. */
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  savedJobs: string[];
  savedPosts: string[];
  connections: Record<string, ConnectionState>;
  followedPeople: string[];
  followedCompanies: string[];
  // lookups
  personById: (id: string) => Person | undefined;
  companyById: (id: string) => Company | undefined;
  jobById: (id: string) => Job | undefined;
  authorOf: (post: Post) => Author;
  commentsFor: (postId: string) => Comment[];
  companyFollowers: (companyId: string) => string[];
  personFollowers: (personId: string) => string[];
  unreadIn: (conversationId: string) => number;
  connectionState: (personId: string) => ConnectionState;
  connectedIds: string[];
  // feedback
  error: string | null;
  notice: string | null;
  clearError: () => void;
  clearNotice: () => void;
  // actions — every one persists through the data layer
  toggleLike: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  sharePost: (postId: string, toFeed: boolean) => void;
  addPost: (input: db.PostInput) => boolean;
  deletePost: (postId: string) => void;
  hidePost: (postId: string, hidden: boolean) => void;
  addComment: (postId: string, body: string, parentId?: string) => void;
  editComment: (commentId: string, body: string) => void;
  deleteComment: (commentId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  createJob: (input: db.JobInput, announce: boolean) => Job | undefined;
  /** Returns true when the change was saved. */
  updateJob: (jobId: string, patch: Partial<db.JobInput>) => boolean;
  toggleJobOpen: (jobId: string) => void;
  setJobApproval: (jobId: string, approval: Job['approval']) => void;
  deleteJob: (jobId: string) => void;
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string, input: db.ApplicationInput) => Application | undefined;
  withdrawApplication: (applicationId: string) => void;
  setApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  requestConnection: (personId: string) => void;
  acceptConnection: (personId: string) => void;
  removeConnection: (personId: string) => void;
  toggleFollowPerson: (personId: string) => void;
  toggleFollowCompany: (companyId: string) => void;
  openConversation: (personId: string) => string | undefined;
  sendMessage: (conversationId: string, body: string) => void;
  markConversationRead: (conversationId: string) => void;
  markAllNotificationsRead: () => void;
  /** Returns true when the profile was saved. */
  updateProfile: (patch: db.ProfilePatch) => boolean;
  /** Rejects with an AppError or UploadError the caller can show inline. */
  uploadCv: (file: File) => Promise<void>;
  removeCv: () => boolean;
  /** Resolves a viewable URL for a CV the current user is allowed to read. */
  openCv: (ownerId: string, ref: string) => Promise<string>;
  updateCompany: (companyId: string, patch: Partial<Company>) => void;
  setUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  setCompanyApproval: (companyId: string, approval: Company['approval']) => void;
  setCompanyStatus: (companyId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  verifyCompany: (companyId: string) => void;
  resolveReport: (reportId: string, state: Report['state']) => void;
  addReport: (target: ReportTarget, targetId: string, label: string, reason: string) => void;

  /** Every advertisement — administrators only; empty for everyone else. */
  advertisements: Advertisement[];
  /** Published advertisements inside their date window, for public display. */
  liveAdvertisements: Advertisement[];
  createAdvertisement: (input: db.AdvertisementInput) => Advertisement | undefined;
  updateAdvertisement: (adId: string, input: db.AdvertisementInput) => Advertisement | undefined;
  setAdvertisementStatus: (adId: string, status: 'PUBLISHED' | 'UNPUBLISHED' | 'DRAFT') => boolean;
  deleteAdvertisement: (adId: string) => boolean;
  /** Rejects with an AppError or UploadError the caller can show inline. */
  uploadAdvertisementMedia: (file: File, kind: db.AdMediaKind) => Promise<string>;
  discardAdvertisementMedia: (refs: string[]) => void;

  unreadNotifications: number;
  unreadMessages: number;
}

const PlatformContext = createContext<PlatformValue | null>(null);

function initials(name: string) {
  return name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();
}

export function PlatformProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<Database>(() => db.getDatabase());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => db.subscribe(() => setSnapshot(db.getDatabase())), []);

  // Ads expire at midnight; re-check each minute so an open tab stays correct.
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const tick = () => {
      db.refreshAdvertisementStatuses();
      setToday(todayKey());
    };
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const currentUser = useMemo<Person | null>(() => {
    if (!user) return null;
    const record = snapshot.users.find((u) => u.id === user.id);
    return record ? db.publicUser(record) : user;
  }, [snapshot.users, user]);

  /** Runs a data-layer mutation and surfaces any rejection to the user. */
  const act = useCallback(<T,>(fn: () => T, successMessage?: string): T | undefined => {
    try {
      const result = fn();
      setError(null);
      if (successMessage) {
        setNotice(successMessage);
        window.setTimeout(() => setNotice(null), 3000);
      }
      return result;
    } catch (e) {
      setError(e instanceof AppError ? e.message : 'Something went wrong. Please try again.');
      window.setTimeout(() => setError(null), 5000);
      return undefined;
    }
  }, []);

  const value = useMemo<PlatformValue | null>(() => {
    if (!currentUser) return null;
    const me = currentUser.id;
    const people = snapshot.users.map((u) => db.publicUser(u));

    const personById = (id: string) => people.find((p) => p.id === id);
    const companyById = (id: string) => snapshot.companies.find((c) => c.id === id);
    const jobById = (id: string) => snapshot.jobs.find((j) => j.id === id);

    const connections: Record<string, ConnectionState> = {};
    snapshot.connections.forEach((c) => {
      if (c.requesterId === me) connections[c.addresseeId] = c.status === 'ACCEPTED' ? 'CONNECTED' : 'PENDING';else
      if (c.addresseeId === me) connections[c.requesterId] = c.status === 'ACCEPTED' ? 'CONNECTED' : 'INCOMING';
    });

    const myConversations = snapshot.conversations.filter((c) => c.participantIds.includes(me));
    const conversationIds = myConversations.map((c) => c.id);
    const myMessages = snapshot.messages.filter((m) => conversationIds.includes(m.conversationId));
    const unreadIn = (conversationId: string) =>
    myMessages.filter(
      (m) => m.conversationId === conversationId && m.senderId !== me && !m.readBy.includes(me)
    ).length;

    const myNotifications = snapshot.notifications.filter((n) => n.userId === me);

    const authorOf = (post: Post): Author => {
      if (post.authorType === 'COMPANY') {
        const c = companyById(post.authorId);
        return {
          name: c?.name ?? 'Company',
          subtitle: [c?.industry, c?.location].filter(Boolean).join(' · '),
          color: c?.logoColor ?? '#103764',
          initials: c?.logo ?? 'CO',
          photo: c?.logoUrl,
          verified: Boolean(c?.verified),
          href: c ? `/companies/${c.id}` : '#'
        };
      }
      const p = personById(post.authorId);
      return {
        name: p?.name ?? 'Member',
        subtitle: [p?.headline, p?.location].filter(Boolean).join(' · '),
        color: p?.avatar ?? '#1668e3',
        initials: initials(p?.name ?? 'M'),
        photo: p?.photo,
        verified: false,
        href: p ? `/people/${p.id}` : '#'
      };
    };

    return {
      currentUser,
      role: currentUser.role,
      people,
      companies: snapshot.companies,
      jobs: snapshot.jobs,
      posts: snapshot.posts,
      comments: snapshot.comments,
      applications: snapshot.applications,
      reports: snapshot.reports,
      notifications: myNotifications,
      conversations: myConversations,
      messages: myMessages,
      savedJobs: snapshot.savedJobs.filter((s) => s.userId === me).map((s) => s.jobId),
      savedPosts: snapshot.savedPosts.filter((s) => s.userId === me).map((s) => s.postId),
      connections,
      followedPeople: snapshot.follows.
      filter((f) => f.userId === me && f.targetType === 'PERSON').
      map((f) => f.targetId),
      followedCompanies: snapshot.follows.
      filter((f) => f.userId === me && f.targetType === 'COMPANY').
      map((f) => f.targetId),
      personById,
      companyById,
      jobById,
      authorOf,
      commentsFor: (postId: string) => snapshot.comments.filter((c) => c.postId === postId),
      companyFollowers: (companyId: string) =>
      snapshot.follows.filter((f) => f.targetType === 'COMPANY' && f.targetId === companyId).map((f) => f.userId),
      personFollowers: (personId: string) =>
      snapshot.follows.filter((f) => f.targetType === 'PERSON' && f.targetId === personId).map((f) => f.userId),
      unreadIn,
      connectionState: (personId: string) => connections[personId] ?? 'NONE',
      connectedIds: Object.entries(connections).
      filter(([, state]) => state === 'CONNECTED').
      map(([id]) => id),
      error,
      notice,
      clearError: () => setError(null),
      clearNotice: () => setNotice(null),

      toggleLike: (postId) => act(() => db.toggleLike(me, postId)),
      toggleSavePost: (postId) => act(() => db.toggleSavePost(me, postId)),
      sharePost: (postId, toFeed) => act(() => db.sharePost(me, postId, toFeed)),
      addPost: (input) => act(() => db.createPost(me, input)) !== undefined,
      deletePost: (postId) => act(() => db.deletePost(me, postId)),
      hidePost: (postId, hidden) => act(() => db.setPostHidden(me, postId, hidden)),
      addComment: (postId, body, parentId) => act(() => db.addComment(me, postId, body, parentId)),
      editComment: (commentId, body) => act(() => db.editComment(me, commentId, body)),
      deleteComment: (commentId) => act(() => db.deleteComment(me, commentId)),
      toggleCommentLike: (commentId) => act(() => db.toggleCommentLike(me, commentId)),

      createJob: (input, announce) => act(() => db.createJob(me, input, announce)),
      updateJob: (jobId, patch) =>
      act(() => {
        db.updateJob(me, jobId, patch);
        return true;
      }, 'Job updated') ?? false,
      toggleJobOpen: (jobId) => {
        const job = jobById(jobId);
        if (job) act(() => db.setJobOpen(me, jobId, !job.open));
      },
      setJobApproval: (jobId, approval) => act(() => db.setJobApproval(me, jobId, approval)),
      deleteJob: (jobId) => act(() => db.deleteJob(me, jobId)),
      toggleSaveJob: (jobId) => act(() => db.toggleSaveJob(me, jobId)),
      applyToJob: (jobId, input) => act(() => db.applyToJob(me, jobId, input)),
      withdrawApplication: (id) => act(() => db.withdrawApplication(me, id)),
      setApplicationStatus: (id, status) => act(() => db.setApplicationStatus(me, id, status)),

      requestConnection: (personId) => act(() => db.requestConnection(me, personId)),
      acceptConnection: (personId) => act(() => db.acceptConnection(me, personId)),
      removeConnection: (personId) => act(() => db.removeConnection(me, personId)),
      toggleFollowPerson: (personId) => act(() => db.toggleFollow(me, personId, 'PERSON')),
      toggleFollowCompany: (companyId) => act(() => db.toggleFollow(me, companyId, 'COMPANY')),

      openConversation: (personId) => act(() => db.openConversation(me, personId)),
      sendMessage: (conversationId, body) => act(() => db.sendMessage(me, conversationId, body)),
      markConversationRead: (conversationId) => {
        try {
          db.markConversationRead(me, conversationId);
        } catch {

          /* reading a conversation must never interrupt the user */}
      },
      markAllNotificationsRead: () => act(() => db.markNotificationsRead(me)),

      updateProfile: (patch) =>
      act(() => {
        db.updateProfile(me, me, patch);
        return true;
      }, 'Profile updated') ?? false,
      uploadCv: (file) => db.uploadCv(me, file),
      removeCv: () =>
      act(() => {
        db.removeCv(me);
        return true;
      }, 'CV removed') ?? false,
      openCv: (ownerId, ref) => db.openCv(me, ownerId, ref),
      updateCompany: (companyId, patch) => act(() => db.updateCompany(me, companyId, patch)),
      setUserStatus: (userId, status) => act(() => db.setUserStatus(me, userId, status)),
      setCompanyApproval: (companyId, approval) => act(() => db.setCompanyApproval(me, companyId, approval)),
      setCompanyStatus: (companyId, status) => act(() => db.setCompanyStatus(me, companyId, status)),
      verifyCompany: (companyId) => act(() => db.verifyCompany(me, companyId)),
      resolveReport: (reportId, state) => act(() => db.resolveReport(me, reportId, state)),
      addReport: (target, targetId, label, reason) =>
      act(() => db.addReport(me, target, targetId, label, reason)),

      advertisements: currentUser.role === 'ADMIN' ? snapshot.advertisements : [],
      liveAdvertisements: snapshot.advertisements.filter((ad) => isAdLive(ad, today)),
      createAdvertisement: (input) => act(() => db.createAdvertisement(me, input), 'Advertisement saved'),
      updateAdvertisement: (adId, input) =>
      act(() => db.updateAdvertisement(me, adId, input), 'Advertisement updated'),
      setAdvertisementStatus: (adId, status) =>
      act(() => {
        db.setAdvertisementStatus(me, adId, status);
        return true;
      }) ?? false,
      deleteAdvertisement: (adId) =>
      act(() => {
        db.deleteAdvertisement(me, adId);
        return true;
      }, 'Advertisement deleted') ?? false,
      uploadAdvertisementMedia: (file, kind) => db.uploadAdvertisementMedia(me, file, kind),
      discardAdvertisementMedia: (refs) => {
        try {
          db.discardAdvertisementMedia(me, refs);
        } catch {

          /* cleanup is best-effort */}
      },

      unreadNotifications: myNotifications.filter((n) => !n.read).length,
      unreadMessages: conversationIds.reduce((sum, id) => sum + unreadIn(id), 0)
    };
  }, [snapshot, currentUser, error, notice, act, today]);

  if (!value) return null;
  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used inside PlatformProvider');
  return ctx;
}

export { initials };