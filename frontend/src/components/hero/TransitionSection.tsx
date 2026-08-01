import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function TransitionSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  // Fail open: if IntersectionObserver isn't available, show the section
  // immediately rather than leaving it permanently opacity-0.
  const [isVisible, setIsVisible] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-bg px-6 text-center"
    >
      <div
        className={
          isVisible
            ? 'translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out'
            : 'translate-y-4 opacity-0 transition-[opacity,transform] duration-300 ease-out'
        }
      >
        <h2 className="text-2xl font-semibold text-text sm:text-3xl">
          Ready to check an indicator?
        </h2>
        <p className="mt-3 max-w-md text-text-muted">
          Head into the dashboard to search an IP, domain, URL, or hash across every connected
          provider.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-[filter] duration-150 hover:brightness-110"
        >
          Go to Dashboard
        </Link>
      </div>
    </section>
  );
}
