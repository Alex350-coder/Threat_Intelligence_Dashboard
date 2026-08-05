import { useRef } from 'react';
import { useFrameSequence } from '../../hooks/useFrameSequence.js';

export function FrameSequenceBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isReady } = useFrameSequence({ canvasRef });

  return (
    <div className="absolute inset-0 bg-bg" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/70" />
    </div>
  );
}
