import type { KeyValue } from '@tid/shared';
import { Table, TableBody, TableCell, TableRow } from '../ui/Table.js';

type DetailTableProps = {
  details: KeyValue[];
};

export function DetailTable({ details }: DetailTableProps): JSX.Element | null {
  if (details.length === 0) return null;

  return (
    <Table aria-label="Provider details">
      <TableBody>
        {details.map((item) => (
          <TableRow key={item.key}>
            <TableCell className="text-text-muted">{item.key}</TableCell>
            <TableCell mono align="right">
              {item.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
