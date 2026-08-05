import { useEffect, useState } from 'react';

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
};

type UseFrameSequenceOptions = {
  /** Ref to the canvas the constellation animation is drawn onto. */
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const NODE_SPACING = 64;
const MAX_CONNECTION_DISTANCE = 130;
const MOUSE_RADIUS = 160;
const SPRING_STIFFNESS = 18;
const DAMPING = 0.82;

function readAccentColor(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
  return value.trim() || '#38bdf8';
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function buildNodes(width: number, height: number): Node[] {
  const cols = Math.ceil(width / NODE_SPACING) + 1;
  const rows = Math.ceil(height / NODE_SPACING) + 1;
  const nodes: Node[] = [];
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const x = i * NODE_SPACING;
      const y = j * NODE_SPACING;
      nodes.push({
        x,
        y,
        vx: 0,
        vy: 0,
        baseX: x,
        baseY: y,
        radius: Math.random() * 0.8 + 1,
      });
    }
  }
  return nodes;
}

/**
 * Drives a mouse-reactive constellation/grid canvas animation: a sparse node
 * grid springs back to its resting position, draws lines between nearby
 * nodes, and highlights nodes/lines near the cursor in the accent color.
 * Fully inert under `prefers-reduced-motion` — nodes are drawn once at rest,
 * with no animation loop and no mouse reactivity.
 */
export function useFrameSequence({ canvasRef }: UseFrameSequenceOptions): { isReady: boolean } {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    const accentRgb = hexToRgb(readAccentColor());

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const mouse = { x: -1000, y: -1000 };

    const resizeCanvas = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = buildNodes(width, height);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const handleMouseMove = (event: MouseEvent): void => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const handleMouseLeave = (): void => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const drawStaticFrame = (): void => {
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
      }
      setIsReady(true);
    };

    if (reducedMotion) {
      drawStaticFrame();
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number): void => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const power = 1 - dist / MOUSE_RADIUS;
          const force = power * 600;
          const angle = Math.atan2(dy, dx);
          node.vx -= Math.cos(angle) * force * dt;
          node.vy -= Math.sin(angle) * force * dt;
        }

        node.vx += (node.baseX - node.x) * SPRING_STIFFNESS * dt;
        node.vy += (node.baseY - node.y) * SPRING_STIFFNESS * dt;
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x += node.vx * dt * 60;
        node.y += node.vy * dt * 60;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        if (!a) {
          continue;
        }
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          if (!b) {
            continue;
          }
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_CONNECTION_DISTANCE) {
            const nearMouse =
              Math.hypot(mouse.x - a.x, mouse.y - a.y) < MOUSE_RADIUS ||
              Math.hypot(mouse.x - b.x, mouse.y - b.y) < MOUSE_RADIUS;
            const alpha = (1 - dist / MAX_CONNECTION_DISTANCE) * (nearMouse ? 0.35 : 0.12);
            ctx.strokeStyle = nearMouse
              ? `rgba(${accentRgb}, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const dist = Math.hypot(mouse.x - node.x, mouse.y - node.y);
        const isNear = dist < MOUSE_RADIUS;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isNear ? node.radius * 2 : node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? `rgba(${accentRgb}, 0.9)` : 'rgba(255, 255, 255, 0.35)';
        ctx.fill();
      }

      setIsReady(true);
      rafId = requestAnimationFrame(step);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [canvasRef]);

  return { isReady };
}
