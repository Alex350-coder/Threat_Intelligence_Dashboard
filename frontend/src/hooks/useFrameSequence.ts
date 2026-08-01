import { useEffect, useRef, useState } from 'react';

type UseFrameSequenceOptions = {
  /** e.g. `/media/hero-frames/frame_%06d.jpg` — `%06d` is replaced with a 1-based, zero-padded index. */
  srcPattern: string;
  frameCount: number;
  /** Ref to the scroll container whose scroll progress (0-1) drives the frame index. */
  containerRef: React.RefObject<HTMLElement>;
  /** Ref to the canvas the current frame is drawn onto. */
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

function frameUrl(pattern: string, index: number): string {
  return pattern.replace('%06d', String(index + 1).padStart(6, '0'));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Drives a scroll-scrubbed image-sequence animation onto a canvas.
 * Frames load progressively in the background (not blocking first paint);
 * drawing always falls back to the nearest already-loaded frame so the
 * effect stays smooth before the full sequence finishes downloading.
 * Fully inert under `prefers-reduced-motion` — only the poster frame loads/draws.
 */
export function useFrameSequence({
  srcPattern,
  frameCount,
  containerRef,
  canvasRef,
}: UseFrameSequenceOptions): { isReady: boolean } {
  const framesRef = useRef<Array<HTMLImageElement | null>>([]);
  const currentDrawnIndexRef = useRef<number>(-1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount <= 0) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    framesRef.current = new Array(frameCount).fill(null);

    const drawFrame = (index: number): void => {
      const image = framesRef.current[index];
      if (!image || currentDrawnIndexRef.current === index) {
        return;
      }
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.max(canvasWidth / image.width, canvasHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const dx = (canvasWidth - drawWidth) / 2;
      const dy = (canvasHeight - drawHeight) / 2;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
      currentDrawnIndexRef.current = index;
    };

    const resizeCanvas = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      // Invalidate the draw cache — the canvas was just cleared by the
      // width/height assignment above and the previous frame's scale/offset
      // no longer applies to the new backing-store size.
      currentDrawnIndexRef.current = -1;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const findNearestLoaded = (target: number): number => {
      if (framesRef.current[target]) {
        return target;
      }
      for (let offset = 1; offset < frameCount; offset += 1) {
        const lower = target - offset;
        const upper = target + offset;
        if (lower >= 0 && framesRef.current[lower]) {
          return lower;
        }
        if (upper < frameCount && framesRef.current[upper]) {
          return upper;
        }
      }
      return -1;
    };

    let targetIndex = 0;
    let rafId = 0;

    const renderLoop = (): void => {
      const nearest = findNearestLoaded(targetIndex);
      if (nearest !== -1) {
        drawFrame(nearest);
      }
      // Under reduced motion `targetIndex` never changes, so once the poster
      // frame has been drawn there's nothing left to redraw — keep ticking
      // only until that first draw happens, then stop burning CPU/battery.
      if (!reducedMotion || nearest === -1) {
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    const handleScroll = (): void => {
      if (reducedMotion) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const { top, height } = container.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(-top / scrollable, 0), 1) : 0;
      targetIndex = Math.min(frameCount - 1, Math.round(progress * (frameCount - 1)));
    };

    let cancelled = false;
    let inFlightImage: HTMLImageElement | null = null;

    const loadFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const image = new Image();
        inFlightImage = image;
        image.decoding = 'async';
        image.onload = (): void => {
          // The effect may have cleaned up while this request was in flight
          // (e.g. fast unmount/route change) — don't write into a ref or
          // trigger a state update for a hook instance that's gone.
          if (cancelled) {
            resolve();
            return;
          }
          framesRef.current[index] = image;
          if (index === 0) {
            setIsReady(true);
          }
          resolve();
        };
        image.onerror = (): void => resolve();
        image.src = frameUrl(srcPattern, index);
      });

    const preloadSequentially = async (): Promise<void> => {
      await loadFrame(0);
      if (reducedMotion || cancelled) {
        return;
      }
      for (let index = 1; index < frameCount; index += 1) {
        if (cancelled) {
          return;
        }
        await loadFrame(index);
      }
    };

    void preloadSequentially();

    if (!reducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelled = true;
      if (inFlightImage) {
        inFlightImage.onload = null;
        inFlightImage.onerror = null;
        inFlightImage.src = '';
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [srcPattern, frameCount, containerRef, canvasRef]);

  return { isReady };
}
