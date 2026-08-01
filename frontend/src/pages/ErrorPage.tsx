import { Link } from 'react-router-dom';

export function ErrorPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg px-6 text-center text-text">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-text-muted">An unexpected error occurred. Please try again.</p>
      <Link to="/" className="mt-4 inline-block text-accent hover:underline">
        Back to home
      </Link>
    </div>
  );
}
