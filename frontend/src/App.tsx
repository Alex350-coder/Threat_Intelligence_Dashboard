import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { Styleguide } from './dev/Styleguide.js';
import { AppLayout } from './layouts/AppLayout.js';
import { HeroLayout } from './layouts/HeroLayout.js';
import { HomePage } from './pages/HomePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ErrorPage } from './pages/ErrorPage.js';
import { RouteFallback } from './components/RouteFallback.js';

// Lazy-loaded so their code (and dependent chart/table logic) only downloads
// once a user actually navigates there — HomePage stays eager as the entry route.
const DashboardPage = lazy(() => import('./pages/DashboardPage.js').then((m) => ({ default: m.DashboardPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage.js').then((m) => ({ default: m.HistoryPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.js').then((m) => ({ default: m.FavoritesPage })));

const isStyleguideRoute = import.meta.env.DEV && window.location.pathname === '/styleguide';

function withSuspense(element: JSX.Element): JSX.Element {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <HeroLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/dashboard', element: withSuspense(<DashboardPage />) },
      { path: '/history', element: withSuspense(<HistoryPage />) },
      { path: '/favorites', element: withSuspense(<FavoritesPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      {isStyleguideRoute ? <Styleguide /> : <RouterProvider router={router} />}
    </ThemeProvider>
  );
}
