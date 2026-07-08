import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { OvruleWordmark } from "@/components/ovrule-wordmark";
import { StickyHeader } from "@/components/sticky-header";

const proofPoints = [
  {
    title: "Before, not after",
    body: "Ovrule reviews the action before it runs — a real guardrail, not a post-mortem log.",
  },
  {
    title: "Plain English, for owners",
    body: "Written for compliance, risk, and ops — not just engineers reading traces.",
  },
  {
    title: "Evidence that holds up",
    body: "Tamper-evident records that map to EU AI Act Article 12 and AI-liability claims.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <HeroSection />

      {/* The problem */}
      <section className="border-t border-white/8 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">The problem</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
              When your AI agent does the wrong thing, you&apos;re the one who has to explain it.
            </h2>
            <p className="mt-5 text-base leading-8 text-neutral-400">
              Agents now send payments, share customer data, and take irreversible actions on their own. When one goes
              wrong, the question lands 48 hours later — from a customer, a bank, an auditor, or your boss:{" "}
              <span className="text-neutral-200">&ldquo;Who approved this, and should it ever have happened?&rdquo;</span>{" "}
              Raw logs and traces can&apos;t answer that. Ovrule can.
            </p>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* The inbox */}
      <section className="border-t border-white/8 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] border border-white/8 bg-white/[0.03] p-8 sm:p-10">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                For the person on the hook
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
                A plain-English inbox of what your agents want to do.
              </h2>
              <p className="mt-4 text-base leading-8 text-neutral-400">
                No dashboards to read, no logs to parse — just the risky actions that need a human, with who&apos;s
                affected, which rule fired, and an Approve / Deny that becomes a signed record.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/inbox"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white"
                >
                  Open the inbox
                </Link>
                <Link
                  href="/evidence"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-neutral-200 transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  See the evidence pack
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="border-t border-white/8 py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {proofPoints.map((point) => (
            <div key={point.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm font-medium text-neutral-100">{point.title}</p>
              <p className="mt-2 text-sm leading-7 text-neutral-400">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/8 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <OvruleWordmark className="h-7 w-auto text-neutral-50" />
            <p className="mt-3 max-w-md text-sm leading-7 text-neutral-400">
              Ovrule · Accountability for AI agents that take real actions.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-2 sm:justify-items-end">
            <Link href="/inbox" className="transition hover:text-neutral-100">
              Inbox
            </Link>
            <Link href="/evidence" className="transition hover:text-neutral-100">
              Evidence
            </Link>
            <Link href="/ledger" className="transition hover:text-neutral-100">
              Ledger
            </Link>
            <Link href="/docs" className="transition hover:text-neutral-100">
              Docs
            </Link>
            <a
              href="https://github.com/elakumuk/decision-receipt-lab"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-neutral-100"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
