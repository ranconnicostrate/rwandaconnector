import React, { useState } from 'react';
import { BriefcaseIcon, Building2Icon, Loader2Icon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import type { SocialIdentity } from '../../services/db';
import type { Role } from '../../types';

interface RoleChoiceModalProps {
  identity: SocialIdentity | null;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (role: Exclude<Role, 'ADMIN'>, companyName: string) => void;
}

/** First social sign-in only: the account type is the one thing a provider can't tell us. */
export function RoleChoiceModal({ identity, pending, error, onCancel, onConfirm }: RoleChoiceModalProps) {
  const { t } = useTranslation();
  const [role, setRole] = useState<Exclude<Role, 'ADMIN'>>('JOB_SEEKER');
  const [companyName, setCompanyName] = useState('');

  const options = [
  { value: 'JOB_SEEKER' as const, icon: BriefcaseIcon, title: t('roles.jobSeeker'), body: t('auth.roleSeekerBody') },
  { value: 'EMPLOYER' as const, icon: Building2Icon, title: t('roles.employer'), body: t('auth.roleEmployerBody') }];


  return (
    <Modal open={!!identity} onClose={onCancel} title={t('auth.finishSignup')} subtitle={t('auth.finishSignupBody')}>
      {identity &&
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(role, companyName);
        }}
        className="space-y-4">
        
          <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
            <Avatar name={identity.name} photo={identity.picture} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{identity.name}</p>
              <p className="truncate text-xs text-ink-500">{identity.email}</p>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-ink-700">{t('auth.iAmA')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o) =>
            <button
              key={o.value}
              type="button"
              aria-pressed={role === o.value}
              onClick={() => setRole(o.value)}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors duration-150 ${
              role === o.value ? 'border-brand-400 bg-brand-50' : 'border-surface-border hover:border-brand-200'}`
              }>
              
                  <o.icon className={`h-5 w-5 ${role === o.value ? 'text-brand-600' : 'text-ink-400'}`} />
                  <span className="text-sm font-bold text-ink-900">{o.title}</span>
                  <span className="text-xs text-ink-500">{o.body}</span>
                </button>
            )}
            </div>
          </fieldset>

          {role === 'EMPLOYER' &&
        <div>
              <label htmlFor="social-company" className="mb-1.5 block text-xs font-semibold text-ink-700">
                {t('company.name')}
              </label>
              <input
            id="social-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-surface-border px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" />
          
              <p className="mt-1 text-xs text-ink-400">{t('auth.companyPendingNote')}</p>
            </div>
        }

          {error &&
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
              {error}
            </p>
        }

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
            
              {t('common.cancel')}
            </button>
            <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:bg-brand-200">
            
              {pending && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {t('auth.createAccount')}
            </button>
          </div>
        </form>
      }
    </Modal>);

}