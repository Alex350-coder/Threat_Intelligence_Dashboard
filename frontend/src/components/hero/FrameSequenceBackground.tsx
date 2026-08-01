import { useRef } from 'react';
import { useFrameSequence } from '../../hooks/useFrameSequence.js';

const FRAME_COUNT = 210;
const FRAME_SRC_PATTERN = '/media/hero-frames/frame_%06d.jpg';

type FrameSequenceBackgroundProps = {
  containerRef: React.RefObject<HTMLElement>;
};

export function FrameSequenceBackground({
  containerRef,
}: FrameSequenceBackgroundProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isReady } = useFrameSequence({
    srcPattern: FRAME_SRC_PATTERN,
    frameCount: FRAME_COUNT,
    containerRef,
    canvasRef,
  });

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
    </div>
  );
}
