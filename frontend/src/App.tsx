import { ThemeProvider } from './context/ThemeContext.js';
import { Styleguide } from './dev/Styleguide.js';

const isStyleguideRoute = import.meta.env.DEV && window.location.pathname === '/styleguide';

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      {isStyleguideRoute ? <Styleguide /> : <div>Threat Intelligence Dashboard</div>}
    </ThemeProvider>
  );
}
