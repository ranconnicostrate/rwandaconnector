import { oauthConfig } from '../data/oauth';
import { randomHex } from './crypto';

export type OAuthProvider = 'google' | 'linkedin';

/** Verified identity returned by a provider. */
export interface SocialProfile {
  provider: OAuthProvider;
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export class OAuthError extends Error {
  constructor(
  message: string,
  public reason: 'not_configured' | 'cancelled' | 'popup_blocked' | 'network' | 'invalid' | 'state')
  {
    super(message);
    this.name = 'OAuthError';
  }
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  if (provider === 'google') return !!oauthConfig.google.clientId;
  return !!oauthConfig.linkedin.clientId && !!oauthConfig.linkedin.tokenExchangeUrl;
}

/* ---------------------------------------------------------------- Google --- */

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrides?: {prompt?: string;}) => void;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: GoogleTokenResponse) => void;
      error_callback?: (error: {type: string;}) => void;
    }) => GoogleTokenClient;
  };
}

declare global {
  interface Window {
    google?: {accounts: GoogleAccounts;};
  }
}

let gsiLoading: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  if (gsiLoading) return gsiLoading;
  gsiLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiLoading = null;
      reject(new OAuthError('Could not reach Google. Check your connection and try again.', 'network'));
    };
    document.head.appendChild(script);
  });
  return gsiLoading;
}

/** Opens Google's account chooser and returns the verified profile. */
export async function signInWithGoogle(): Promise<SocialProfile> {
  if (!isProviderConfigured('google')) {
    throw new OAuthError('Google sign-in has not been set up yet.', 'not_configured');
  }
  await loadGoogleScript();
  const accounts = window.google?.accounts;
  if (!accounts) throw new OAuthError('Google sign-in could not start.', 'network');

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = accounts.oauth2.initTokenClient({
      client_id: oauthConfig.google.clientId,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);else
        reject(new OAuthError(response.error_description || 'Google sign-in was cancelled.', 'cancelled'));
      },
      error_callback: (error) => {
        reject(
          error.type === 'popup_failed_to_open' ?
          new OAuthError('Your browser blocked the Google window. Allow pop-ups and try again.', 'popup_blocked') :
          new OAuthError('Google sign-in was cancelled.', 'cancelled')
        );
      }
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });

  let info: {sub?: string;email?: string;email_verified?: boolean;name?: string;picture?: string;};
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error(String(res.status));
    info = await res.json();
  } catch {
    throw new OAuthError('Could not read your Google profile. Please try again.', 'network');
  }

  return toProfile('google', info);
}

/* -------------------------------------------------------------- LinkedIn --- */

const LINKEDIN_STATE_KEY = 'rwandaconnect.oauth.linkedin';

export function linkedInRedirectUri(): string {
  return `${window.location.origin}/auth/linkedin/callback`;
}

/** Sends the browser to LinkedIn; it comes back to /auth/linkedin/callback. */
export function startLinkedInSignIn() {
  if (!isProviderConfigured('linkedin')) {
    throw new OAuthError('LinkedIn sign-in has not been set up yet.', 'not_configured');
  }
  const state = randomHex(16);
  sessionStorage.setItem(LINKEDIN_STATE_KEY, state);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: oauthConfig.linkedin.clientId,
    redirect_uri: linkedInRedirectUri(),
    scope: 'openid profile email',
    state
  });
  window.location.assign(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
}

/** Completes the LinkedIn redirect: checks state, then exchanges the code server-side. */
export async function completeLinkedInSignIn(search: string): Promise<SocialProfile> {
  const params = new URLSearchParams(search);
  const expected = sessionStorage.getItem(LINKEDIN_STATE_KEY);
  sessionStorage.removeItem(LINKEDIN_STATE_KEY);

  if (params.get('error')) {
    throw new OAuthError(params.get('error_description') || 'LinkedIn sign-in was cancelled.', 'cancelled');
  }
  const code = params.get('code');
  // The state check stops another site from completing a sign-in for you.
  if (!code || !expected || params.get('state') !== expected) {
    throw new OAuthError('This sign-in link is invalid or has expired. Please try again.', 'state');
  }

  let info: {sub?: string;email?: string;email_verified?: boolean;name?: string;picture?: string;};
  try {
    const res = await fetch(oauthConfig.linkedin.tokenExchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: linkedInRedirectUri() })
    });
    if (!res.ok) throw new Error(String(res.status));
    info = await res.json();
  } catch {
    throw new OAuthError('Could not complete LinkedIn sign-in. Please try again.', 'network');
  }

  return toProfile('linkedin', info);
}

function toProfile(
provider: OAuthProvider,
info: {sub?: string;email?: string;email_verified?: boolean;name?: string;picture?: string;})
: SocialProfile {
  if (!info.sub || !info.email) {
    throw new OAuthError('Your account did not share an email address, which is required to sign in.', 'invalid');
  }
  const picture = info.picture && /^https:\/\//.test(info.picture) ? info.picture : undefined;
  return {
    provider,
    subject: String(info.sub),
    email: info.email.trim().toLowerCase(),
    emailVerified: info.email_verified !== false,
    name: (info.name || info.email.split('@')[0]).trim().slice(0, 80),
    picture
  };
}