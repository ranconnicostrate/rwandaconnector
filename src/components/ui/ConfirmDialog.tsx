import React from 'react';
import { useTranslation } from '../../i18n';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Adds context such as the item's name under the question. */
  detail?: string;
}

/** Destructive confirmation — Cancel is focused first so Enter never deletes by accident. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, detail }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-ink-700">{message}</p>
      {detail && <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm font-semibold text-ink-900">{detail}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
          
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700">
          
          {confirmLabel}
        </button>
      </div>
    </Modal>);

}