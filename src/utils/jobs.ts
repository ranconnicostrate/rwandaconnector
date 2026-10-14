import type { Company, Job } from '../types';

export const JOB_TYPE_KEY: Record<Job['type'], string> = {
  FULL_TIME: 'jobs.fullTime',
  PART_TIME: 'jobs.partTime',
  CONTRACT: 'jobs.contract',
  INTERNSHIP: 'jobs.internship'
};

/**
 * Single source of truth for whether a job is visible to job seekers.
 *
 * A job goes live as soon as the employer publishes it. It only disappears if
 * a moderator rejects it, the employer closes it, the deadline passes, or the
 * company is suspended — a company still awaiting verification can hire.
 */
export function isJobVisible(job: Job, company?: Company): boolean {
  if (!job.open) return false;
  if (job.approval === 'REJECTED') return false;
  if (company && company.status === 'SUSPENDED') return false;
  return true;
}

/** Visible jobs, newest posting first. */
export function visibleJobs(jobs: Job[], companyById: (id: string) => Company | undefined): Job[] {
  return jobs.
  filter((job) => isJobVisible(job, companyById(job.companyId))).
  sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
}

/** True once the advertised deadline has passed. */
export function isExpired(job: Job): boolean {
  return new Date(job.deadline).getTime() < Date.now();
}