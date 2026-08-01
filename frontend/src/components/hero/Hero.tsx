import { useRef } from 'react';
import { NavBar } from '../layout/NavBar.js';
import { FrameSequenceBackground } from './FrameSequenceBackground.js';
import { Headline } from './Headline.js';
import { Cta } from './Cta.js';
import { ScrollCue } from './ScrollCue.js';
import { TransitionSection } from './TransitionSection.js';

export function Hero(): JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <section ref={scrollContainerRef} className="relative h-[300vh]">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          <FrameSequenceBackground containerRef={scrollContainerRef} />
          <div className="relative z-10">
            <NavBar variant="transparent" />
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20">
            {/* Solid backdrop independent of the underlying frame's brightness —
                the canvas content is arbitrary photo/video stills, so the
                directional scrim alone can't guarantee text contrast here. */}
            <div className="max-w-2xl rounded-2xl bg-black/55 p-6 backdrop-blur-sm sm:p-8">
              <Headline />
              <Cta />
            </div>
          </div>
          <ScrollCue />
        </div>
      </section>
      <TransitionSection />
    </>
  );
}
