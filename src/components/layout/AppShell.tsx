import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AlertCircleIcon, CheckCircle2Icon, XIcon } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePlatform } from '../../contexts/PlatformContext';
import { useTranslation, type LanguageCode } from '../../i18n';

/** Applies the language saved on the signed-in account. */
function useAccountLanguage() {
  const { currentUser } = usePlatform();
  const { language, setLanguage } = useTranslation();

  useEffect(() => {
    const saved = currentUser.language as LanguageCode | undefined;
    if (saved && saved !== language) setLanguage(saved);
    // Only run when the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);
}

function Feedback() {
  const { error, notice, clearError, clearNotice } = usePlatform();
  const { t } = useTranslation();
  if (!error && !notice) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role={error ? 'alert' : 'status'}
        aria-live={error ? 'assertive' : 'polite'}
        className={`pointer-events-auto flex max-w-xl animate-fade-up items-start gap-3 rounded-xl px-4 py-3 shadow-pop ${
        error ? 'bg-red-600 text-white' : 'bg-navy-800 text-white'}`
        }>
        
        {error ?
        <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> :

        <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
        }
        <p className="text-sm font-medium">{error ?? notice}</p>
        <button
          type="button"
          onClick={error ? clearError : clearNotice}
          aria-label={t('common.close')}
          className="ml-2 rounded-md p-0.5 text-white/80 transition-colors duration-150 hover:text-white">
          
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>);

}

export function AppShell() {
  useAccountLanguage();

  return (
    <div className="min-h-full w-full bg-surface-muted">
      <Header />
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 lg:px-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <Feedback />
    </div>);

}