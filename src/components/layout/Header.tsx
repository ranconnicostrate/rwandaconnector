import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  HomeIcon,
  LogOutIcon,
  MessageSquareIcon,
  MountainSnowIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon } from
'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ROLE_HOME } from './navigation';

const ICON_LINKS = [
{ to: '/', icon: HomeIcon, labelKey: 'nav.home', end: true },
{ to: '/network', icon: UsersIcon, labelKey: 'nav.network' },
{ to: '/jobs', icon: BriefcaseIcon, labelKey: 'nav.jobs' },
{ to: '/messages', icon: MessageSquareIcon, labelKey: 'nav.messages', badge: 'messages' as const },
{ to: '/notifications', icon: BellIcon, labelKey: 'nav.notifications', badge: 'notifications' as const }];


export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, role, unreadMessages, unreadNotifications } = usePlatform();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const roleLabel =
  role === 'JOB_SEEKER' ? t('roles.jobSeeker') : role === 'EMPLOYER' ? t('roles.employer') : t('roles.admin');

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
        <Link to={ROLE_HOME[role]} className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-700 text-white">
            <MountainSnowIcon className="h-5 w-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-lg font-extrabold tracking-tight text-navy-800">
              Rwanda<span className="text-brand-600">Connect</span>
            </span>
            <span className="block text-[11px] font-medium text-ink-400">{t('nav.tagline')}</span>
          </span>
        </Link>

        <form
          className="relative mx-auto hidden w-full max-w-xl md:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/jobs?q=${encodeURIComponent(query)}`);
          }}
          role="search">
          
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label={t('common.search')}
            placeholder={t('nav.searchPlaceholder')}
            className="w-full rounded-full border border-surface-border bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 transition-colors duration-150 focus:border-brand-400 focus:bg-white focus:outline-none" />
          
        </form>

        <nav aria-label="Quick navigation" className="ml-auto hidden items-center gap-1 lg:flex">
          {ICON_LINKS.map((link) => {
            const count = link.badge === 'messages' ? unreadMessages : link.badge === 'notifications' ? unreadNotifications : 0;
            return (
              <NavLink
                key={link.to + link.labelKey}
                to={link.to}
                end={link.end}
                title={t(link.labelKey)}
                aria-label={t(link.labelKey)}
                className={({ isActive }) =>
                `relative rounded-lg px-3 py-2 transition-colors duration-150 ${
                isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'}`

                }>
                
                {({ isActive }) =>
                <>
                    <link.icon className="h-5 w-5" />
                    {count > 0 &&
                  <span className="absolute right-1 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {count}
                      </span>
                  }
                    {isActive &&
                  <span className="absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-brand-600" />
                  }
                  </>
                }
              </NavLink>);

          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <LanguageSwitcher />
          <div className="hidden h-8 w-px bg-surface-border sm:block" />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors duration-150 hover:bg-surface-muted">
              
              <Avatar
                name={currentUser.name}
                color={currentUser.avatar}
                photo={currentUser.photo}
                size="sm" />
              
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[140px] truncate text-sm font-semibold text-ink-900">
                  {currentUser.name}
                </span>
                <span className="block text-[11px] text-ink-400">{roleLabel}</span>
              </span>
              <ChevronDownIcon className="h-4 w-4 text-ink-400" />
            </button>

            {menuOpen &&
            <div
              role="menu"
              className="absolute right-0 z-40 mt-2 w-64 animate-fade-up overflow-hidden rounded-xl border border-surface-border bg-white py-1 shadow-pop">
              
                <Link
                to="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors duration-150 hover:bg-surface-muted">
                
                  <UserIcon className="h-4 w-4 text-ink-400" /> {t('nav.myProfile')}
                </Link>
                <Link
                to="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors duration-150 hover:bg-surface-muted">
                
                  <SettingsIcon className="h-4 w-4 text-ink-400" /> {t('nav.settings')}
                </Link>

                <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="mt-1 flex w-full items-center gap-2.5 border-t border-surface-border px-3 py-2 text-left text-sm text-ink-700 transition-colors duration-150 hover:bg-surface-muted">
                
                  <LogOutIcon className="h-4 w-4 text-ink-400" /> {t('nav.logout')}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>);

}