import { useState } from 'react';
import { Button } from '../components/ui/Button.js';
import { Card, CardBody, CardHeader } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Tooltip } from '../components/ui/Tooltip.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ErrorState } from '../components/ui/ErrorState.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table.js';
import { ThemeToggle } from '../components/ThemeToggle.js';

/**
 * Dev-only visual reference for every UI primitive, in both themes.
 * Not part of the shipped app — mounted directly from App.tsx in dev builds.
 */
export function Styleguide(): JSX.Element {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Styleguide</h1>
          <p className="text-sm text-text-muted">Dev-only reference — every UI primitive, both themes.</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <span className="font-medium">AbuseIPDB</span>
            <Badge tone="malicious">Malicious</Badge>
          </CardHeader>
          <CardBody className="text-sm text-text-muted">Provider details go here.</CardBody>
        </Card>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="malicious">Malicious</Badge>
          <Badge tone="suspicious">Suspicious</Badge>
          <Badge tone="clean">Clean</Badge>
          <Badge tone="unknown">Unknown</Badge>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Field</TableHeaderCell>
              <TableHeaderCell align="right">Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>IP</TableCell>
              <TableCell align="right" mono>
                203.0.113.42
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reports</TableCell>
              <TableCell align="right" mono>
                128
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Tooltip">
        <Tooltip label="Confidence score reported by the provider">
          <Button variant="secondary" size="sm">
            Hover me
          </Button>
        </Tooltip>
      </Section>

      <Section title="Skeleton">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Section>

      <Section title="Input">
        <div className="flex max-w-sm flex-col gap-4">
          <Input
            label="IOC"
            placeholder="8.8.8.8"
            mono
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Input label="IOC" placeholder="8.8.8.8" error="This does not look like a valid IOC." />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState title="No searches yet" description="Search an IOC to see results here." />
      </Section>

      <Section title="ErrorState">
        <ErrorState
          title="Failed to reach providers"
          description="All providers timed out. Try again."
          action={
            <Button variant="secondary" size="sm">
              Retry
            </Button>
          }
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: JSX.Element }): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      {children}
    </section>
  );
}
