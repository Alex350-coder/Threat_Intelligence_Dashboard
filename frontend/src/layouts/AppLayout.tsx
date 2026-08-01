import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar.js';

export function AppLayout(): JSX.Element {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Move focus to the new view on route change — createBrowserRouter doesn't
    // do this itself, and without it keyboard/screen-reader users get no signal
    // that navigation happened (focus stays on the clicked NavLink).
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <NavBar variant="solid" />
      <main ref={mainRef} tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 outline-none sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
