import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

interface TagInputProps {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  hint?: string;
  max?: number;
}

/** Free-text chips: Enter or comma adds, Backspace on empty removes the last. */
export function TagInput({ id, label, values, onChange, placeholder, hint, max = 30 }: TagInputProps) {
  const [text, setText] = useState('');

  const add = (raw: string) => {
    const value = raw.trim().replace(/,$/, '');
    if (!value || values.length >= max) return;
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setText('');
      return;
    }
    onChange([...values, value]);
    setText('');
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-700">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-surface-border px-2 py-2 focus-within:border-brand-400">
        {values.map((v) =>
        <span key={v} className="flex items-center gap-1 rounded-md bg-brand-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-brand-700">
            {v}
            <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label={`${v} ×`}
            className="rounded p-0.5 transition-colors duration-150 hover:bg-brand-100">
            
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        )}
        <input
          id={id}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(',')) add(v);else
            setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(text);
            } else if (e.key === 'Backspace' && !text && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
          placeholder={values.length ? '' : placeholder}
          className="min-w-[120px] flex-1 border-0 px-1 py-1 text-sm focus:outline-none" />
        
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </div>);

}