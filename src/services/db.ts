import { buildSeedDatabase } from './seed';
import { hashPassword, randomHex, verifyPassword } from './crypto';
import { deleteMedia, isStoredMedia, putMedia, resolveMediaUrl } from './mediaStore';
import { seedAdvertisements } from '../data/advertisements';
import { AD_TYPES, AD_STATUSES, isAdPastEnd, isSafeTargetUrl, todayKey } from '../utils/ads';
import { validateUpload, verifyFileSignature, type UploadKind } from '../utils/upload';
import { canonicalDistrict, isInRwanda, isValidLatLng, provinceOfDistrict } from '../utils/geo';
import { DEMO_JOB_LOCATIONS } from '../data/jobLocations';
import type {
  Advertisement,
  AdvertisementStatus,
  AdvertisementType,
  AppNotification,
  Application,
  ApplicationStatus,
  Comment,
  Company,
  Database,
  EducationItem,
  EmploymentType,
  ExperienceItem,
  Job,
  NotificationKind,
  Post,
  PostKind,
  PostMedia,
  Report,
  ReportTarget,
  Role,
  Session,
  StoredUser,
  WorkLocationType } from
'../types';

const DB_KEY = 'rwandaconnect.db.v1';
const SESSION_KEY = 'rwandaconnect.session.v1';

export type ErrorCode =
'UNAUTHENTICATED' |
'FORBIDDEN' |
'NOT_FOUND' |
'CONFLICT' |
'VALIDATION' |
'SUSPENDED' |
'BAD_CREDENTIALS' |
'STORAGE';

/** Every rejected operation throws this so the UI can show a precise message. */
export class AppError extends Error {
  constructor(
  public code: ErrorCode,
  message: string)
  {
    super(message);
    this.name = 'AppError';
  }
}

let db: Database | null = null;
const listeners = new Set<() => void>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStored(): Database | null {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Database;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist() {
  if (!db) return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new AppError('STORAGE', 'Local storage is full or unavailable — changes were not saved.');
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

/** Loads the database, seeding it on first run. */
export async function initDatabase(): Promise<Database> {
  if (db) return db;
  const stored = readStored();
  db = stored ?? (await buildSeedDatabase());
  migrate(db);
  expireAdvertisements(db);
  persist();
  return db;
}

/**
 * Brings databases saved by earlier versions up to the current shape. Every
 * step is idempotent so it is safe to run on every load.
 */
function migrate(draft: Database) {
  if (!Array.isArray(draft.advertisements)) draft.advertisements = [];
  if (!draft.sequences.jobGeoSeeded) {
    draft.jobs.forEach((job) => {
      const geo = DEMO_JOB_LOCATIONS[job.id];
      if (geo && !job.workLocationType && job.latitude === undefined) Object.assign(job, geo);
    });
    draft.sequences.jobGeoSeeded = 1;
  }
  if (!draft.sequences.profilesSeeded) {
    // Give the demo job seeker a complete profile to start from.
    const demo = draft.users.find((u) => u.id === 'u1');
    if (demo && !demo.experience) {
      demo.experience = [
      {
        id: 'exp-1',
        role: 'Junior Software Developer',
        organization: 'Kigali Tech Hub',
        start: '2024-02',
        end: '',
        current: true,
        description: 'Building internal tools in React and Node.js for member companies.'
      },
      {
        id: 'exp-2',
        role: 'Software Development Intern',
        organization: 'ABC Rwanda Ltd',
        start: '2023-06',
        end: '2024-01',
        current: false,
        description: 'Supported the digital banking team with front-end features and testing.'
      }];

      demo.education = [
      { id: 'edu-1', school: 'University of Rwanda', degree: 'BSc Computer Science', startYear: '2019', endYear: '2023' }];

      demo.certifications = ['AWS Cloud Practitioner', 'Meta Front-End Developer'];
      demo.languages = ['Kinyarwanda', 'English', 'Français'];
    }
    draft.sequences.profilesSeeded = 1;
  }
  if (!draft.sequences.advertisementsSeeded) {
    const admin = draft.users.find((u) => u.role === 'ADMIN');
    if (admin) {
      const now = new Date().toISOString();
      for (const seed of seedAdvertisements) {
        if (draft.advertisements.some((a) => a.id === seed.id)) continue;
        draft.advertisements.push({ ...seed, createdBy: admin.id, createdAt: now, updatedAt: now });
      }
    }
    draft.sequences.advertisementsSeeded = 1;
  }
}

/** Marks live or paused ads whose end date has passed as EXPIRED. */
function expireAdvertisements(draft: Database): boolean {
  const today = todayKey();
  let changed = false;
  for (const ad of draft.advertisements) {
    if ((ad.status === 'PUBLISHED' || ad.status === 'UNPUBLISHED') && isAdPastEnd(ad, today)) {
      ad.status = 'EXPIRED';
      ad.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  return changed;
}

/** Re-checks ad expiry; called periodically so ads expire while the app is open. */
export function refreshAdvertisementStatuses() {
  if (!db) return;
  const draft = clone(db);
  if (!expireAdvertisements(draft)) return;
  db = draft;
  persist();
  emit();
}

export function getDatabase(): Database {
  if (!db) throw new AppError('STORAGE', 'Database is not initialised yet.');
  return db;
}

/** Applies a mutation, persists it, and notifies subscribers. */
function write<T>(mutator: (draft: Database) => T): T {
  const current = getDatabase();
  const draft = clone(current);
  const result = mutator(draft);
  db = draft;
  persist();
  emit();
  return result;
}

export function resetDatabase() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(SESSION_KEY);
  db = null;
}

function nextId(draft: Database, prefix: string): string {
  draft.sequences.entity = (draft.sequences.entity ?? 0) + 1;
  return `${prefix}${draft.sequences.entity}`;
}

function requireUser(draft: Database, userId: string): StoredUser {
  const user = draft.users.find((u) => u.id === userId);
  if (!user) throw new AppError('UNAUTHENTICATED', 'Your session is no longer valid.');
  if (user.status === 'SUSPENDED') throw new AppError('SUSPENDED', 'This account is suspended.');
  return user;
}

function requireAdmin(draft: Database, userId: string): StoredUser {
  const user = requireUser(draft, userId);
  if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Administrator permission required.');
  return user;
}

function requireEmployer(draft: Database, userId: string): StoredUser {
  const user = requireUser(draft, userId);
  if (user.role !== 'EMPLOYER') throw new AppError('FORBIDDEN', 'Employer permission required.');
  return user;
}

function requireJobSeeker(draft: Database, userId: string): StoredUser {
  const user = requireUser(draft, userId);
  if (user.role !== 'JOB_SEEKER') throw new AppError('FORBIDDEN', 'Job seeker permission required.');
  return user;
}

function notify(
draft: Database,
userId: string,
kind: NotificationKind,
actorId: string,
meta?: Record<string, string>)
{
  if (!userId || userId === actorId) return;
  draft.notifications.unshift({
    id: nextId(draft, 'n'),
    userId,
    kind,
    actorId,
    createdAt: new Date().toISOString(),
    read: false,
    meta
  });
}

/** Resolves who should be notified about activity on a post. */
function postOwnerIds(draft: Database, post: Post): string[] {
  if (post.authorType === 'PERSON') return [post.authorId];
  const company = draft.companies.find((c) => c.id === post.authorId);
  return company ? [company.ownerId] : [];
}

/* ------------------------------------------------------------------ auth --- */

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as Session : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));else
  localStorage.removeItem(SESSION_KEY);
}

export function publicUser(user: StoredUser) {
  const { passwordHash: _hash, salt: _salt, identities: _ids, ...rest } = user;
  return rest;
}

export interface SocialIdentity {
  provider: 'google' | 'linkedin';
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export type SocialSignInResult = {status: 'signed-in';session: Session;} | {status: 'needs-role';};

/**
 * Signs in with a verified Google/LinkedIn identity.
 * 1. A previously linked identity signs straight in.
 * 2. A verified email matching an existing account links to it and signs in.
 * 3. Otherwise a new account is created — but only once the person has chosen
 *    Job Seeker or Employer (`needs-role` asks the UI to collect that).
 * Administrator accounts can never be reached through social sign-in.
 */
export async function socialSignIn(
identity: SocialIdentity,
signup?: {role: Role;companyName?: string;})
: Promise<SocialSignInResult> {
  const current = getDatabase();
  const email = identity.email.trim().toLowerCase();

  const linked = current.users.find((u) =>
  u.identities?.some((i) => i.provider === identity.provider && i.subject === identity.subject)
  );
  const byEmail = linked ?? current.users.find((u) => u.email.toLowerCase() === email);

  if (byEmail) {
    if (byEmail.role === 'ADMIN') {
      throw new AppError('FORBIDDEN', 'Administrator accounts must sign in with email and password.');
    }
    if (byEmail.status === 'SUSPENDED') throw new AppError('SUSPENDED', 'This account is suspended.');
    if (!linked && !identity.emailVerified) {
      throw new AppError(
        'FORBIDDEN',
        'That email is not verified with your provider. Sign in with your password instead.'
      );
    }
    write((draft) => {
      const user = draft.users.find((u) => u.id === byEmail.id);
      if (!user) return;
      if (!linked) {
        user.identities = [
        ...(user.identities ?? []),
        { provider: identity.provider, subject: identity.subject, linkedAt: new Date().toISOString() }];

      }
      if (!user.photo && identity.picture) user.photo = identity.picture;
    });
    const session: Session = { token: randomHex(24), userId: byEmail.id, issuedAt: new Date().toISOString() };
    writeSession(session);
    return { status: 'signed-in', session };
  }

  if (!signup) return { status: 'needs-role' };
  if (signup.role !== 'JOB_SEEKER' && signup.role !== 'EMPLOYER') {
    throw new AppError('FORBIDDEN', 'This account type cannot be created from the sign-up form.');
  }

  // Social accounts get an unguessable password; they can set one later.
  const session = await register({
    name: identity.name,
    email,
    password: randomHex(32),
    role: signup.role,
    companyName: signup.companyName
  });
  write((draft) => {
    const user = draft.users.find((u) => u.id === session.userId);
    if (!user) return;
    user.identities = [{ provider: identity.provider, subject: identity.subject, linkedAt: new Date().toISOString() }];
    if (identity.picture) user.photo = identity.picture;
  });
  return { status: 'signed-in', session };
}

export async function login(email: string, password: string): Promise<Session> {
  const draft = getDatabase();
  const user = draft.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) throw new AppError('BAD_CREDENTIALS', 'Incorrect email or password.');
  const ok = await verifyPassword(password, user.salt, user.passwordHash);
  if (!ok) throw new AppError('BAD_CREDENTIALS', 'Incorrect email or password.');
  if (user.status === 'SUSPENDED') throw new AppError('SUSPENDED', 'This account is suspended.');
  const session: Session = { token: randomHex(24), userId: user.id, issuedAt: new Date().toISOString() };
  writeSession(session);
  return session;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  headline?: string;
  location?: string;
  companyName?: string;
}

const PALETTE = ['#103764', '#1668e3', '#1f9d55', '#eeb821', '#178047', '#0c2c51'];

export async function register(input: RegisterInput): Promise<Session> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('VALIDATION', 'Enter a valid email address.');
  }
  if (input.password.length < 8) {
    throw new AppError('VALIDATION', 'Password must be at least 8 characters.');
  }
  if (!input.name.trim()) throw new AppError('VALIDATION', 'Enter your full name.');
  // The role is never taken at face value: only these two can self-register.
  if (input.role !== 'JOB_SEEKER' && input.role !== 'EMPLOYER') {
    throw new AppError('FORBIDDEN', 'This account type cannot be created from the sign-up form.');
  }

  const existing = getDatabase().users.some((u) => u.email.toLowerCase() === email);
  if (existing) throw new AppError('CONFLICT', 'An account with this email already exists.');

  const salt = randomHex(16);
  const passwordHash = await hashPassword(input.password, salt);

  const session = write((draft) => {
    const id = nextId(draft, 'u');
    let companyId: string | undefined;
    if (input.role === 'EMPLOYER') {
      companyId = nextId(draft, 'c');
      const name = input.companyName?.trim() || `${input.name.trim()} Company`;
      draft.companies.push({
        id: companyId,
        name,
        logo: name.slice(0, 2).toUpperCase(),
        logoColor: PALETTE[draft.companies.length % PALETTE.length],
        industry: '',
        location: input.location?.trim() || 'Kigali, Rwanda',
        about: '',
        website: '',
        employees: '1-10',
        verified: false,
        approval: 'PENDING',
        status: 'ACTIVE',
        ownerId: id
      });
    }
    draft.users.push({
      id,
      name: input.name.trim(),
      email,
      headline: input.headline?.trim() || '',
      location: input.location?.trim() || 'Kigali',
      avatar: PALETTE[draft.users.length % PALETTE.length],
      role: input.role,
      status: 'ACTIVE',
      companyId,
      skills: [],
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      language: 'en'
    });
    return { token: randomHex(24), userId: id, issuedAt: new Date().toISOString() } as Session;
  });

  writeSession(session);
  return session;
}

export function logout() {
  writeSession(null);
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = getDatabase().users.find((u) => u.id === userId);
  if (!user) throw new AppError('UNAUTHENTICATED', 'Your session is no longer valid.');
  if (!(await verifyPassword(current, user.salt, user.passwordHash))) {
    throw new AppError('BAD_CREDENTIALS', 'Your current password is incorrect.');
  }
  if (next.length < 8) throw new AppError('VALIDATION', 'Password must be at least 8 characters.');
  const salt = randomHex(16);
  const passwordHash = await hashPassword(next, salt);
  write((draft) => {
    const target = draft.users.find((u) => u.id === userId);
    if (target) {
      target.salt = salt;
      target.passwordHash = passwordHash;
    }
  });
}

/* --------------------------------------------------------------- profile --- */

export interface ProfilePatch {
  name?: string;
  headline?: string;
  location?: string;
  about?: string;
  phone?: string;
  skills?: string[];
  industry?: string;
  university?: string;
  photo?: string | null;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certifications?: string[];
  languages?: string[];
  language?: string;
}

const MONTH_KEY = /^\d{4}-\d{2}$/;
const YEAR_KEY = /^\d{4}$/;
const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const textList = (list: unknown, maxItems: number, maxLen: number) =>
Array.from(
  new Set(
    (Array.isArray(list) ? list : []).
    map((v) => text(v, maxLen)).
    filter(Boolean)
  )
).slice(0, maxItems);

/**
 * Whitelists and validates profile fields. Anything not listed here — role,
 * status, email, credentials, CV reference — can never be set this way.
 */
function cleanProfilePatch(patch: ProfilePatch): Partial<StoredUser> {
  const out: Partial<StoredUser> = {};

  if (patch.name !== undefined) {
    const name = text(patch.name, 80);
    if (name.length < 2) throw new AppError('VALIDATION', 'Enter your full name.');
    out.name = name;
  }
  if (patch.headline !== undefined) {
    const headline = text(patch.headline, 120);
    if (!headline) throw new AppError('VALIDATION', 'Add a professional headline.');
    out.headline = headline;
  }
  if (patch.location !== undefined) {
    const location = text(patch.location, 60);
    if (!location) throw new AppError('VALIDATION', 'Add your location.');
    out.location = location;
  }
  if (patch.about !== undefined) out.about = text(patch.about, 2000);
  if (patch.phone !== undefined) {
    const phone = text(patch.phone, 20);
    if (phone && !/^\+?[\d\s-]{7,20}$/.test(phone)) {
      throw new AppError('VALIDATION', 'Enter a valid phone number, for example +250 788 123 456.');
    }
    out.phone = phone;
  }
  if (patch.industry !== undefined) out.industry = text(patch.industry, 60);
  if (patch.university !== undefined) out.university = text(patch.university, 100);
  if (patch.language !== undefined) out.language = text(patch.language, 5);
  if (patch.skills !== undefined) out.skills = textList(patch.skills, 30, 40);
  if (patch.certifications !== undefined) out.certifications = textList(patch.certifications, 20, 100);
  if (patch.languages !== undefined) out.languages = textList(patch.languages, 10, 40);

  if (patch.photo !== undefined) {
    if (patch.photo === null || patch.photo === '') out.photo = undefined;else
    if (/^data:image\/(png|jpeg|webp|gif);base64,/.test(patch.photo) || /^https:\/\//.test(patch.photo)) {
      out.photo = patch.photo;
    } else throw new AppError('VALIDATION', 'The profile photo is not a valid image.');
  }

  if (patch.experience !== undefined) {
    if (patch.experience.length > 15) throw new AppError('VALIDATION', 'You can list up to 15 positions.');
    out.experience = patch.experience.map((item) => {
      const role = text(item.role, 80);
      const organization = text(item.organization, 80);
      if (!role || !organization) throw new AppError('VALIDATION', 'Each position needs a job title and an organisation.');
      if (!MONTH_KEY.test(item.start)) throw new AppError('VALIDATION', `Add a start date for "${role}".`);
      const current = !!item.current;
      const end = current ? '' : item.end;
      if (!current && !MONTH_KEY.test(end)) {
        throw new AppError('VALIDATION', `Add an end date for "${role}", or mark it as your current role.`);
      }
      if (end && end < item.start) throw new AppError('VALIDATION', `The end date for "${role}" is before its start date.`);
      return {
        id: text(item.id, 40) || randomHex(6),
        role,
        organization,
        start: item.start,
        end,
        current,
        description: text(item.description, 600)
      };
    });
  }

  if (patch.education !== undefined) {
    if (patch.education.length > 10) throw new AppError('VALIDATION', 'You can list up to 10 schools.');
    out.education = patch.education.map((item) => {
      const school = text(item.school, 100);
      if (!school) throw new AppError('VALIDATION', 'Each education entry needs a school or university.');
      const startYear = text(item.startYear, 4);
      const endYear = text(item.endYear, 4);
      if (startYear && !YEAR_KEY.test(startYear) || endYear && !YEAR_KEY.test(endYear)) {
        throw new AppError('VALIDATION', `Use four-digit years for "${school}".`);
      }
      if (startYear && endYear && endYear < startYear) {
        throw new AppError('VALIDATION', `The end year for "${school}" is before its start year.`);
      }
      return { id: text(item.id, 40) || randomHex(6), school, degree: text(item.degree, 100), startYear, endYear };
    });
    // Keep the short "university" line in sync for search and suggestions.
    out.university = out.education[0]?.school ?? '';
  }

  return out;
}

export function updateProfile(actorId: string, targetId: string, patch: ProfilePatch) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    if (actor.id !== targetId && actor.role !== 'ADMIN') {
      throw new AppError('FORBIDDEN', 'You can only edit your own profile.');
    }
    const target = draft.users.find((u) => u.id === targetId);
    if (!target) throw new AppError('NOT_FOUND', 'Profile not found.');
    const clean = cleanProfilePatch(patch);
    Object.assign(target, clean);
    if ('photo' in clean && clean.photo === undefined) delete target.photo;
  });
}

/* -------------------------------------------------------------------- CV --- */

/** Validates, stores and attaches a CV to the actor's own profile. */
export async function uploadCv(actorId: string, file: File): Promise<void> {
  requireUser(getDatabase(), actorId);
  const name = validateUpload(file, 'document');
  await verifyFileSignature(file);
  let ref: string;
  try {
    ref = await putMedia(file, name);
  } catch {
    throw new AppError('STORAGE', 'Your CV could not be stored. Free up browser storage and try again.');
  }
  let previous: string | undefined;
  write((draft) => {
    const user = requireUser(draft, actorId);
    previous = user.cvRef;
    user.cvRef = ref;
    user.cvName = name;
    user.cvSize = file.size;
    user.cvUploadedAt = new Date().toISOString();
  });
  releaseCv(previous);
}

export function removeCv(actorId: string) {
  let previous: string | undefined;
  write((draft) => {
    const user = requireUser(draft, actorId);
    previous = user.cvRef;
    delete user.cvRef;
    delete user.cvName;
    delete user.cvSize;
    delete user.cvUploadedAt;
  });
  releaseCv(previous);
}

/** Deletes a CV file unless an application still points at it. */
function releaseCv(ref: string | undefined) {
  if (!ref || !db) return;
  const inUse = db.users.some((u) => u.cvRef === ref) || db.applications.some((a) => a.cvRef === ref);
  if (!inUse) deleteMedia(ref).catch(() => undefined);
}

/**
 * CVs are private: only the owner, an administrator, or an employer the
 * person has applied to may open one.
 */
export function assertCanReadCv(actorId: string, ownerId: string, ref: string) {
  const current = getDatabase();
  const actor = requireUser(current, actorId);
  if (actor.id === ownerId || actor.role === 'ADMIN') return;
  const owner = current.users.find((u) => u.id === ownerId);
  const belongsToOwner = owner?.cvRef === ref || current.applications.some((a) => a.applicantId === ownerId && a.cvRef === ref);
  const isTheirEmployer = current.applications.some(
    (a) => a.applicantId === ownerId && current.jobs.find((j) => j.id === a.jobId)?.ownerId === actor.id
  );
  if (!belongsToOwner || !isTheirEmployer) {
    throw new AppError('FORBIDDEN', 'You do not have access to this CV.');
  }
}

export async function openCv(actorId: string, ownerId: string, ref: string): Promise<string> {
  assertCanReadCv(actorId, ownerId, ref);
  const url = await resolveMediaUrl(ref);
  if (!url) throw new AppError('NOT_FOUND', 'This CV file is no longer available.');
  return url;
}

export function updateCompany(actorId: string, companyId: string, patch: Partial<Company>) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const company = draft.companies.find((c) => c.id === companyId);
    if (!company) throw new AppError('NOT_FOUND', 'Company not found.');
    if (actor.role !== 'ADMIN' && company.ownerId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You can only edit your own company.');
    }
    const { id: _id, ownerId: _owner, approval, verified, status, ...safe } = patch;
    Object.assign(company, safe);
    // Only administrators may change moderation fields.
    if (actor.role === 'ADMIN') {
      if (approval) company.approval = approval;
      if (typeof verified === 'boolean') company.verified = verified;
      if (status) company.status = status;
    }
  });
}

/* ------------------------------------------------------------------ jobs --- */

export interface JobInput {
  title: string;
  location: string;
  district: string;
  salaryMin: number;
  salaryMax: number;
  type: EmploymentType;
  experience: string;
  education: string;
  positions: number;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  workLocationType?: WorkLocationType;
  latitude?: number | null;
  longitude?: number | null;
  country?: string;
  province?: string;
  sector?: string;
  streetAddress?: string;
}

const LOCATION_KEYS = [
'workLocationType',
'latitude',
'longitude',
'country',
'province',
'sector',
'streetAddress',
'location',
'district'] as
const;

type JobLocationFields = Pick<Job, (typeof LOCATION_KEYS)[number]>;

/**
 * Validates where a job happens. On-site and hybrid jobs must carry a real pin
 * inside Rwanda plus a district; remote jobs never carry coordinates, so they
 * can't be mistaken for a physical workplace.
 */
function cleanJobLocation(input: Partial<JobInput>): JobLocationFields {
  const mode = input.workLocationType ?? 'ON_SITE';
  if (mode !== 'ON_SITE' && mode !== 'HYBRID' && mode !== 'REMOTE') {
    throw new AppError('VALIDATION', 'Choose on-site, hybrid or remote.');
  }
  const str = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';

  if (mode === 'REMOTE') {
    return {
      workLocationType: 'REMOTE',
      latitude: undefined,
      longitude: undefined,
      country: 'Rwanda',
      province: '',
      sector: '',
      streetAddress: '',
      location: 'Remote',
      district: ''
    };
  }

  const lat = input.latitude;
  const lng = input.longitude;
  if (lat === null || lat === undefined || lng === null || lng === undefined || !isValidLatLng(lat, lng)) {
    throw new AppError('VALIDATION', 'Pin the workplace on the map. On-site and hybrid jobs need a location.');
  }
  if (!isInRwanda({ lat, lng })) {
    throw new AppError('VALIDATION', 'The workplace pin must be inside Rwanda.');
  }
  const district = canonicalDistrict(str(input.district, 60));
  if (!district) throw new AppError('VALIDATION', 'Choose the district the workplace is in.');
  const province = provinceOfDistrict(district) ?? '';
  return {
    workLocationType: mode,
    latitude: Math.round(lat * 1e6) / 1e6,
    longitude: Math.round(lng * 1e6) / 1e6,
    country: 'Rwanda',
    province,
    sector: str(input.sector, 60),
    streetAddress: str(input.streetAddress, 160),
    district,
    location: str(input.location, 60) || (province === 'Kigali City' ? 'Kigali' : district)
  };
}

function validateJob(input: JobInput) {
  if (!input.title.trim()) throw new AppError('VALIDATION', 'Job title is required.');
  if (!input.description.trim()) throw new AppError('VALIDATION', 'Job description is required.');
  if (input.salaryMin <= 0) throw new AppError('VALIDATION', 'Enter a valid minimum salary in RWF.');
  if (input.salaryMax < input.salaryMin) {
    throw new AppError('VALIDATION', 'Maximum salary must be greater than the minimum.');
  }
  if (!input.deadline) throw new AppError('VALIDATION', 'An application deadline is required.');
}

export function createJob(actorId: string, input: JobInput, announce: boolean): Job {
  validateJob(input);
  const where = cleanJobLocation(input);
  return write((draft) => {
    const actor = requireEmployer(draft, actorId);
    if (!actor.companyId) throw new AppError('VALIDATION', 'Create your company profile first.');

    const job: Job = {
      id: nextId(draft, 'j'),
      title: input.title.trim(),
      companyId: actor.companyId,
      ...where,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      currency: 'RWF',
      type: input.type,
      experience: input.experience,
      education: input.education,
      positions: Math.max(1, input.positions),
      postedAt: new Date().toISOString(),
      deadline: input.deadline,
      description: input.description.trim(),
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      benefits: input.benefits,
      skills: input.skills,
      open: true,
      // The posting goes live immediately so job seekers can find and apply to
      // it. Moderation is retrospective: administrators can still reject or
      // suspend it, which removes it from every job-seeker surface.
      approval: 'APPROVED',
      ownerId: actor.id
    };
    draft.jobs.unshift(job);

    const company = draft.companies.find((c) => c.id === actor.companyId);
    if (announce) {
      draft.posts.unshift({
        id: nextId(draft, 'p'),
        authorId: job.companyId,
        authorType: 'COMPANY',
        kind: 'JOB',
        body: `We are hiring! ${company?.name ?? ''} is looking for a ${job.title} in ${job.location}. ${job.description}`,
        createdAt: new Date().toISOString(),
        media: [],
        jobId: job.id,
        likes: [],
        shares: [],
        views: 0,
        hidden: false
      });
    }

    // Followers of the company are notified about the new opening.
    draft.follows.
    filter((f) => f.targetType === 'COMPANY' && f.targetId === job.companyId).
    forEach((f) => notify(draft, f.userId, 'newJob', actor.id, { jobId: job.id }));

    // Administrators see it in the approval queue.
    draft.users.
    filter((u) => u.role === 'ADMIN').
    forEach((adminUser) => notify(draft, adminUser.id, 'newJob', actor.id, { jobId: job.id }));

    return job;
  });
}

export function updateJob(actorId: string, jobId: string, patch: Partial<JobInput>) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const job = draft.jobs.find((j) => j.id === jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    if (actor.role !== 'ADMIN' && job.ownerId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You can only edit jobs you posted.');
    }
    const touchesLocation = LOCATION_KEYS.some((k) => k in patch);
    const rest: Partial<JobInput> = { ...patch };
    LOCATION_KEYS.forEach((k) => delete rest[k as keyof JobInput]);
    if (Object.keys(rest).length) {
      validateJob({ ...(job as unknown as JobInput), ...rest });
      Object.assign(job, rest);
    }
    if (touchesLocation) {
      const merged = { ...(job as unknown as JobInput), ...patch };
      const where = cleanJobLocation(merged);
      Object.assign(job, where);
      if (where.workLocationType === 'REMOTE') {
        delete job.latitude;
        delete job.longitude;
      }
    }
  });
}

export function setJobOpen(actorId: string, jobId: string, open: boolean) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const job = draft.jobs.find((j) => j.id === jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    if (actor.role !== 'ADMIN' && job.ownerId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You can only close jobs you posted.');
    }
    job.open = open;
  });
}

export function setJobApproval(actorId: string, jobId: string, approval: Job['approval']) {
  write((draft) => {
    requireAdmin(draft, actorId);
    const job = draft.jobs.find((j) => j.id === jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    job.approval = approval;
    notify(draft, job.ownerId, 'adminAction', actorId, { approval, jobId });
  });
}

export function deleteJob(actorId: string, jobId: string) {
  write((draft) => {
    requireAdmin(draft, actorId);
    const job = draft.jobs.find((j) => j.id === jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    draft.jobs = draft.jobs.filter((j) => j.id !== jobId);
    draft.savedJobs = draft.savedJobs.filter((s) => s.jobId !== jobId);
    notify(draft, job.ownerId, 'adminAction', actorId, { removed: job.title });
  });
}

export function toggleSaveJob(actorId: string, jobId: string) {
  write((draft) => {
    const actor = requireJobSeeker(draft, actorId);
    const existing = draft.savedJobs.find((s) => s.userId === actor.id && s.jobId === jobId);
    if (existing) {
      draft.savedJobs = draft.savedJobs.filter((s) => s.id !== existing.id);
      return;
    }
    if (!draft.jobs.some((j) => j.id === jobId)) throw new AppError('NOT_FOUND', 'Job not found.');
    draft.savedJobs.push({
      id: nextId(draft, 'sj'),
      userId: actor.id,
      jobId,
      createdAt: new Date().toISOString()
    });
  });
}

/* ---------------------------------------------------------- applications --- */

export interface ApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  skills: string;
  expectedSalary: number;
  cvName: string;
  cvRef?: string;
  coverLetter: string;
  answers: Record<string, string>;
}

export function applyToJob(actorId: string, jobId: string, input: ApplicationInput): Application {
  return write((draft) => {
    const actor = requireJobSeeker(draft, actorId);
    const job = draft.jobs.find((j) => j.id === jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    // Same rule as the job listings: live unless closed, rejected or the company is suspended.
    const company = draft.companies.find((c) => c.id === job.companyId);
    if (!job.open || job.approval === 'REJECTED' || company?.status === 'SUSPENDED') {
      throw new AppError('VALIDATION', 'This job is no longer accepting applications.');
    }
    if (draft.applications.some((a) => a.jobId === jobId && a.applicantId === actor.id)) {
      throw new AppError('CONFLICT', 'You have already applied for this job.');
    }
    if (!input.fullName.trim() || !input.email.trim() || !input.cvName) {
      throw new AppError('VALIDATION', 'Name, email and CV are required.');
    }
    // Only the applicant's own stored CV may be attached.
    if (input.cvRef && input.cvRef !== actor.cvRef) {
      throw new AppError('FORBIDDEN', 'That CV does not belong to you.');
    }

    draft.sequences.application = (draft.sequences.application ?? 0) + 1;
    const id = `RW-APP-2026-${String(draft.sequences.application).padStart(5, '0')}`;
    const application: Application = {
      id,
      jobId,
      applicantId: actor.id,
      appliedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      ...input
    };
    draft.applications.unshift(application);
    notify(draft, job.ownerId, 'application', actor.id, { jobId, applicationId: id });
    return application;
  });
}

export function withdrawApplication(actorId: string, applicationId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const app = draft.applications.find((a) => a.id === applicationId);
    if (!app) throw new AppError('NOT_FOUND', 'Application not found.');
    if (app.applicantId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You can only withdraw your own application.');
    }
    draft.applications = draft.applications.filter((a) => a.id !== applicationId);
  });
}

export function setApplicationStatus(
actorId: string,
applicationId: string,
status: ApplicationStatus)
{
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const app = draft.applications.find((a) => a.id === applicationId);
    if (!app) throw new AppError('NOT_FOUND', 'Application not found.');
    const job = draft.jobs.find((j) => j.id === app.jobId);
    if (!job) throw new AppError('NOT_FOUND', 'Job not found.');
    if (actor.role !== 'ADMIN' && job.ownerId !== actor.id) {
      throw new AppError('FORBIDDEN', 'Only the employer who posted this job can change its applicants.');
    }
    app.status = status;
    const statusKey = `applications.${status.
    toLowerCase().
    replace(/_(.)/g, (_m, c: string) => c.toUpperCase())}`;
    notify(draft, app.applicantId, 'statusChange', actor.id, { statusKey, jobId: job.id });
  });
}

/* ----------------------------------------------------------------- posts --- */

export interface PostInput {
  body: string;
  kind: PostKind;
  media: PostMedia[];
  jobId?: string;
}

export function createPost(actorId: string, input: PostInput): Post {
  if (!input.body.trim() && input.media.length === 0) {
    throw new AppError('VALIDATION', 'Write something or attach a file before posting.');
  }
  return write((draft) => {
    const actor = requireUser(draft, actorId);
    if (actor.role === 'ADMIN') {
      throw new AppError('FORBIDDEN', 'Administrator accounts do not publish feed posts.');
    }
    const asCompany = actor.role === 'EMPLOYER' && Boolean(actor.companyId);
    const post: Post = {
      id: nextId(draft, 'p'),
      authorId: asCompany ? actor.companyId as string : actor.id,
      authorType: asCompany ? 'COMPANY' : 'PERSON',
      kind: input.kind,
      body: input.body.trim(),
      createdAt: new Date().toISOString(),
      media: input.media,
      jobId: input.jobId,
      likes: [],
      shares: [],
      views: 0,
      hidden: false
    };
    draft.posts.unshift(post);
    return post;
  });
}

export function deletePost(actorId: string, postId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const post = draft.posts.find((p) => p.id === postId);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found.');
    const owners = postOwnerIds(draft, post);
    if (actor.role !== 'ADMIN' && !owners.includes(actor.id)) {
      throw new AppError('FORBIDDEN', 'You can only delete your own posts.');
    }
    draft.posts = draft.posts.filter((p) => p.id !== postId && p.sharedFrom !== postId);
    draft.comments = draft.comments.filter((c) => c.postId !== postId);
    draft.savedPosts = draft.savedPosts.filter((s) => s.postId !== postId);
  });
}

export function setPostHidden(actorId: string, postId: string, hidden: boolean) {
  write((draft) => {
    requireAdmin(draft, actorId);
    const post = draft.posts.find((p) => p.id === postId);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found.');
    post.hidden = hidden;
    postOwnerIds(draft, post).forEach((owner) =>
    notify(draft, owner, 'adminAction', actorId, { hidden: String(hidden) })
    );
  });
}

export function toggleLike(actorId: string, postId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const post = draft.posts.find((p) => p.id === postId);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found.');
    if (post.likes.includes(actor.id)) {
      post.likes = post.likes.filter((id) => id !== actor.id);
      return;
    }
    // Unique per post + user.
    post.likes.push(actor.id);
    postOwnerIds(draft, post).forEach((owner) => notify(draft, owner, 'liked', actor.id, { postId }));
  });
}

export function toggleSavePost(actorId: string, postId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const existing = draft.savedPosts.find((s) => s.userId === actor.id && s.postId === postId);
    if (existing) {
      draft.savedPosts = draft.savedPosts.filter((s) => s.id !== existing.id);
      return;
    }
    draft.savedPosts.push({
      id: nextId(draft, 'sp'),
      userId: actor.id,
      postId,
      createdAt: new Date().toISOString()
    });
  });
}

export function sharePost(actorId: string, postId: string, toFeed: boolean) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const post = draft.posts.find((p) => p.id === postId);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found.');
    if (!post.shares.includes(actor.id)) post.shares.push(actor.id);
    if (toFeed) {
      const alreadyReposted = draft.posts.some(
        (p) => p.sharedFrom === postId && p.authorId === actor.id
      );
      if (alreadyReposted) throw new AppError('CONFLICT', 'You have already shared this post.');
      // The repost references the original instead of duplicating its media.
      draft.posts.unshift({
        id: nextId(draft, 'p'),
        authorId: actor.id,
        authorType: 'PERSON',
        kind: 'TEXT',
        body: '',
        createdAt: new Date().toISOString(),
        media: [],
        likes: [],
        shares: [],
        views: 0,
        hidden: false,
        sharedFrom: postId
      });
    }
    postOwnerIds(draft, post).forEach((owner) => notify(draft, owner, 'shared', actor.id, { postId }));
  });
}

export function recordView(actorId: string, postId: string) {
  write((draft) => {
    const post = draft.posts.find((p) => p.id === postId);
    if (post) post.views += 1;
  });
}

/* -------------------------------------------------------------- comments --- */

export function addComment(actorId: string, postId: string, body: string, parentId?: string): Comment {
  if (!body.trim()) throw new AppError('VALIDATION', 'Write a comment first.');
  return write((draft) => {
    const actor = requireUser(draft, actorId);
    const post = draft.posts.find((p) => p.id === postId);
    if (!post) throw new AppError('NOT_FOUND', 'Post not found.');
    const comment: Comment = {
      id: nextId(draft, 'cm'),
      postId,
      authorId: actor.id,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
      parentId
    };
    draft.comments.push(comment);
    postOwnerIds(draft, post).forEach((owner) =>
    notify(draft, owner, 'commented', actor.id, { postId })
    );
    if (parentId) {
      const parent = draft.comments.find((c) => c.id === parentId);
      if (parent) notify(draft, parent.authorId, 'commented', actor.id, { postId });
    }
    return comment;
  });
}

export function editComment(actorId: string, commentId: string, body: string) {
  if (!body.trim()) throw new AppError('VALIDATION', 'Comment cannot be empty.');
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const comment = draft.comments.find((c) => c.id === commentId);
    if (!comment) throw new AppError('NOT_FOUND', 'Comment not found.');
    if (comment.authorId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You can only edit your own comments.');
    }
    comment.body = body.trim();
    comment.editedAt = new Date().toISOString();
  });
}

export function deleteComment(actorId: string, commentId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const comment = draft.comments.find((c) => c.id === commentId);
    if (!comment) throw new AppError('NOT_FOUND', 'Comment not found.');
    const post = draft.posts.find((p) => p.id === comment.postId);
    const owners = post ? postOwnerIds(draft, post) : [];
    const allowed = comment.authorId === actor.id || owners.includes(actor.id) || actor.role === 'ADMIN';
    if (!allowed) throw new AppError('FORBIDDEN', 'You cannot remove this comment.');
    draft.comments = draft.comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
  });
}

export function toggleCommentLike(actorId: string, commentId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const comment = draft.comments.find((c) => c.id === commentId);
    if (!comment) throw new AppError('NOT_FOUND', 'Comment not found.');
    comment.likes = comment.likes.includes(actor.id) ?
    comment.likes.filter((id) => id !== actor.id) :
    [...comment.likes, actor.id];
  });
}

/* --------------------------------------------------------------- network --- */

function findConnection(draft: Database, a: string, b: string) {
  return draft.connections.find(
    (c) =>
    c.requesterId === a && c.addresseeId === b || c.requesterId === b && c.addresseeId === a
  );
}

export function requestConnection(actorId: string, targetId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    if (actor.id === targetId) throw new AppError('VALIDATION', 'You cannot connect with yourself.');
    const target = draft.users.find((u) => u.id === targetId);
    if (!target) throw new AppError('NOT_FOUND', 'Person not found.');
    if (findConnection(draft, actor.id, targetId)) {
      throw new AppError('CONFLICT', 'A connection already exists with this person.');
    }
    draft.connections.push({
      id: nextId(draft, 'cn'),
      requesterId: actor.id,
      addresseeId: targetId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    notify(draft, targetId, 'connectionRequest', actor.id);
  });
}

export function acceptConnection(actorId: string, otherId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const conn = findConnection(draft, actor.id, otherId);
    if (!conn) throw new AppError('NOT_FOUND', 'Connection request not found.');
    if (conn.addresseeId !== actor.id) {
      throw new AppError('FORBIDDEN', 'Only the recipient can accept this request.');
    }
    conn.status = 'ACCEPTED';
    notify(draft, conn.requesterId, 'connectionAccepted', actor.id);
  });
}

export function removeConnection(actorId: string, otherId: string) {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const conn = findConnection(draft, actor.id, otherId);
    if (!conn) throw new AppError('NOT_FOUND', 'Connection not found.');
    if (conn.requesterId !== actor.id && conn.addresseeId !== actor.id) {
      throw new AppError('FORBIDDEN', 'You are not part of this connection.');
    }
    draft.connections = draft.connections.filter((c) => c.id !== conn.id);
  });
}

export function toggleFollow(actorId: string, targetId: string, targetType: 'PERSON' | 'COMPANY') {
  write((draft) => {
    const actor = requireUser(draft, actorId);
    if (targetType === 'PERSON' && targetId === actor.id) {
      throw new AppError('VALIDATION', 'You cannot follow yourself.');
    }
    const existing = draft.follows.find(
      (f) => f.userId === actor.id && f.targetId === targetId && f.targetType === targetType
    );
    if (existing) {
      draft.follows = draft.follows.filter((f) => f.id !== existing.id);
      return;
    }
    draft.follows.push({
      id: nextId(draft, 'f'),
      userId: actor.id,
      targetId,
      targetType,
      createdAt: new Date().toISOString()
    });
    if (targetType === 'PERSON') notify(draft, targetId, 'newFollower', actor.id);
  });
}

/* ------------------------------------------------------------- messaging --- */

export function openConversation(actorId: string, otherId: string): string {
  return write((draft) => {
    const actor = requireUser(draft, actorId);
    if (actor.id === otherId) throw new AppError('VALIDATION', 'Choose someone else to message.');
    const other = draft.users.find((u) => u.id === otherId);
    if (!other) throw new AppError('NOT_FOUND', 'Person not found.');

    // Anti-spam: job seekers may only message connections, or employers who
    // have received one of their applications.
    if (actor.role === 'JOB_SEEKER' && other.role === 'JOB_SEEKER') {
      const conn = findConnection(draft, actor.id, otherId);
      if (!conn || conn.status !== 'ACCEPTED') {
        throw new AppError('FORBIDDEN', 'Connect with this person before messaging them.');
      }
    }
    if (actor.role === 'EMPLOYER') {
      const ownJobs = draft.jobs.filter((j) => j.ownerId === actor.id).map((j) => j.id);
      const applied = draft.applications.some(
        (a) => a.applicantId === otherId && ownJobs.includes(a.jobId)
      );
      const conn = findConnection(draft, actor.id, otherId);
      if (!applied && !(conn && conn.status === 'ACCEPTED')) {
        throw new AppError(
          'FORBIDDEN',
          'You can message candidates who applied to your jobs, or your connections.'
        );
      }
    }

    const existing = draft.conversations.find(
      (c) => c.participantIds.includes(actor.id) && c.participantIds.includes(otherId)
    );
    if (existing) return existing.id;
    const id = nextId(draft, 'cv');
    draft.conversations.push({
      id,
      participantIds: [actor.id, otherId],
      createdAt: new Date().toISOString()
    });
    return id;
  });
}

export function sendMessage(actorId: string, conversationId: string, body: string) {
  if (!body.trim()) throw new AppError('VALIDATION', 'Write a message first.');
  write((draft) => {
    const actor = requireUser(draft, actorId);
    const conv = draft.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new AppError('NOT_FOUND', 'Conversation not found.');
    if (!conv.participantIds.includes(actor.id)) {
      throw new AppError('FORBIDDEN', 'You are not part of this conversation.');
    }
    draft.messages.push({
      id: nextId(draft, 'm'),
      conversationId,
      senderId: actor.id,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      readBy: [actor.id]
    });
    conv.participantIds.
    filter((p) => p !== actor.id).
    forEach((p) => notify(draft, p, 'message', actor.id, { conversationId }));
  });
}

export function markConversationRead(actorId: string, conversationId: string) {
  write((draft) => {
    const conv = draft.conversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participantIds.includes(actorId)) return;
    draft.messages.
    filter((m) => m.conversationId === conversationId && !m.readBy.includes(actorId)).
    forEach((m) => m.readBy.push(actorId));
  });
}

/* --------------------------------------------------------- notifications --- */

export function markNotificationsRead(actorId: string) {
  write((draft) => {
    draft.notifications.filter((n) => n.userId === actorId).forEach((n) => n.read = true);
  });
}

/* --------------------------------------------------------------- reports --- */

export function addReport(
actorId: string,
target: ReportTarget,
targetId: string,
targetLabel: string,
reason: string)
{
  write((draft) => {
    const actor = requireUser(draft, actorId);
    if (draft.reports.some((r) => r.reporterId === actor.id && r.targetId === targetId && r.state === 'PENDING')) {
      throw new AppError('CONFLICT', 'You have already reported this.');
    }
    draft.reports.unshift({
      id: nextId(draft, 'r'),
      target,
      targetId,
      targetLabel,
      reason,
      reporterId: actor.id,
      createdAt: new Date().toISOString(),
      state: 'PENDING'
    });
  });
}

export function resolveReport(actorId: string, reportId: string, state: Report['state']) {
  write((draft) => {
    requireAdmin(draft, actorId);
    const report = draft.reports.find((r) => r.id === reportId);
    if (!report) throw new AppError('NOT_FOUND', 'Report not found.');
    report.state = state;
  });
}

/* ----------------------------------------------------------------- admin --- */

export function setUserStatus(actorId: string, userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  write((draft) => {
    const admin = requireAdmin(draft, actorId);
    const target = draft.users.find((u) => u.id === userId);
    if (!target) throw new AppError('NOT_FOUND', 'User not found.');
    if (target.role === 'ADMIN') throw new AppError('FORBIDDEN', 'Administrator accounts cannot be suspended.');
    target.status = status;
    notify(draft, target.id, 'adminAction', admin.id, { status });
  });
}

export function setCompanyApproval(actorId: string, companyId: string, approval: Company['approval']) {
  write((draft) => {
    const admin = requireAdmin(draft, actorId);
    const company = draft.companies.find((c) => c.id === companyId);
    if (!company) throw new AppError('NOT_FOUND', 'Company not found.');
    company.approval = approval;
    notify(draft, company.ownerId, 'adminAction', admin.id, { approval });
  });
}

export function verifyCompany(actorId: string, companyId: string) {
  write((draft) => {
    const admin = requireAdmin(draft, actorId);
    const company = draft.companies.find((c) => c.id === companyId);
    if (!company) throw new AppError('NOT_FOUND', 'Company not found.');
    company.verified = true;
    notify(draft, company.ownerId, 'adminAction', admin.id, { verified: 'true' });
  });
}

export function setCompanyStatus(actorId: string, companyId: string, status: 'ACTIVE' | 'SUSPENDED') {
  write((draft) => {
    requireAdmin(draft, actorId);
    const company = draft.companies.find((c) => c.id === companyId);
    if (!company) throw new AppError('NOT_FOUND', 'Company not found.');
    company.status = status;
  });
}

/* ------------------------------------------------------------------ */
/* Advertisements — every mutation is administrator-only.             */
/* ------------------------------------------------------------------ */

export interface AdvertisementInput {
  title: string;
  description: string;
  type: AdvertisementType;
  imageUrl?: string;
  videoUrl?: string;
  animationUrl?: string;
  posterUrl?: string;
  targetUrl?: string;
  buttonText?: string;
  startDate: string;
  endDate: string;
  status: AdvertisementStatus;
}

const AD_MEDIA_FIELDS = ['imageUrl', 'videoUrl', 'animationUrl', 'posterUrl'] as const;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function mediaRefsOf(ad: Partial<Pick<Advertisement, (typeof AD_MEDIA_FIELDS)[number]>>): string[] {
  return AD_MEDIA_FIELDS.map((f) => ad[f]).filter((v): v is string => !!v);
}

function isAcceptableMediaRef(ref: string): boolean {
  if (isStoredMedia(ref)) return /^media:[a-f0-9]{24}$/.test(ref);
  try {
    return new URL(ref).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalises and validates ad input; throws VALIDATION with a precise message. */
function cleanAdvertisement(input: AdvertisementInput): AdvertisementInput {
  const title = input.title.trim();
  const description = input.description.trim();
  const targetUrl = input.targetUrl?.trim() || undefined;
  const buttonText = input.buttonText?.trim() || undefined;

  if (title.length < 3) throw new AppError('VALIDATION', 'Give the advertisement a title of at least 3 characters.');
  if (title.length > 120) throw new AppError('VALIDATION', 'Keep the title under 120 characters.');
  if (description.length > 1000) throw new AppError('VALIDATION', 'Keep the content under 1,000 characters.');
  if (!AD_TYPES.includes(input.type)) throw new AppError('VALIDATION', 'Choose a valid advertisement type.');
  if (!AD_STATUSES.includes(input.status)) throw new AppError('VALIDATION', 'Choose a valid status.');
  if (!DATE_KEY.test(input.startDate) || !DATE_KEY.test(input.endDate)) {
    throw new AppError('VALIDATION', 'Set both a start date and an end date.');
  }
  if (input.endDate < input.startDate) {
    throw new AppError('VALIDATION', 'The end date must be on or after the start date.');
  }
  if (targetUrl && !isSafeTargetUrl(targetUrl)) {
    throw new AppError('VALIDATION', 'The link must start with https://, http:// or / for a page on this site.');
  }
  if (buttonText && !targetUrl) throw new AppError('VALIDATION', 'Add a link for the button to open.');
  if (buttonText && buttonText.length > 30) throw new AppError('VALIDATION', 'Keep the button text under 30 characters.');

  const cleaned: AdvertisementInput = {
    title,
    description,
    type: input.type,
    targetUrl,
    buttonText,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status
  };
  for (const field of AD_MEDIA_FIELDS) {
    const value = input[field]?.trim();
    if (!value) continue;
    if (!isAcceptableMediaRef(value)) throw new AppError('VALIDATION', 'One of the media files is not valid.');
    cleaned[field] = value;
  }

  if (cleaned.status === 'EXPIRED') {
    throw new AppError('VALIDATION', 'Advertisements expire automatically after their end date.');
  }
  if (cleaned.status === 'PUBLISHED') assertPublishable(cleaned);
  return cleaned;
}

function assertPublishable(ad: AdvertisementInput | Advertisement) {
  if (isAdPastEnd(ad)) {
    throw new AppError('VALIDATION', 'This advertisement has already ended. Move the end date forward to publish it.');
  }
  const need: Record<AdvertisementType, [boolean, string]> = {
    TEXT: [ad.description.length > 0, 'Add some content before publishing a text advertisement.'],
    IMAGE: [!!ad.imageUrl, 'Upload an image before publishing an image advertisement.'],
    ANIMATION: [!!ad.animationUrl, 'Upload an animation before publishing an animation advertisement.'],
    VIDEO: [!!ad.videoUrl, 'Upload a video before publishing a video advertisement.'],
    MIXED: [
    !!(ad.imageUrl || ad.videoUrl || ad.animationUrl),
    'Add at least one image, animation or video before publishing mixed content.']

  };
  const [ok, message] = need[ad.type];
  if (!ok) throw new AppError('VALIDATION', message);
}

/** Deletes stored files that no advertisement references any more. */
function releaseMedia(draft: Database, refs: string[]) {
  const inUse = new Set(draft.advertisements.flatMap((a) => mediaRefsOf(a)));
  refs.
  filter((ref) => isStoredMedia(ref) && !inUse.has(ref)).
  forEach((ref) => {
    deleteMedia(ref).catch(() => undefined);
  });
}

export function createAdvertisement(actorId: string, input: AdvertisementInput): Advertisement {
  return write((draft) => {
    const admin = requireAdmin(draft, actorId);
    const clean = cleanAdvertisement(input);
    const now = new Date().toISOString();
    const ad: Advertisement = {
      ...clean,
      id: nextId(draft, 'ad'),
      createdBy: admin.id,
      createdAt: now,
      updatedAt: now
    };
    draft.advertisements.unshift(ad);
    return ad;
  });
}

export function updateAdvertisement(actorId: string, adId: string, input: AdvertisementInput): Advertisement {
  return write((draft) => {
    requireAdmin(draft, actorId);
    const index = draft.advertisements.findIndex((a) => a.id === adId);
    if (index < 0) throw new AppError('NOT_FOUND', 'Advertisement not found.');
    const previous = draft.advertisements[index];
    // An expired ad may be saved as-is while its dates are being edited.
    const clean = cleanAdvertisement(
      input.status === 'EXPIRED' && previous.status === 'EXPIRED' ? { ...input, status: 'UNPUBLISHED' } : input
    );
    if (input.status === 'EXPIRED' && isAdPastEnd(clean)) clean.status = 'EXPIRED';
    const next: Advertisement = {
      ...clean,
      id: previous.id,
      createdBy: previous.createdBy,
      createdAt: previous.createdAt,
      updatedAt: new Date().toISOString()
    };
    draft.advertisements[index] = next;
    releaseMedia(draft, mediaRefsOf(previous));
    return next;
  });
}

export function setAdvertisementStatus(actorId: string, adId: string, status: 'PUBLISHED' | 'UNPUBLISHED' | 'DRAFT') {
  write((draft) => {
    requireAdmin(draft, actorId);
    const ad = draft.advertisements.find((a) => a.id === adId);
    if (!ad) throw new AppError('NOT_FOUND', 'Advertisement not found.');
    if (status === 'PUBLISHED') assertPublishable(ad);
    ad.status = status;
    ad.updatedAt = new Date().toISOString();
  });
}

export function deleteAdvertisement(actorId: string, adId: string) {
  write((draft) => {
    requireAdmin(draft, actorId);
    const ad = draft.advertisements.find((a) => a.id === adId);
    if (!ad) throw new AppError('NOT_FOUND', 'Advertisement not found.');
    draft.advertisements = draft.advertisements.filter((a) => a.id !== adId);
    releaseMedia(draft, mediaRefsOf(ad));
  });
}

export type AdMediaKind = 'image' | 'animation' | 'video';

const AD_UPLOAD_KIND: Record<AdMediaKind, UploadKind> = {
  image: 'adImage',
  animation: 'adAnimation',
  video: 'adVideo'
};

/** Validates and stores an advertisement media file. Administrator-only. */
export async function uploadAdvertisementMedia(actorId: string, file: File, kind: AdMediaKind): Promise<string> {
  requireAdmin(getDatabase(), actorId);
  const name = validateUpload(file, AD_UPLOAD_KIND[kind]);
  await verifyFileSignature(file);
  try {
    return await putMedia(file, name);
  } catch {
    throw new AppError('STORAGE', 'The file could not be stored. Free up browser storage and try again.');
  }
}

/** Removes uploads from an abandoned edit that no saved ad references. */
export function discardAdvertisementMedia(actorId: string, refs: string[]) {
  const current = getDatabase();
  requireAdmin(current, actorId);
  releaseMedia(current, refs);
}