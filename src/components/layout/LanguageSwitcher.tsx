import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, GlobeIcon } from 'lucide-react';
import { LANGUAGES, useTranslation } from '../../i18n';

export function LanguageSwitcher({ compact = false }: {compact?: boolean;}) {
  const { language, setLanguage, option, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
        
        <GlobeIcon className="h-4 w-4 text-ink-500" />
        <span>{option.short}</span>
        {!compact && <span className="hidden text-ink-400 lg:inline">{option.flag}</span>}
        <ChevronDownIcon className="h-3.5 w-3.5 text-ink-400" />
      </button>

      {open &&
      <ul
        role="listbox"
        aria-label={t('common.language')}
        className="absolute right-0 z-40 mt-2 w-52 animate-fade-up overflow-hidden rounded-xl border border-surface-border bg-white py-1 shadow-pop">
        
          {LANGUAGES.map((lang) =>
        <li key={lang.code}>
              <button
            type="button"
            role="option"
            aria-selected={language === lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-surface-muted ${
            language === lang.code ? 'font-semibold text-brand-700' : 'text-ink-700'}`
            }>
            
                <span aria-hidden="true">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {language === lang.code && <CheckIcon className="h-4 w-4" />}
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}