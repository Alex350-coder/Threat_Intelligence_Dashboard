import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  mono?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, mono = false, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'h-10 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-text-muted',
          'transition-[border-color] duration-150 ease-out',
          'focus-visible:border-accent',
          mono && 'font-mono',
          error && 'border-verdict-malicious',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-verdict-malicious">
          {error}
        </p>
      ) : null}
    </div>
  );
});
