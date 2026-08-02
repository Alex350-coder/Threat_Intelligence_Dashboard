import { useEffect } from 'react';

const SUFFIX = 'Threat Intelligence Dashboard';

/** Sets `document.title` for the current view; restores the previous title on unmount. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · ${SUFFIX}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
