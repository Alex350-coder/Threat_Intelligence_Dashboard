import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.js';

const focusRingClassName =
  // Default focus-visible outline is drawn on top of an arbitrary canvas
  // background here — layer a solid dark ring first so the accent ring
  // always has guaranteed contrast, regardless of what's behind the button.
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export function Cta(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <Button
        type="button"
        variant="primary"
        size="md"
        className={`h-12 px-6 text-base ${focusRingClassName}`}
        onClick={() => navigate('/dashboard')}
      >
        Start Investigation
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="md"
        className={`h-12 px-6 text-base ${focusRingClassName}`}
        onClick={() => navigate('/dashboard')}
      >
        Explore Features
      </Button>
    </div>
  );
}
