export function Headline(): JSX.Element {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
        Threat Intelligence Dashboard
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
        Paste an IP, domain, URL, or file hash and get one unified, trustworthy verdict — aggregated
        from multiple threat-intelligence providers in seconds.
      </p>
    </div>
  );
}
