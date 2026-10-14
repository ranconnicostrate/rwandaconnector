import type { ApplicationStatus } from '../types';

export const STATUS_KEY: Record<ApplicationStatus, string> = {
  SUBMITTED: 'applications.submitted',
  UNDER_REVIEW: 'applications.underReview',
  SHORTLISTED: 'applications.shortlisted',
  INTERVIEW: 'applications.interview',
  HIRED: 'applications.hired',
  REJECTED: 'applications.rejected'
};

export const STATUS_TONE: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-surface-muted text-ink-700',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-violet-50 text-violet-700',
  INTERVIEW: 'bg-amber-50 text-amber-700',
  HIRED: 'bg-leaf-50 text-leaf-600',
  REJECTED: 'bg-red-50 text-red-600'
};

export const ALL_STATUSES: ApplicationStatus[] = [
'SUBMITTED',
'UNDER_REVIEW',
'SHORTLISTED',
'INTERVIEW',
'HIRED',
'REJECTED'];