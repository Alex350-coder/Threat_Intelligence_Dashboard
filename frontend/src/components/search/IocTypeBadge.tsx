import type { IocType } from '@tid/shared';
import { Badge } from '../ui/Badge.js';

const LABELS: Record<IocType, string> = {
  ip: 'IP Address',
  domain: 'Domain',
  url: 'URL',
  hash: 'File Hash',
};

type IocTypeBadgeProps = {
  type: IocType;
  className?: string;
};

export function IocTypeBadge({ type, className }: IocTypeBadgeProps): JSX.Element {
  return (
    <Badge tone="accent" className={className}>
      {LABELS[type]}
    </Badge>
  );
}
