import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export function NotFoundPage(): JSX.Element {
  useDocumentTitle('Page not found');
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-accent hover:underline">
        Back to home
      </Link>
    </div>
  );
}
