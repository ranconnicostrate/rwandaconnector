import type { Advertisement } from '../types';

/** Starting advertisements, attached to the first administrator on seed. */
export const seedAdvertisements: Omit<Advertisement, 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
{
  id: 'ad-seed-1',
  title: 'New Software Developer Jobs Available',
  description:
  'Discover new technology jobs across Kigali and apply directly through RwandaConnect. Frontend, backend, mobile and data roles are open now.',
  type: 'IMAGE',
  imageUrl: "/97d7429f-18c0-4c38-8270-0829abaad345.jpg",

  targetUrl: '/jobs?q=developer',
  buttonText: 'Find Jobs',
  startDate: '2026-09-20',
  endDate: '2026-10-15',
  status: 'PUBLISHED'
},
{
  id: 'ad-seed-2',
  title: 'Kigali Career Fair 2026',
  description:
  'Meet more than forty employers in one day at the Kigali Convention Centre. Bring your CV — interviews happen on the spot.',
  type: 'VIDEO',
  posterUrl: "/559e2b40-cbd5-4a9f-af90-1ec94a25379f.jpg",

  targetUrl: '/companies',
  buttonText: 'See employers',
  startDate: '2026-10-05',
  endDate: '2026-10-20',
  status: 'DRAFT'
},
{
  id: 'ad-seed-3',
  title: 'Free Digital Skills Training Program',
  description:
  'A six-week evening program in web development and data basics for young Rwandans. Certificates are awarded on completion and can be added to your profile.',
  type: 'MIXED',
  imageUrl: "/9cad60c7-cb1d-4e04-baab-db12911d29ff.jpg",

  targetUrl: '/jobs?q=internship',
  buttonText: 'Learn more',
  startDate: '2026-09-25',
  endDate: '2026-10-30',
  status: 'PUBLISHED'
},
{
  id: 'ad-seed-4',
  title: 'Graduate Internship Week',
  description: 'Paid internships for recent graduates across banking, telecoms and public service.',
  type: 'TEXT',
  targetUrl: '/jobs?q=internship',
  buttonText: 'Browse internships',
  startDate: '2026-08-01',
  endDate: '2026-08-31',
  status: 'PUBLISHED'
}];