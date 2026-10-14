import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2Icon, MapPinIcon, SearchIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { GeoServiceError, searchPlaces, type Place } from '../../services/geocoding';

interface PlaceSearchProps {
  onSelect: (place: Place) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

/** Address / place autocomplete limited to Rwanda. */
export function PlaceSearch({ onSelect, placeholder, autoFocus }: PlaceSearchProps) {
  const { t } = useTranslation();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }
    const controller = new AbortController();
    // Debounce so typing doesn't exceed the provider's 1 request/second policy.
    const timer = window.setTimeout(() => {
      setStatus('loading');
      setError(null);
      searchPlaces(q, controller.signal).
      then((places) => {
        setResults(places);
        setActive(places.length ? 0 : -1);
        setStatus('done');
      }).
      catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return;
        setResults([]);
        setStatus('error');
        setError(
          e instanceof GeoServiceError && e.reason === 'rate_limited' ? t('geo.rateLimited') : t('geo.searchFailed')
        );
      });
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, t]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const choose = (place: Place) => {
    onSelect(place);
    setQuery(place.label);
    setOpen(false);
  };

  const showList = open && query.trim().length >= 3 && status !== 'idle';

  return (
    <div ref={boxRef} className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={t('geo.searchPlaceLabel')}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && showList && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? t('geo.searchPlace')}
        className="w-full rounded-lg border border-surface-border bg-white py-2.5 pl-9 pr-9 text-sm focus:border-brand-400 focus:outline-none" />
      
      {status === 'loading' &&
      <Loader2Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" />
      }

      {showList &&
      <ul
        id={listId}
        role="listbox"
        className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-64 overflow-y-auto rounded-xl border border-surface-border bg-white py-1 shadow-pop">
        
          {status === 'loading' && results.length === 0 &&
        <li className="px-3 py-2.5 text-sm text-ink-400">{t('geo.searching')}</li>
        }
          {status === 'done' && results.length === 0 &&
        <li className="px-3 py-2.5 text-sm text-ink-400">{t('geo.noPlaces')}</li>
        }
          {status === 'error' && <li className="px-3 py-2.5 text-sm text-red-600">{error}</li>}
          {results.map((place, i) =>
        <li
          key={`${place.lat},${place.lng},${i}`}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === active}
          onMouseDown={(e) => {
            e.preventDefault();
            choose(place);
          }}
          onMouseEnter={() => setActive(i)}
          className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${i === active ? 'bg-brand-50' : ''}`}>
          
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink-900">{place.label}</span>
                <span className="block truncate text-xs text-ink-500">
                  {[place.district, place.province].filter(Boolean).join(', ')}
                </span>
              </span>
            </li>
        )}
          <li className="border-t border-surface-border px-3 pt-1.5 text-[10px] text-ink-400">
            © OpenStreetMap contributors
          </li>
        </ul>
      }
    </div>);

}