export function Headline(): JSX.Element {
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        See the threat before it sees you.
      </h1>
      <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
        Paste an IP, domain, URL, or file hash and get one unified, trustworthy verdict — aggregated
        from multiple threat-intelligence providers in seconds.
      </p>
    </div>
  );
}
