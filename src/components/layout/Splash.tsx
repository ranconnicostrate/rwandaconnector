import React from 'react';
import { MountainSnowIcon } from 'lucide-react';

export function Splash() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-full w-full flex-col items-center justify-center gap-4 bg-surface-muted">
      
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700 text-white">
        <MountainSnowIcon className="h-7 w-7" />
      </span>
      <p className="text-lg font-extrabold tracking-tight text-navy-800">
        Rwanda<span className="text-brand-600">Connect</span>
      </p>
      <span className="h-1 w-32 overflow-hidden rounded-full bg-surface-border">
        <span className="block h-full w-1/2 animate-pulse rounded-full bg-brand-600" />
      </span>
    </div>);

}