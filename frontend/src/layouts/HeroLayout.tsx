import { Outlet } from 'react-router-dom';
import { SkipLink } from '../components/SkipLink.js';

export function HeroLayout(): JSX.Element {
  return (
    <>
      <SkipLink targetId="hero-content" />
      <main className="bg-bg text-text">
        <Outlet />
      </main>
    </>
  );
}
