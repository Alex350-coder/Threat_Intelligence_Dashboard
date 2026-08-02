import { cloneElement, isValidElement, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
};

export function Tooltip({ label, children, side = 'top', className }: TooltipProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const id = useId();

  // aria-describedby must live on the element assistive tech actually focuses
  // (the trigger itself), not on a wrapping span — otherwise screen readers
  // never announce the tooltip text on keyboard focus.
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': open ? id : undefined })
    : children;

  return (
    // This wrapper doesn't have its own interactive semantics (no tabIndex/role) — it only
    // reacts to hover/focus events bubbling up from the interactive `children` it wraps.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
    >
      {trigger}
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute left-1/2 z-20 w-max max-w-64 -translate-x-1/2 rounded-md border border-border bg-bg-elevated px-2.5 py-1.5 text-xs text-text shadow-md shadow-black/30',
          'transition-[opacity,transform] duration-150 ease-out',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </span>
  );
}
