import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { Styleguide } from './dev/Styleguide.js';
import { AppLayout } from './layouts/AppLayout.js';
import { HeroLayout } from './layouts/HeroLayout.js';
import { HomePage } from './pages/HomePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ErrorPage } from './pages/ErrorPage.js';

const isStyleguideRoute = import.meta.env.DEV && window.location.pathname === '/styleguide';

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
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
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
