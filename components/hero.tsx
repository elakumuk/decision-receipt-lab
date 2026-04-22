export function Hero() {
  return (
    <section className="space-y-6">
      <p className="inline-flex rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-teal">
        Decision Receipt Lab
      </p>
      <div className="space-y-4">
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          Turn fuzzy choices into a receipt you can defend later.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink/70">
          Prototype decision triage, contest flows, and durable hashing in one Next.js 14 app. Paste a decision, classify its risk, and generate a traceable receipt.
        </p>
      </div>
    </section>
  );
}
