import { Outlet } from 'react-router-dom';

export function HeroLayout(): JSX.Element {
  return (
    <main className="bg-bg text-text">
      <Outlet />
    </main>
  );
}
