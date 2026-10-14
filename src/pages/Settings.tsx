import React from 'react';
import { CheckIcon } from 'lucide-react';
import { LANGUAGES, useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';

export function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { currentUser } = usePlatform();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-extrabold text-ink-900">{t('settings.title')}</h1>

      <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink-900">{t('settings.languagePreference')}</h2>
        <p className="mt-1 text-sm text-ink-500">{t('settings.languageHelp')}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((lang) =>
          <li key={lang.code}>
              <button
              type="button"
              onClick={() => setLanguage(lang.code)}
              aria-pressed={language === lang.code}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-150 ${
              language === lang.code ?
              'border-brand-400 bg-brand-50 text-brand-700' :
              'border-surface-border text-ink-700 hover:border-brand-200'}`
              }>
              
                <span aria-hidden="true" className="text-base">
                  {lang.flag}
                </span>
                <span className="flex-1">{lang.label}</span>
                {language === lang.code && <CheckIcon className="h-4 w-4" />}
              </button>
            </li>
          )}
        </ul>
        <p className="mt-3 text-xs text-ink-400">
          {currentUser.name} · {t('settings.languagePreference')}: {language.toUpperCase()}
        </p>
      </section>

      <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink-900">{t('settings.notifications')}</h2>
        <ul className="mt-3 space-y-3">
          {['notifications.liked', 'notifications.commented', 'notifications.newJob', 'notifications.message'].map(
            (key) =>
            <li key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-ink-700">{t(key, { name: '—', status: '' })}</span>
                <input
                type="checkbox"
                defaultChecked
                aria-label={t(key, { name: '—', status: '' })}
                className="h-4 w-4 rounded border-surface-border text-brand-600" />
              
              </li>

          )}
        </ul>
      </section>
    </div>);

}