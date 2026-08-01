import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { ThemeToggle } from '../ThemeToggle.js';

type NavBarVariant = 'transparent' | 'solid';

type NavBarProps = {
  variant?: NavBarVariant;
};

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/favorites', label: 'Favorites' },
];

export function NavBar({ variant = 'solid' }: NavBarProps): JSX.Element {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center justify-between gap-1 px-2 sm:gap-2 sm:px-6',
        variant === 'solid' && 'border-b border-border bg-bg/90 backdrop-blur',
        // A gradient alone can't guarantee contrast against an arbitrary photo
        // background — pair it with a flat, frame-independent scrim.
        variant === 'transparent' && 'bg-black/60 backdrop-blur-sm',
      )}
    >
      <NavLink
        to="/"
        className={cn(
          'shrink-0 text-sm font-semibold tracking-tight sm:text-base',
          variant === 'transparent' ? 'text-white' : 'text-text',
        )}
      >
        Threat Intel<span className="hidden sm:inline"> Dashboard</span>
      </NavLink>

      <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-2">
        <ul className="flex items-center gap-0.5 sm:gap-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-1.5 py-2 text-xs font-medium underline-offset-4 transition-colors duration-150 sm:px-3 sm:text-sm',
                    variant === 'transparent'
                      ? 'text-white/80 hover:text-white'
                      : 'text-text-muted hover:text-text',
                    isActive &&
                      (variant === 'transparent'
                        ? 'font-semibold text-white underline'
                        : 'font-semibold text-text underline'),
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
