import React from 'react';

interface AvatarProps {
  name: string;
  color?: string;
  initials?: string;
  /** Uploaded photo / logo. Falls back to initials when absent. */
  photo?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  square?: boolean;
}

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl'
};

function toInitials(name: string) {
  return name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();
}

export function Avatar({ name, color = '#103764', initials, photo, size = 'md', square }: AvatarProps) {
  const shape = square ? 'rounded-xl' : 'rounded-full';

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className={`${SIZES[size]} ${shape} shrink-0 bg-surface-muted object-cover`} />);


  }

  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} ${shape} inline-flex shrink-0 items-center justify-center font-bold tracking-tight text-white`}
      style={{ backgroundColor: color }}>
      
      {initials ?? toInitials(name)}
    </span>);

}