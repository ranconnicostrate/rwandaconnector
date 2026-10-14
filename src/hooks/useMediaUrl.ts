import { useEffect, useState } from 'react';
import { isStoredMedia, resolveMediaUrl } from '../services/mediaStore';

export type MediaState = 'idle' | 'loading' | 'ready' | 'missing';

/** Resolves an ad media reference (https URL or stored file) to a src. */
export function useMediaUrl(ref: string | undefined): {url: string | null;state: MediaState;} {
  const [resolved, setResolved] = useState<{ref?: string;url: string | null;state: MediaState;}>({
    ref,
    url: ref && !isStoredMedia(ref) ? ref : null,
    state: !ref ? 'idle' : isStoredMedia(ref) ? 'loading' : 'ready'
  });

  useEffect(() => {
    if (!ref) {
      setResolved({ ref, url: null, state: 'idle' });
      return;
    }
    if (!isStoredMedia(ref)) {
      setResolved({ ref, url: ref, state: 'ready' });
      return;
    }
    let cancelled = false;
    setResolved({ ref, url: null, state: 'loading' });
    resolveMediaUrl(ref).
    then((url) => {
      if (!cancelled) setResolved({ ref, url, state: url ? 'ready' : 'missing' });
    }).
    catch(() => {
      if (!cancelled) setResolved({ ref, url: null, state: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [ref]);

  // Guard against one render of stale data right after the ref changes.
  if (resolved.ref !== ref) {
    return { url: ref && !isStoredMedia(ref) ? ref : null, state: ref ? 'loading' : 'idle' };
  }
  return { url: resolved.url, state: resolved.state };
}