import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import en from './locales/en.json';
import rw from './locales/rw.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

export type LanguageCode = 'en' | 'rw' | 'fr' | 'sw';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  short: string;
  flag: string;
  locale: string;
}

export const LANGUAGES: LanguageOption[] = [
{ code: 'rw', label: 'Kinyarwanda', short: 'RW', flag: '🇷🇼', locale: 'rw-RW' },
{ code: 'en', label: 'English', short: 'EN', flag: '🇬🇧', locale: 'en-GB' },
{ code: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷', locale: 'fr-FR' },
{ code: 'sw', label: 'Kiswahili', short: 'SW', flag: '🇹🇿', locale: 'sw-TZ' }];


type Dictionary = Record<string, unknown>;

const RESOURCES: Record<LanguageCode, Dictionary> = { en, rw, fr, sw };

const STORAGE_KEY = 'rwandaconnect.language';

function resolve(dict: Dictionary, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Dictionary)) {
      return (acc as Dictionary)[part];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
  vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`
  );
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  option: LanguageOption;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatDate: (value: string | Date) => string;
  formatRelative: (value: string | Date) => string;
  formatSalary: (min: number, max?: number) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored as LanguageCode;
  return 'en';
}

export function LanguageProvider({ children }: {children: React.ReactNode;}) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {

      /* storage unavailable — keep in-memory preference */}
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const option = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[1];
    const dict = RESOURCES[language];

    const t = (key: string, vars?: Record<string, string | number>) => {
      const template = resolve(dict, key) ?? resolve(RESOURCES.en, key) ?? key;
      return interpolate(template, vars);
    };

    const formatNumber = (val: number) => new Intl.NumberFormat(option.locale).format(val);

    const formatDate = (val: string | Date) =>
    new Intl.DateTimeFormat(option.locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(val));

    const formatRelative = (val: string | Date) => {
      const diffMs = Date.now() - new Date(val).getTime();
      const minutes = Math.round(diffMs / 60000);
      if (minutes < 1) return t('time.justNow');
      if (minutes < 60) return t('time.minutesAgo', { count: minutes });
      const hours = Math.round(minutes / 60);
      if (hours < 24) return t('time.hoursAgo', { count: hours });
      const days = Math.round(hours / 24);
      if (days === 1) return t('time.yesterday');
      return t('time.daysAgo', { count: days });
    };

    const formatSalary = (min: number, max?: number) => {
      const fmt = (n: number) => new Intl.NumberFormat(option.locale).format(n);
      return max ? `${fmt(min)} – ${fmt(max)} RWF` : `${fmt(min)} RWF`;
    };

    return { language, setLanguage, option, t, formatNumber, formatDate, formatRelative, formatSalary };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used inside LanguageProvider');
  return ctx;
}