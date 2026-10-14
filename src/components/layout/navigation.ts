import {
  BarChart3Icon,
  BookmarkIcon,
  BriefcaseIcon,
  Building2Icon,
  FileTextIcon,
  FlagIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  UserSearchIcon } from
'lucide-react';
import type { Role } from '../../types';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof HomeIcon;
  badge?: 'messages' | 'notifications';
  end?: boolean;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  JOB_SEEKER: [
  { to: '/', labelKey: 'nav.home', icon: HomeIcon, end: true },
  { to: '/jobs', labelKey: 'nav.jobs', icon: BriefcaseIcon },
  { to: '/network', labelKey: 'nav.network', icon: UsersIcon },
  { to: '/people', labelKey: 'nav.people', icon: UserSearchIcon },
  { to: '/messages', labelKey: 'nav.messages', icon: MessageSquareIcon, badge: 'messages' },
  { to: '/notifications', labelKey: 'nav.notifications', icon: NewspaperIcon, badge: 'notifications' },
  { to: '/companies', labelKey: 'nav.companies', icon: Building2Icon },
  { to: '/saved', labelKey: 'nav.savedJobs', icon: BookmarkIcon },
  { to: '/applications', labelKey: 'nav.myApplications', icon: FileTextIcon },
  { to: '/profile', labelKey: 'nav.myProfile', icon: UserIcon }],

  EMPLOYER: [
  { to: '/employer', labelKey: 'nav.dashboard', icon: LayoutDashboardIcon, end: true },
  { to: '/employer/jobs', labelKey: 'nav.jobs', icon: BriefcaseIcon },
  { to: '/employer/applicants', labelKey: 'nav.applicants', icon: UsersIcon },
  { to: '/employer/company', labelKey: 'company.profile', icon: Building2Icon },
  { to: '/', labelKey: 'nav.posts', icon: NewspaperIcon, end: true },
  { to: '/employer/analytics', labelKey: 'nav.analytics', icon: BarChart3Icon },
  { to: '/messages', labelKey: 'nav.messages', icon: MessageSquareIcon, badge: 'messages' },
  { to: '/profile', labelKey: 'nav.myProfile', icon: UserIcon }],

  ADMIN: [
  { to: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboardIcon, end: true },
  { to: '/admin/users', labelKey: 'nav.users', icon: UsersIcon },
  { to: '/admin/companies', labelKey: 'nav.companies', icon: Building2Icon },
  { to: '/admin/jobs', labelKey: 'nav.jobs', icon: BriefcaseIcon },
  { to: '/admin/applications', labelKey: 'nav.myApplications', icon: FileTextIcon },
  { to: '/admin/posts', labelKey: 'nav.posts', icon: NewspaperIcon },
  { to: '/admin/reports', labelKey: 'nav.reports', icon: FlagIcon },
  { to: '/admin/advertisements', labelKey: 'nav.advertisements', icon: MegaphoneIcon },
  { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon }]

};

export const ROLE_HOME: Record<Role, string> = {
  JOB_SEEKER: '/',
  EMPLOYER: '/employer',
  ADMIN: '/admin'
};