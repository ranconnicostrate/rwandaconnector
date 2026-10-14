import type { Role } from '../types';

export interface SeedCredential {
  userId: string;
  email: string;
  password: string;
  role: Role;
  labelKey: string;
  /** Shown on the sign-in screen so the platform can be reviewed end to end. */
  documented: boolean;
}

/**
 * Accounts created on first run. Passwords are hashed (PBKDF2-SHA256) during
 * seeding and never stored in plain text. The ADMIN account is provisioned here
 * by the data layer and can never be self-selected during registration.
 */
export const SEED_CREDENTIALS: SeedCredential[] = [
{
  userId: 'u1',
  email: 'jean.bosco@example.rw',
  password: 'Seeker@2026',
  role: 'JOB_SEEKER',
  labelKey: 'roles.jobSeeker',
  documented: true
},
{
  userId: 'u21',
  email: 'grace.umutoni@abcrwanda.rw',
  password: 'Employer@2026',
  role: 'EMPLOYER',
  labelKey: 'roles.employer',
  documented: true
},
{
  userId: 'u30',
  email: 'admin@rwandaconnect.rw',
  password: 'Admin@2026',
  role: 'ADMIN',
  labelKey: 'roles.admin',
  documented: true
},
{ userId: 'u2', email: 'dieudonne.n@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u3', email: 'mireille.m@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u4', email: 'jean.claude@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u5', email: 'claudine.u@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u6', email: 'aline.u@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u7', email: 'eric.mugisha@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u8', email: 'sandrine.i@example.rw', password: 'Rwanda@2026', role: 'JOB_SEEKER', labelKey: 'roles.jobSeeker', documented: false },
{ userId: 'u20', email: 'patrick.rwigema@rdb.rw', password: 'Rwanda@2026', role: 'EMPLOYER', labelKey: 'roles.employer', documented: false }];


export const DOCUMENTED_CREDENTIALS = SEED_CREDENTIALS.filter((c) => c.documented);