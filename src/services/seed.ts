import { SEED_CREDENTIALS } from '../data/credentials';
import { IMAGES } from '../data/posts';
import { hashPassword, randomHex } from './crypto';
import type {
  Application,
  Comment,
  Company,
  Connection,
  Conversation,
  Database,
  Follow,
  Job,
  Message,
  AppNotification,
  Person,
  Post,
  Report,
  SavedJob,
  StoredUser } from
'../types';

const hour = 3_600_000;
const day = 24 * hour;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const ahead = (ms: number) => new Date(Date.now() + ms).toISOString();

type SeedPerson = Omit<Person, 'email'>;

const PROFILES: SeedPerson[] = [
{
  id: 'u1',
  name: 'Jean Bosco Habimana',
  headline: 'Junior Software Developer',
  location: 'Kigali',
  avatar: '#103764',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['React', 'Node.js', 'SQL', 'UI Design'],
  industry: 'Technology',
  university: 'University of Rwanda',
  about:
  'Junior software developer based in Kigali focused on accessible, reliable web products. Looking for a role where I can grow into full-stack work.'
},
{
  id: 'u2',
  name: 'Dieudonné Nsengiyumva',
  headline: 'Software Developer',
  location: 'Kigali',
  avatar: '#1668e3',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['React', 'Django'],
  industry: 'Technology',
  university: 'University of Rwanda'
},
{
  id: 'u3',
  name: 'Mireille Mukankomeje',
  headline: 'Marketing Manager',
  location: 'Huye',
  avatar: '#1f9d55',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['Brand Strategy', 'Content'],
  industry: 'Marketing',
  university: 'University of Rwanda'
},
{
  id: 'u4',
  name: 'Jean Claude Niyonzima',
  headline: 'Data Analyst',
  location: 'Musanze',
  avatar: '#0c2c51',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['Python', 'Power BI', 'SQL'],
  industry: 'Technology',
  university: 'INES Ruhengeri'
},
{
  id: 'u5',
  name: 'Claudine Uwamahoro',
  headline: 'Graphic Designer',
  location: 'Rubavu',
  avatar: '#eeb821',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['Figma', 'Illustration'],
  industry: 'Creative',
  university: 'IPRC Kigali'
},
{
  id: 'u6',
  name: 'Aline Uwimana',
  headline: 'Software Developer',
  location: 'Kigali',
  avatar: '#2f7fee',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['Java', 'Spring', 'React'],
  industry: 'Technology',
  university: 'AUCA'
},
{
  id: 'u7',
  name: 'Eric Mugisha',
  headline: 'Civil Engineer',
  location: 'Kigali',
  avatar: '#178047',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  skills: ['AutoCAD', 'Site Management'],
  industry: 'Construction',
  university: 'University of Rwanda'
},
{
  id: 'u8',
  name: 'Sandrine Ingabire',
  headline: 'HR Officer',
  location: 'Kigali',
  avatar: '#16467f',
  role: 'JOB_SEEKER',
  status: 'SUSPENDED',
  skills: ['Recruitment'],
  industry: 'Human Resources',
  university: 'ULK'
},
{
  id: 'u20',
  name: 'Patrick Rwigema',
  headline: 'Talent Acquisition Lead · Rwanda Development Board',
  location: 'Kigali',
  avatar: '#103764',
  role: 'EMPLOYER',
  status: 'ACTIVE',
  companyId: 'c1',
  skills: [],
  industry: 'Public Sector'
},
{
  id: 'u21',
  name: 'Grace Umutoni',
  headline: 'Recruiter · ABC Rwanda Ltd',
  location: 'Kigali',
  avatar: '#1f9d55',
  role: 'EMPLOYER',
  status: 'ACTIVE',
  companyId: 'c2',
  skills: [],
  industry: 'Technology'
},
{
  id: 'u30',
  name: 'Platform Administrator',
  headline: 'RwandaConnect Operations',
  location: 'Kigali',
  avatar: '#08203c',
  role: 'ADMIN',
  status: 'ACTIVE',
  skills: []
}];


const COMPANIES: Company[] = [
{
  id: 'c1',
  name: 'Rwanda Development Board',
  logo: 'RDB',
  logoColor: '#103764',
  industry: 'Public Sector',
  location: 'Kigali, Rwanda',
  about:
  'The Rwanda Development Board accelerates economic growth by supporting investment, tourism, exports and skills development across Rwanda.',
  website: 'rdb.rw',
  employees: '500-1000',
  verified: true,
  approval: 'APPROVED',
  status: 'ACTIVE',
  ownerId: 'u20'
},
{
  id: 'c2',
  name: 'ABC Rwanda Ltd',
  logo: 'ABC',
  logoColor: '#1668e3',
  industry: 'Technology',
  location: 'Kigali, Rwanda',
  about:
  'ABC Rwanda Ltd builds digital products for banks, insurers and public institutions across East Africa.',
  website: 'abcrwanda.rw',
  employees: '50-200',
  verified: true,
  approval: 'APPROVED',
  status: 'ACTIVE',
  ownerId: 'u21'
},
{
  id: 'c3',
  name: 'Prime Bank Rwanda',
  logo: 'PB',
  logoColor: '#0c2c51',
  industry: 'Banking',
  location: 'Kigali, Rwanda',
  about: 'A commercial bank serving individuals and businesses with modern financial services.',
  website: 'primebank.rw',
  employees: '200-500',
  verified: true,
  approval: 'APPROVED',
  status: 'ACTIVE',
  ownerId: 'u20'
},
{
  id: 'c4',
  name: 'Rwanda Tourism Board',
  logo: 'RTB',
  logoColor: '#1f9d55',
  industry: 'Tourism',
  location: 'Kigali, Rwanda',
  about: 'Promoting Rwanda as a premier destination for conservation, conference and leisure tourism.',
  website: 'visitrwanda.com',
  employees: '100-200',
  verified: true,
  approval: 'APPROVED',
  status: 'ACTIVE',
  ownerId: 'u20'
},
{
  id: 'c5',
  name: 'Vision School Huye',
  logo: 'VS',
  logoColor: '#eeb821',
  industry: 'Education',
  location: 'Huye, Rwanda',
  about: 'A secondary school focused on science, technology and character formation.',
  website: 'visionschool.rw',
  employees: '50-100',
  verified: false,
  approval: 'PENDING',
  status: 'ACTIVE',
  ownerId: 'u20'
},
{
  id: 'c6',
  name: 'Kigali Serena Hotel',
  logo: 'KS',
  logoColor: '#178047',
  industry: 'Hospitality',
  location: 'Kigali, Rwanda',
  about: 'A five-star hotel in the heart of Kigali hosting conferences, events and travellers.',
  website: 'serenahotels.com',
  employees: '200-500',
  verified: true,
  approval: 'APPROVED',
  status: 'ACTIVE',
  ownerId: 'u20'
},
{
  id: 'c7',
  name: 'Rwanda Construction Group',
  logo: 'RCG',
  logoColor: '#16467f',
  industry: 'Construction',
  location: 'Kigali, Rwanda',
  about: 'Infrastructure and building contractors delivering projects across all provinces.',
  website: 'rcg.rw',
  employees: '500-1000',
  verified: false,
  approval: 'PENDING',
  status: 'ACTIVE',
  ownerId: 'u20'
}];


const baseJob = {
  currency: 'RWF' as const,
  positions: 1,
  responsibilities: [] as string[],
  requirements: [] as string[],
  benefits: [] as string[]
};

const JOBS: Job[] = [
{
  ...baseJob,
  id: 'j1',
  title: 'Software Developer',
  companyId: 'c2',
  location: 'Kigali',
  district: 'Gasabo',
  salaryMin: 500000,
  salaryMax: 800000,
  type: 'FULL_TIME',
  experience: '1-2 years',
  education: "Bachelor's degree",
  positions: 2,
  postedAt: ago(2 * day),
  deadline: ahead(18 * day),
  description:
  'ABC Rwanda Ltd is looking for a Software Developer to join the digital banking team building products used by thousands of Rwandans every day.',
  responsibilities: [
  'Build and maintain web features in React and Node.js',
  'Collaborate with designers and product owners',
  'Write tests and participate in code reviews'],

  requirements: [
  "Bachelor's degree in Computer Science or a related field",
  '1-2 years of professional development experience',
  'Strong JavaScript and SQL fundamentals'],

  benefits: ['Medical insurance', 'Transport allowance', 'Annual training budget'],
  skills: ['React', 'Node.js', 'SQL'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u21'
},
{
  ...baseJob,
  id: 'j2',
  title: 'Accountant',
  companyId: 'c3',
  location: 'Kigali',
  district: 'Nyarugenge',
  salaryMin: 400000,
  salaryMax: 600000,
  type: 'FULL_TIME',
  experience: '2-4 years',
  education: "Bachelor's degree",
  postedAt: ago(3 * day),
  deadline: ahead(12 * day),
  description:
  'Prime Bank Rwanda seeks an Accountant to support financial reporting, reconciliation and regulatory filings.',
  responsibilities: ['Prepare monthly reports', 'Reconcile accounts', 'Support audits'],
  requirements: ['CPA part qualification', 'Strong Excel skills'],
  benefits: ['Medical cover', 'Staff loan scheme'],
  skills: ['Accounting', 'Excel', 'IFRS'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j3',
  title: 'Marketing Officer',
  companyId: 'c4',
  location: 'Kigali',
  district: 'Kicukiro',
  salaryMin: 350000,
  salaryMax: 500000,
  type: 'CONTRACT',
  experience: '1-3 years',
  education: "Bachelor's degree",
  postedAt: ago(4 * day),
  deadline: ahead(9 * day),
  description:
  'Rwanda Tourism Board is hiring a Marketing Officer to grow destination campaigns across digital channels.',
  responsibilities: ['Run digital campaigns', 'Manage social channels', 'Report on performance'],
  requirements: ['Marketing degree', 'Campaign experience'],
  benefits: ['Travel opportunities', 'Communication allowance'],
  skills: ['Content', 'Social Media', 'Analytics'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j4',
  title: 'Frontend Developer',
  companyId: 'c2',
  location: 'Kigali',
  district: 'Gasabo',
  salaryMin: 600000,
  salaryMax: 900000,
  type: 'FULL_TIME',
  experience: '2-4 years',
  education: "Bachelor's degree",
  postedAt: ago(1 * day),
  deadline: ahead(21 * day),
  description:
  'Own the front-end of our customer platform and deliver accessible, fast interfaces for web and mobile.',
  responsibilities: ['Own front-end architecture', 'Improve accessibility', 'Mentor juniors'],
  requirements: ['Strong React and TypeScript', 'Design system experience'],
  benefits: ['Hybrid work', 'Medical insurance'],
  skills: ['React', 'TypeScript', 'Accessibility'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u21'
},
{
  ...baseJob,
  id: 'j5',
  title: 'Civil Engineer',
  companyId: 'c7',
  location: 'Kigali',
  district: 'Gasabo',
  salaryMin: 700000,
  salaryMax: 1100000,
  type: 'FULL_TIME',
  experience: '3-5 years',
  education: "Bachelor's degree",
  postedAt: ago(1 * day),
  deadline: ahead(25 * day),
  description: 'Supervise road and building projects from design review through handover.',
  responsibilities: ['Supervise site works', 'Review designs', 'Report progress'],
  requirements: ['Registered engineer', 'Site supervision experience'],
  benefits: ['Site allowance', 'Medical cover'],
  skills: ['AutoCAD', 'Project Management'],
  open: true,
  approval: 'PENDING',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j6',
  title: 'Teacher (Sciences)',
  companyId: 'c5',
  location: 'Huye',
  district: 'Huye',
  salaryMin: 250000,
  salaryMax: 380000,
  type: 'PART_TIME',
  experience: '1-2 years',
  education: "Bachelor's degree",
  postedAt: ago(5 * day),
  deadline: ahead(7 * day),
  description: 'Teach physics and chemistry to senior secondary students.',
  responsibilities: ['Prepare lessons', 'Assess students', 'Run the science club'],
  requirements: ['Education degree', 'Teaching licence'],
  benefits: ['Housing support', 'Lunch provided'],
  skills: ['Teaching', 'Curriculum Design'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j7',
  title: 'Hotel Manager',
  companyId: 'c6',
  location: 'Kigali',
  district: 'Nyarugenge',
  salaryMin: 900000,
  salaryMax: 1400000,
  type: 'FULL_TIME',
  experience: '5+ years',
  education: "Bachelor's degree",
  postedAt: ago(6 * day),
  deadline: ahead(14 * day),
  description: 'Lead daily hotel operations, guest experience and departmental budgets.',
  responsibilities: ['Lead operations', 'Own guest satisfaction', 'Manage budgets'],
  requirements: ['Hospitality management background', 'Team leadership'],
  benefits: ['Performance bonus', 'Staff meals'],
  skills: ['Operations', 'Leadership'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j8',
  title: 'Data Analyst Intern',
  companyId: 'c1',
  location: 'Kigali',
  district: 'Gasabo',
  salaryMin: 150000,
  salaryMax: 250000,
  type: 'INTERNSHIP',
  experience: 'Entry level',
  education: 'Diploma',
  positions: 5,
  postedAt: ago(2 * day),
  deadline: ahead(10 * day),
  description:
  'Join the RDB analytics team for a six-month internship supporting investment reporting.',
  responsibilities: ['Clean datasets', 'Build dashboards', 'Support reporting'],
  requirements: ['Excel and SQL basics', 'Final-year student or graduate'],
  benefits: ['Mentorship', 'Transport stipend'],
  skills: ['SQL', 'Excel', 'Power BI'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j9',
  title: 'Customer Support Officer',
  companyId: 'c3',
  location: 'Musanze',
  district: 'Musanze',
  salaryMin: 300000,
  salaryMax: 420000,
  type: 'FULL_TIME',
  experience: '1-2 years',
  education: 'Diploma',
  postedAt: ago(8 * day),
  deadline: ahead(4 * day),
  description: 'Support branch customers by phone and in person with accounts and digital banking.',
  responsibilities: ['Resolve customer queries', 'Escalate issues', 'Record feedback'],
  requirements: ['Fluent Kinyarwanda and English', 'Service experience'],
  benefits: ['Medical cover', 'Shift allowance'],
  skills: ['Communication', 'Banking'],
  open: false,
  approval: 'APPROVED',
  ownerId: 'u20'
},
{
  ...baseJob,
  id: 'j10',
  title: 'UI/UX Designer',
  companyId: 'c2',
  location: 'Kigali',
  district: 'Kicukiro',
  salaryMin: 550000,
  salaryMax: 850000,
  type: 'FULL_TIME',
  experience: '2-4 years',
  education: "Bachelor's degree",
  postedAt: ago(3 * day),
  deadline: ahead(16 * day),
  description: 'Design end-to-end product experiences for fintech clients across East Africa.',
  responsibilities: ['Run discovery', 'Design flows', 'Maintain the design system'],
  requirements: ['Strong portfolio', 'Figma expertise'],
  benefits: ['Hybrid work', 'Conference budget'],
  skills: ['Figma', 'Research', 'Design Systems'],
  open: true,
  approval: 'APPROVED',
  ownerId: 'u21'
}];


const POSTS: Post[] = [
{
  id: 'p1',
  authorId: 'c1',
  authorType: 'COMPANY',
  kind: 'IMAGE',
  body: 'We are excited to announce 5 new internship opportunities for young talents in Rwanda. If you are passionate about innovation and development, this is your chance to gain real work experience and grow your career!\n\n#Rwanda #Internship #Career #YoungTalent',
  createdAt: ago(2 * hour),
  media: [{ kind: 'IMAGE', url: IMAGES.postBuildings, name: 'internships.jpg' }],
  mediaOverlay: {
    title: 'Internship Opportunities',
    body: 'Join our team and make an impact',
    cta: 'Apply Now'
  },
  jobId: 'j8',
  likes: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
  shares: ['u3', 'u6'],
  views: 842,
  hidden: false
},
{
  id: 'p2',
  authorId: 'c2',
  authorType: 'COMPANY',
  kind: 'JOB',
  body: 'We are hiring! ABC Rwanda Ltd is looking for a Frontend Developer to join our digital banking team in Kigali. Two years of React experience and a passion for accessible interfaces will take you far here.',
  createdAt: ago(7 * hour),
  media: [],
  jobId: 'j4',
  likes: ['u1', 'u6', 'u4'],
  shares: ['u2'],
  views: 521,
  hidden: false
},
{
  id: 'p3',
  authorId: 'u6',
  authorType: 'PERSON',
  kind: 'TEXT',
  body: 'I have completed my Software Engineering certification at the Rwanda Coding Academy and I am now looking for a junior developer opportunity in Kigali. Grateful to everyone who supported me along the way.',
  createdAt: ago(20 * hour),
  media: [],
  likes: ['u1', 'u2', 'u3', 'u5'],
  shares: [],
  views: 184,
  hidden: false
},
{
  id: 'p4',
  authorId: 'u3',
  authorType: 'PERSON',
  kind: 'IMAGE',
  body: 'Our team spent the weekend mentoring students in Huye on digital marketing fundamentals. Watching young people discover what they can build is the best part of this work.',
  createdAt: ago(30 * hour),
  media: [{ kind: 'IMAGE', url: IMAGES.hills, name: 'huye-workshop.jpg' }],
  likes: ['u1', 'u4', 'u7'],
  shares: ['u5'],
  views: 226,
  hidden: false
},
{
  id: 'p5',
  authorId: 'u1',
  authorType: 'PERSON',
  kind: 'TEXT',
  body: 'Shipped my first open-source contribution today — a small accessibility fix to a component library used by teams across East Africa. Small steps, real impact.',
  createdAt: ago(54 * hour),
  media: [],
  likes: ['u2', 'u6'],
  shares: [],
  views: 94,
  hidden: false
}];


const COMMENTS: Comment[] = [
{
  id: 'cm1',
  postId: 'p1',
  authorId: 'u6',
  body: "This is a great opportunity! I'm definitely going to apply.",
  createdAt: ago(1 * hour),
  likes: ['u1', 'u2']
},
{
  id: 'cm2',
  postId: 'p1',
  authorId: 'u4',
  body: 'Is the internship open to recent graduates from outside Kigali?',
  createdAt: ago(1 * hour),
  likes: []
},
{
  id: 'cm3',
  postId: 'p1',
  authorId: 'u20',
  body: 'Yes, applications are open to graduates from all provinces.',
  createdAt: ago(1 * hour),
  likes: ['u4'],
  parentId: 'cm2'
},
{
  id: 'cm4',
  postId: 'p3',
  authorId: 'u2',
  body: 'Congratulations Aline! Your dedication paid off.',
  createdAt: ago(18 * hour),
  likes: ['u6']
},
{
  id: 'cm5',
  postId: 'p2',
  authorId: 'u1',
  body: 'Applied this morning. Excited about the accessibility focus.',
  createdAt: ago(5 * hour),
  likes: []
}];


const applicant = (id: string, jobId: string, applicantId: string, status: Application['status'], days: number, salary: number, profile: SeedPerson): Application => ({
  id,
  jobId,
  applicantId,
  appliedAt: ago(days * day),
  status,
  fullName: profile.name,
  email: '',
  phone: '+250 788 000 000',
  location: profile.location,
  education: profile.university ?? '',
  experience: profile.headline,
  skills: profile.skills.join(', '),
  expectedSalary: salary,
  cvName: `${profile.name.split(' ')[0].toLowerCase()}-cv.pdf`,
  coverLetter: '',
  answers: {}
});

const byId = (id: string) => PROFILES.find((p) => p.id === id) as SeedPerson;

const APPLICATIONS: Application[] = [
applicant('RW-APP-2026-00001', 'j1', 'u1', 'SHORTLISTED', 6, 650000, byId('u1')),
applicant('RW-APP-2026-00002', 'j4', 'u1', 'UNDER_REVIEW', 3, 800000, byId('u1')),
applicant('RW-APP-2026-00003', 'j10', 'u1', 'REJECTED', 12, 700000, byId('u1')),
applicant('RW-APP-2026-00004', 'j1', 'u6', 'INTERVIEW', 5, 720000, byId('u6')),
applicant('RW-APP-2026-00005', 'j4', 'u2', 'SUBMITTED', 2, 850000, byId('u2')),
applicant('RW-APP-2026-00006', 'j10', 'u5', 'SHORTLISTED', 4, 640000, byId('u5')),
applicant('RW-APP-2026-00007', 'j1', 'u4', 'HIRED', 8, 600000, byId('u4'))];


const CONNECTIONS: Connection[] = [
{ id: 'cn1', requesterId: 'u1', addresseeId: 'u2', status: 'ACCEPTED', createdAt: ago(20 * day) },
{ id: 'cn2', requesterId: 'u6', addresseeId: 'u1', status: 'ACCEPTED', createdAt: ago(18 * day) },
{ id: 'cn3', requesterId: 'u1', addresseeId: 'u7', status: 'ACCEPTED', createdAt: ago(14 * day) },
{ id: 'cn4', requesterId: 'u4', addresseeId: 'u1', status: 'PENDING', createdAt: ago(3 * hour) },
{ id: 'cn5', requesterId: 'u8', addresseeId: 'u1', status: 'PENDING', createdAt: ago(2 * day) },
{ id: 'cn6', requesterId: 'u2', addresseeId: 'u6', status: 'ACCEPTED', createdAt: ago(9 * day) },
{ id: 'cn7', requesterId: 'u3', addresseeId: 'u5', status: 'ACCEPTED', createdAt: ago(7 * day) }];


const FOLLOWS: Follow[] = [
{ id: 'f1', userId: 'u1', targetId: 'c1', targetType: 'COMPANY', createdAt: ago(10 * day) },
{ id: 'f2', userId: 'u1', targetId: 'c2', targetType: 'COMPANY', createdAt: ago(9 * day) },
{ id: 'f3', userId: 'u1', targetId: 'u3', targetType: 'PERSON', createdAt: ago(8 * day) },
{ id: 'f4', userId: 'u1', targetId: 'u6', targetType: 'PERSON', createdAt: ago(8 * day) },
{ id: 'f5', userId: 'u2', targetId: 'c2', targetType: 'COMPANY', createdAt: ago(7 * day) },
{ id: 'f6', userId: 'u3', targetId: 'c2', targetType: 'COMPANY', createdAt: ago(6 * day) },
{ id: 'f7', userId: 'u4', targetId: 'c1', targetType: 'COMPANY', createdAt: ago(6 * day) },
{ id: 'f8', userId: 'u5', targetId: 'c1', targetType: 'COMPANY', createdAt: ago(5 * day) },
{ id: 'f9', userId: 'u6', targetId: 'u1', targetType: 'PERSON', createdAt: ago(5 * day) },
{ id: 'f10', userId: 'u7', targetId: 'u1', targetType: 'PERSON', createdAt: ago(4 * day) },
{ id: 'f11', userId: 'u2', targetId: 'u1', targetType: 'PERSON', createdAt: ago(4 * day) }];


const CONVERSATIONS: Conversation[] = [
{ id: 'cv1', participantIds: ['u1', 'u21'], createdAt: ago(27 * hour) },
{ id: 'cv2', participantIds: ['u1', 'u6'], createdAt: ago(10 * hour) },
{ id: 'cv3', participantIds: ['u1', 'u3'], createdAt: ago(2 * day) }];


const MESSAGES: Message[] = [
{
  id: 'm1',
  conversationId: 'cv1',
  senderId: 'u21',
  body: 'Hello Jean Bosco, thank you for applying to the Software Developer role at ABC Rwanda Ltd.',
  createdAt: ago(26 * hour),
  readBy: ['u21']
},
{
  id: 'm2',
  conversationId: 'cv1',
  senderId: 'u21',
  body: 'We would like to invite you to a technical interview this Thursday at 10:00. Does that work for you?',
  createdAt: ago(25 * hour),
  readBy: ['u21']
},
{
  id: 'm3',
  conversationId: 'cv2',
  senderId: 'u6',
  body: 'Congratulations on the open-source contribution! Which library was it?',
  createdAt: ago(9 * hour),
  readBy: ['u6', 'u1']
},
{
  id: 'm4',
  conversationId: 'cv2',
  senderId: 'u1',
  body: 'Thank you Aline! It was an accessibility fix on a shared component library.',
  createdAt: ago(8 * hour),
  readBy: ['u1']
},
{
  id: 'm5',
  conversationId: 'cv3',
  senderId: 'u3',
  body: 'We are looking for a volunteer mentor for the Huye workshop. Interested?',
  createdAt: ago(2 * day),
  readBy: ['u3', 'u1']
}];


const NOTIFICATIONS: AppNotification[] = [
{ id: 'n1', userId: 'u1', kind: 'liked', actorId: 'u6', createdAt: ago(1 * hour), read: false },
{ id: 'n2', userId: 'u1', kind: 'connectionRequest', actorId: 'u4', createdAt: ago(3 * hour), read: false },
{
  id: 'n3',
  userId: 'u1',
  kind: 'statusChange',
  actorId: 'u21',
  createdAt: ago(20 * hour),
  read: false,
  meta: { statusKey: 'applications.shortlisted' }
},
{ id: 'n4', userId: 'u1', kind: 'commented', actorId: 'u2', createdAt: ago(2 * day), read: true },
{ id: 'n5', userId: 'u1', kind: 'newFollower', actorId: 'u3', createdAt: ago(3 * day), read: true },
{ id: 'n6', userId: 'u21', kind: 'application', actorId: 'u2', createdAt: ago(2 * day), read: false },
{ id: 'n7', userId: 'u21', kind: 'liked', actorId: 'u1', createdAt: ago(5 * hour), read: false }];


const REPORTS: Report[] = [
{
  id: 'r1',
  target: 'POST',
  targetId: 'p4',
  targetLabel: 'Post by Mireille Mukankomeje',
  reason: 'Spam / misleading offer',
  reporterId: 'u2',
  createdAt: ago(5 * hour),
  state: 'PENDING'
},
{
  id: 'r2',
  target: 'JOB',
  targetId: 'j5',
  targetLabel: 'Civil Engineer — Rwanda Construction Group',
  reason: 'Salary details appear inaccurate',
  reporterId: 'u7',
  createdAt: ago(1 * day),
  state: 'PENDING'
},
{
  id: 'r3',
  target: 'COMMENT',
  targetId: 'cm2',
  targetLabel: 'Comment on "Internship Opportunities"',
  reason: 'Offensive language',
  reporterId: 'u4',
  createdAt: ago(2 * day),
  state: 'PENDING'
},
{
  id: 'r4',
  target: 'USER',
  targetId: 'u8',
  targetLabel: 'Sandrine Ingabire',
  reason: 'Duplicate account',
  reporterId: 'u6',
  createdAt: ago(6 * day),
  state: 'RESOLVED'
}];


const SAVED_JOBS: SavedJob[] = [
{ id: 'sj1', userId: 'u1', jobId: 'j7', createdAt: ago(3 * day) },
{ id: 'sj2', userId: 'u1', jobId: 'j10', createdAt: ago(2 * day) }];


/** Builds the initial database, hashing every seeded password. */
export async function buildSeedDatabase(): Promise<Database> {
  const users: StoredUser[] = [];

  for (const profile of PROFILES) {
    const cred = SEED_CREDENTIALS.find((c) => c.userId === profile.id);
    if (!cred) continue;
    const salt = randomHex(16);
    const passwordHash = await hashPassword(cred.password, salt);
    users.push({
      ...profile,
      email: cred.email,
      role: cred.role,
      passwordHash,
      salt,
      createdAt: ago(60 * day),
      language: 'en'
    });
  }

  // Applications store the applicant's contact email from their account.
  const applications = APPLICATIONS.map((a) => ({
    ...a,
    email: users.find((u) => u.id === a.applicantId)?.email ?? ''
  }));

  return {
    version: 1,
    users,
    companies: COMPANIES,
    jobs: JOBS,
    applications,
    posts: POSTS,
    comments: COMMENTS,
    connections: CONNECTIONS,
    follows: FOLLOWS,
    conversations: CONVERSATIONS,
    messages: MESSAGES,
    notifications: NOTIFICATIONS,
    reports: REPORTS,
    savedJobs: SAVED_JOBS,
    savedPosts: [],
    // Filled by the advertisement migration in services/db.ts.
    advertisements: [],
    sequences: { application: APPLICATIONS.length, entity: 500 }
  };
}