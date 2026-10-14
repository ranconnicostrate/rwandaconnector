export type Role = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

/** Public profile shape used everywhere in the UI. Never contains credentials. */
export interface Person {
  id: string;
  name: string;
  email: string;
  headline: string;
  location: string;
  /** Fallback avatar colour used when no photo has been uploaded. */
  avatar: string;
  /** Uploaded profile photo (data URL). */
  photo?: string;
  role: Role;
  status: AccountStatus;
  companyId?: string;
  skills: string[];
  industry?: string;
  university?: string;
  about?: string;
  phone?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certifications?: string[];
  languages?: string[];
  cvName?: string;
  /** `media:<id>` reference to the CV file in private browser storage. */
  cvRef?: string;
  cvSize?: number;
  cvUploadedAt?: string;
  language?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  /** `YYYY-MM` */
  start: string;
  /** `YYYY-MM`; empty while current. */
  end: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
}

/** Stored user record — credentials never leave the data layer. */
export interface StoredUser extends Person {
  passwordHash: string;
  salt: string;
  createdAt: string;
  /** Linked Google / LinkedIn accounts. Never exposed outside the data layer. */
  identities?: LinkedIdentity[];
}

export interface LinkedIdentity {
  provider: 'google' | 'linkedin';
  subject: string;
  linkedAt: string;
}

export type ConnectionState = 'NONE' | 'PENDING' | 'CONNECTED' | 'INCOMING';

export interface Connection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'PERSON' | 'COMPANY';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  logoColor: string;
  /** Uploaded logo (data URL). */
  logoUrl?: string;
  industry: string;
  location: string;
  about: string;
  website: string;
  employees: string;
  verified: boolean;
  approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: AccountStatus;
  ownerId: string;
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  district: string;
  salaryMin: number;
  salaryMax: number;
  currency: 'RWF';
  type: EmploymentType;
  experience: string;
  education: string;
  positions: number;
  postedAt: string;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  open: boolean;
  approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  ownerId: string;
  /** Missing on older records — treated as ON_SITE. */
  workLocationType?: WorkLocationType;
  /** WGS84 workplace coordinates. Absent for remote jobs and unpinned jobs. */
  latitude?: number;
  longitude?: number;
  country?: string;
  province?: string;
  sector?: string;
  streetAddress?: string;
}

export type WorkLocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type ApplicationStatus =
'SUBMITTED' |
'UNDER_REVIEW' |
'SHORTLISTED' |
'INTERVIEW' |
'HIRED' |
'REJECTED';

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  appliedAt: string;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  skills: string;
  expectedSalary: number;
  cvName: string;
  /** Stored CV file, when the applicant attached one. */
  cvRef?: string;
  coverLetter: string;
  answers: Record<string, string>;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  likes: string[];
  parentId?: string;
}

export type PostKind = 'TEXT' | 'IMAGE' | 'VIDEO' | 'ARTICLE' | 'JOB';

export interface PostMedia {
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  name: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorType: 'PERSON' | 'COMPANY';
  kind: PostKind;
  body: string;
  createdAt: string;
  media: PostMedia[];
  mediaOverlay?: {title: string;body: string;cta: string;};
  jobId?: string;
  /** Unique per post + user — enforced by the data layer. */
  likes: string[];
  shares: string[];
  views: number;
  hidden: boolean;
  sharedFrom?: string;
}

export type NotificationKind =
'connectionRequest' |
'connectionAccepted' |
'newFollower' |
'liked' |
'commented' |
'shared' |
'message' |
'application' |
'statusChange' |
'newJob' |
'adminAction';

export interface AppNotification {
  id: string;
  /** Recipient. */
  userId: string;
  kind: NotificationKind;
  actorId: string;
  createdAt: string;
  read: boolean;
  meta?: Record<string, string>;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readBy: string[];
}

export type ReportTarget = 'POST' | 'COMMENT' | 'USER' | 'JOB' | 'COMPANY';

export interface Report {
  id: string;
  target: ReportTarget;
  targetId: string;
  targetLabel: string;
  reason: string;
  reporterId: string;
  createdAt: string;
  state: 'PENDING' | 'RESOLVED' | 'REJECTED';
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  issuedAt: string;
}

export type AdvertisementType = 'TEXT' | 'IMAGE' | 'ANIMATION' | 'VIDEO' | 'MIXED';
export type AdvertisementStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'EXPIRED';

/**
 * Media fields hold either an `https://` URL or a `media:<id>` reference to a
 * file stored in the browser media store (IndexedDB).
 */
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  type: AdvertisementType;
  imageUrl?: string;
  videoUrl?: string;
  animationUrl?: string;
  /** Optional poster frame shown before a video plays. */
  posterUrl?: string;
  targetUrl?: string;
  buttonText?: string;
  /** Inclusive calendar dates, `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  status: AdvertisementStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  version: number;
  advertisements: Advertisement[];
  users: StoredUser[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  posts: Post[];
  comments: Comment[];
  connections: Connection[];
  follows: Follow[];
  conversations: Conversation[];
  messages: Message[];
  notifications: AppNotification[];
  reports: Report[];
  savedJobs: SavedJob[];
  savedPosts: SavedPost[];
  sequences: Record<string, number>;
}