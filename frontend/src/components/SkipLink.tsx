type SkipLinkProps = {
  targetId: string;
};

/** Hidden until keyboard-focused; lets keyboard/AT users bypass repeated nav links. */
export function SkipLink({ targetId }: SkipLinkProps): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
    >
      Skip to main content
    </a>
  );
}
