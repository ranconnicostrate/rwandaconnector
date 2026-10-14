import React, { useState } from 'react';
import { AlertCircleIcon, KeyRoundIcon, Loader2Icon, MountainSnowIcon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { DOCUMENTED_CREDENTIALS } from '../data/credentials';
import { IMAGES } from '../data/posts';
import { SocialButtons } from '../components/auth/SocialButtons';
import { RoleChoiceModal } from '../components/auth/RoleChoiceModal';
import { useSocialSignIn } from '../hooks/useSocialSignIn';
import type { Role } from '../types';

export function Login() {
  const { t } = useTranslation();
  const { signIn, signUp, error, clearError, pending } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('Kigali');
  const [signupRole, setSignupRole] = useState<Exclude<Role, 'ADMIN'>>('JOB_SEEKER');
  const [localError, setLocalError] = useState<string | null>(null);
  const social = useSocialSignIn();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (mode === 'signin') {
      await signIn(email, password);
      return;
    }
    if (password !== confirm) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }
    await signUp({ name, email, password, role: signupRole, headline, location, companyName });
  };

  const field =
  'w-full rounded-xl border border-surface-border px-4 py-3 text-sm focus:border-brand-400 focus:outline-none disabled:bg-surface-muted';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';
  const shown = localError ?? (social.needsRole ? null : error);

  return (
    <div className="grid min-h-full w-full lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={IMAGES.hero} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy-800/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="font-script text-4xl text-gold-400">{t('hero.motto')}</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white">
            {t('hero.title')}
            <br />
            {t('hero.titleLine2')} <span className="text-gold-400">{t('hero.highlight')}</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-navy-100">{t('hero.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-6">
          <span className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-700 text-white">
              <MountainSnowIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-navy-800">
              Rwanda<span className="text-brand-600">Connect</span>
            </span>
          </span>
          <LanguageSwitcher />
        </div>

        <div className="mx-auto w-full max-w-sm flex-1 px-6 py-8">
          <h1 className="text-2xl font-extrabold text-ink-900">
            {mode === 'signin' ? t('auth.welcome') : t('auth.createAccount')}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">{t('auth.welcomeBody')}</p>

          <div className="mt-6">
            <SocialButtons
              busy={social.busy}
              disabled={pending}
              notice={social.notice}
              onSelect={social.continueWith} />
            
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
            <span className="h-px flex-1 bg-surface-border" />
            {t('auth.orWithEmail')}
            <span className="h-px flex-1 bg-surface-border" />
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'signup' &&
            <>
                <div>
                  <label className={labelCls} htmlFor="signup-name">
                    {t('auth.fullName')}
                  </label>
                  <input
                  id="signup-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={field} />
                
                </div>
                <div>
                  <label className={labelCls} htmlFor="signup-headline">
                    {t('profile.headline')}
                  </label>
                  <input
                  id="signup-headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={field} />
                
                </div>
                <div>
                  <label className={labelCls} htmlFor="signup-location">
                    {t('jobs.location')}
                  </label>
                  <input
                  id="signup-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={field} />
                
                </div>
              </>
            }

            <div>
              <label className={labelCls} htmlFor="login-email">
                {t('auth.email')}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="login-password">
                {t('auth.password')}
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className={field} />
              
              {mode === 'signup' && <p className="mt-1 text-xs text-ink-400">{t('auth.passwordRule')}</p>}
            </div>

            {mode === 'signup' &&
            <>
                <div>
                  <label className={labelCls} htmlFor="login-confirm">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                  id="login-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={field} />
                
                </div>

                <fieldset>
                  <legend className="mb-1.5 text-xs font-semibold text-ink-700">{t('auth.iAmA')}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(['JOB_SEEKER', 'EMPLOYER'] as const).map((r) =>
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSignupRole(r)}
                    aria-pressed={signupRole === r}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                    signupRole === r ?
                    'border-brand-400 bg-brand-50 text-brand-700' :
                    'border-surface-border text-ink-700 hover:border-brand-200'}`
                    }>
                    
                        {r === 'JOB_SEEKER' ? t('roles.jobSeeker') : t('roles.employer')}
                      </button>
                  )}
                  </div>
                  <p className="mt-2 text-xs text-ink-400">{t('auth.adminNote')}</p>
                </fieldset>

                {signupRole === 'EMPLOYER' &&
              <div>
                    <label className={labelCls} htmlFor="signup-company">
                      {t('company.name')}
                    </label>
                    <input
                  id="signup-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={field} />
                
                    <p className="mt-1 text-xs text-ink-400">{t('auth.companyPendingNote')}</p>
                  </div>
              }
              </>
            }

            {shown &&
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
              
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {shown}
              </p>
            }

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:bg-brand-200">
              
              {pending && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setLocalError(null);
                clearError();
              }}
              className="font-semibold text-brand-600 hover:text-brand-700">
              
              {mode === 'signin' ? t('auth.createAccount') : t('auth.signIn')}
            </button>
          </p>

          <RoleChoiceModal
            identity={social.needsRole}
            pending={pending}
            error={social.needsRole ? error : null}
            onCancel={social.cancelRole}
            onConfirm={social.confirmRole} />
          

          {mode === 'signin' &&
          <section className="mt-8 rounded-2xl border border-surface-border bg-surface-muted p-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-500">
                <KeyRoundIcon className="h-3.5 w-3.5" /> {t('auth.demoAccounts')}
              </h2>
              <p className="mt-1 text-xs text-ink-400">{t('auth.demoHelp')}</p>
              <ul className="mt-3 space-y-2">
                {DOCUMENTED_CREDENTIALS.map((cred) =>
              <li key={cred.email}>
                    <button
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                    clearError();
                    setLocalError(null);
                  }}
                  className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-left transition-colors duration-150 hover:border-brand-200">
                  
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink-900">{t(cred.labelKey)}</span>
                        <span className="text-[11px] font-semibold text-brand-600">{t('auth.useAccount')}</span>
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-500">
                        {cred.email} · {cred.password}
                      </span>
                    </button>
                  </li>
              )}
              </ul>
            </section>
          }
        </div>
      </div>
    </div>);

}