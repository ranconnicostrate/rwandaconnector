import React from 'react';
import { InfoIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { ProviderLogo } from './ProviderLogo';
import type { OAuthProvider } from '../../services/oauth';

interface SocialButtonsProps {
  busy: OAuthProvider | null;
  disabled: boolean;
  notice: string | null;
  onSelect: (provider: OAuthProvider) => void;
}

export function SocialButtons({ busy, disabled, notice, onSelect }: SocialButtonsProps) {
  const { t } = useTranslation();
  const providers: {id: OAuthProvider;label: string;}[] = [
  { id: 'google', label: t('auth.continueGoogle') },
  { id: 'linkedin', label: t('auth.continueLinkedIn') }];


  return (
    <div className="space-y-2.5">
      {providers.map((p) =>
      <button
        key={p.id}
        type="button"
        disabled={disabled || busy !== null}
        onClick={() => onSelect(p.id)}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:border-ink-300 hover:bg-surface-muted disabled:opacity-60">
        
          {busy === p.id ? <Loader2Icon className="h-5 w-5 animate-spin text-ink-400" /> : <ProviderLogo provider={p.id} />}
          {p.label}
        </button>
      )}
      {notice &&
      <p role="status" className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {notice}
        </p>
      }
    </div>);

}