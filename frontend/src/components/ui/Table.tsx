import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type TableProps = HTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return (
    <thead
      className={cn(
        'sticky top-0 z-10 bg-bg-elevated text-xs uppercase tracking-wide text-text-muted',
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>): JSX.Element {
  return <tr className={cn('odd:bg-bg even:bg-bg-elevated/40', className)} {...props} />;
}

type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
};

export function TableHeaderCell({ className, align = 'left', ...props }: TableHeaderCellProps): JSX.Element {
  return (
    <th
      className={cn('px-3 py-2 font-medium', align === 'right' && 'text-right', className)}
      {...props}
    />
  );
}

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
  mono?: boolean;
};

export function TableCell({ className, align = 'left', mono = false, ...props }: TableCellProps): JSX.Element {
  return (
    <td
      className={cn(
        'px-3 py-2 tabular-nums',
        align === 'right' && 'text-right',
        mono && 'font-mono',
        className,
      )}
      {...props}
    />
  );
}
