import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { IocType, Verdict } from '@tid/shared';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../ui/Table.js';
import { VerdictBadge } from '../dashboard/VerdictBadge.js';
import { IocTypeBadge } from '../search/IocTypeBadge.js';

export interface IocRecord {
  id: string;
  iocValue: string;
  iocType: IocType;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

type IocRecordTableProps = {
  records: IocRecord[];
  renderActions: (record: IocRecord) => ReactNode;
  caption: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function IocRecordTable({ records, renderActions, caption }: IocRecordTableProps): JSX.Element {
  return (
    <Table aria-label={caption}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>IOC</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Verdict</TableHeaderCell>
          <TableHeaderCell align="right">Score</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell align="right">Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell mono className="max-w-[16rem] truncate">
              <Link
                to={`/dashboard?q=${encodeURIComponent(record.iocValue)}`}
                className="underline-offset-4 hover:underline focus-visible:underline"
                title={`Reopen ${record.iocValue} in the dashboard`}
              >
                {record.iocValue}
              </Link>
            </TableCell>
            <TableCell>
              <IocTypeBadge type={record.iocType} />
            </TableCell>
            <TableCell>
              <VerdictBadge verdict={record.verdict} />
            </TableCell>
            <TableCell align="right" className="tabular-nums">
              {record.score}
            </TableCell>
            <TableCell className="whitespace-nowrap text-text-muted">{formatDate(record.createdAt)}</TableCell>
            <TableCell align="right">
              <div className="flex items-center justify-end gap-2">{renderActions(record)}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
