import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { detectIocType } from '../../lib/detectIocType.js';
import { IocTypeBadge } from './IocTypeBadge.js';

type SearchBarProps = {
  onSubmit: (value: string) => void;
  loading?: boolean;
  /** Prefills the input, e.g. when reopening a history/favorite entry. */
  initialValue?: string;
};

export function SearchBar({ onSubmit, loading = false, initialValue }: SearchBarProps): JSX.Element {
  const [value, setValue] = useState(initialValue ?? '');

  // Reopening a different history/favorite entry while already on the dashboard
  // doesn't remount this component — sync the field when the prefill changes.
  useEffect(() => {
    if (initialValue !== undefined) setValue(initialValue);
  }, [initialValue]);

  const trimmed = value.trim();
  const detectedType = useMemo(() => detectIocType(trimmed), [trimmed]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex-1">
          <Input
            label="Search an IOC"
            placeholder="IP address, domain, URL, or file hash"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            mono
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button type="submit" disabled={!trimmed || loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
      {/* Visual-only hint: not an aria-live region, so it doesn't re-announce on every keystroke. */}
      <div className="flex min-h-6 items-center gap-2">
        {detectedType ? (
          <IocTypeBadge type={detectedType} />
        ) : trimmed ? (
          <span className="text-xs text-text-muted">Type not recognized yet</span>
        ) : null}
      </div>
    </form>
  );
}
