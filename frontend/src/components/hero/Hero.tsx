import { NavBar } from '../layout/NavBar.js';
import { FrameSequenceBackground } from './FrameSequenceBackground.js';
import { Headline } from './Headline.js';
import { Cta } from './Cta.js';
import { TransitionSection } from './TransitionSection.js';

export function Hero(): JSX.Element {
  return (
    <>
      <section
        id="hero-content"
        tabIndex={-1}
        // Default focus-visible outline is drawn on top of the constellation
        // canvas here — layer a solid dark ring first so the accent ring
        // always has guaranteed contrast, regardless of what's behind it.
        className="relative flex h-screen flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <FrameSequenceBackground />
        <div className="relative z-10">
          <NavBar variant="transparent" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Headline />
          <Cta />
        </div>
      </section>
      <TransitionSection />
    </>
  );
}
