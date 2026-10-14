import { useState } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import {
  OAuthError,
  signInWithGoogle,
  startLinkedInSignIn,
  type OAuthProvider,
  type SocialProfile } from
'../services/oauth';
import type { Role } from '../types';

/** Drives "Continue with Google / LinkedIn", including the first-time role step. */
export function useSocialSignIn() {
  const { t } = useTranslation();
  const { signInWithIdentity, setAuthError, pending } = useAuth();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const [needsRole, setNeedsRole] = useState<SocialProfile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const describe = (e: unknown, provider: OAuthProvider) => {
    const name = provider === 'google' ? 'Google' : 'LinkedIn';
    if (e instanceof OAuthError) {
      if (e.reason === 'not_configured') return t('auth.providerNotConfigured', { provider: name });
      if (e.reason === 'cancelled') return null;
      return e.message;
    }
    return t('auth.providerFailed', { provider: name });
  };

  const finish = async (identity: SocialProfile) => {
    const result = await signInWithIdentity(identity);
    if (result === 'needs-role') setNeedsRole(identity);
  };

  const continueWith = async (provider: OAuthProvider) => {
    setNotice(null);
    setAuthError(null);
    setBusy(provider);
    try {
      if (provider === 'linkedin') {
        startLinkedInSignIn(); // navigates away
        return;
      }
      await finish(await signInWithGoogle());
    } catch (e) {
      const message = describe(e, provider);
      if (e instanceof OAuthError && e.reason === 'not_configured') setNotice(message);else
      if (message) setAuthError(message);
    } finally {
      setBusy(null);
    }
  };

  const confirmRole = async (role: Exclude<Role, 'ADMIN'>, companyName: string) => {
    if (!needsRole) return;
    const result = await signInWithIdentity(needsRole, { role, companyName });
    if (result === 'signed-in') setNeedsRole(null);
  };

  return {
    busy,
    pending,
    notice,
    needsRole,
    continueWith,
    finish,
    confirmRole,
    cancelRole: () => setNeedsRole(null)
  };
}