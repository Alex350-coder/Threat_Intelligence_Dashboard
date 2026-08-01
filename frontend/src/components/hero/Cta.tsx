import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.js';

export function Cta(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      // Default focus-visible outline is drawn on top of an arbitrary photo
      // frame here — layer a solid dark ring first so the accent ring always
      // has guaranteed contrast, regardless of what's behind the button.
      className="mt-8 h-12 self-start px-6 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      onClick={() => navigate('/dashboard')}
    >
      Start a search
    </Button>
  );
}
