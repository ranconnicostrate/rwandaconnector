import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useSocialSignIn } from '../hooks/useSocialSignIn';
import { completeLinkedInSignIn, OAuthError } from '../services/oauth';
import { ProviderLogo } from '../components/auth/ProviderLogo';
import { RoleChoiceModal } from '../components/auth/RoleChoiceModal';

/** Landing page LinkedIn redirects back to after the person approves sign-in. */
export function LinkedInCallback() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { error } = useAuth();
  const social = useSocialSignIn();
  const [failure, setFailure] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // The code is single-use, so never run the exchange twice.
    if (started.current) return;
    started.current = true;
    completeLinkedInSignIn(search).
    then((identity) => social.finish(identity)).
    catch((e) => setFailure(e instanceof OAuthError ? e.message : t('auth.providerFailed', { provider: 'LinkedIn' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = failure ?? (!social.needsRole ? error : null);

  return (
    <main className="flex min-h-full w-full items-center justify-center bg-surface-muted p-6">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-white p-6 text-center shadow-card">
        <ProviderLogo provider="linkedin" className="mx-auto h-10 w-10" />
        {shown ?
        <>
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-left text-sm font-medium text-red-600">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {shown}
            </p>
            <Link
            to="/login"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
              {t('auth.backToSignIn')}
            </Link>
          </> :

        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-500">
            <Loader2Icon className="h-4 w-4 animate-spin" /> {t('auth.completingSignIn')}
          </p>
        }
      </div>
      <RoleChoiceModal
        identity={social.needsRole}
        pending={social.pending}
        error={error}
        onCancel={() => {
          social.cancelRole();
          setFailure(t('auth.signupCancelled'));
        }}
        onConfirm={social.confirmRole} />
      
    </main>);

}