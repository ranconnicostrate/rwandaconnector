import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { NAV_BY_ROLE } from './navigation';
import { IMAGES } from '../../data/posts';

export function Sidebar() {
  const { t } = useTranslation();
  const { role, unreadMessages, unreadNotifications } = usePlatform();
  const items = NAV_BY_ROLE[role];

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        <nav aria-label="Main navigation" className="space-y-0.5">
          {items.map((item) => {
            const count =
            item.badge === 'messages' ?
            unreadMessages :
            item.badge === 'notifications' ?
            unreadNotifications :
            0;
            return (
              <NavLink
                key={item.to + item.labelKey}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive ?
                'bg-navy-700 text-white' :
                'text-ink-700 hover:bg-white hover:text-navy-700'}`

                }>
                
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate">{t(item.labelKey)}</span>
                {count > 0 &&
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                    {count}
                  </span>
                }
              </NavLink>);

          })}
        </nav>

        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={IMAGES.hills}
            alt=""
            className="h-56 w-full object-cover"
            aria-hidden="true" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/10" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className="text-lg font-bold leading-snug text-white">{t('network.buildFuture')}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-navy-100">{t('network.buildBody')}</p>
            <NavLink
              to="/jobs"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy-800 transition-colors duration-150 hover:bg-navy-50">
              
              {t('network.exploreJobs')} <ArrowRightIcon className="h-3.5 w-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </aside>);

}