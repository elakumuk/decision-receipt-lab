import Link from "next/link";
import { AboutSection } from "@/components/about-section";
import { DecisionReceiptLab } from "@/components/decision-receipt-lab";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { OvruleWordmark } from "@/components/ovrule-wordmark";
import { ScenarioShowcase } from "@/components/scenario-showcase";
import { StickyHeader } from "@/components/sticky-header";
import { TrustBand } from "@/components/trust-band";
import { demoRefusedReceipt, demoRefusedScenario } from "@/lib/demo-data";

type HomeProps = {
  searchParams?: {
    demo?: string;
    scenario?: string;
  };
};

export default function Home({ searchParams }: HomeProps) {
  const isRefusedDemo = searchParams?.demo === "refused";
  const prefilledScenario = searchParams?.scenario ?? "";

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <HeroSection />

      <section className="py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <TrustBand />
        </div>
      </section>

      <HowItWorks />
      <ScenarioShowcase />

      <section id="live-demo" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Live tool</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
              Bring your own scenario. Ovrule opens the file.
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              Submit an agent action and the case unfolds in order: verdict first, then evidence, then the receipt and revision trail.
            </p>
          </div>

          <div className="mt-10">
            <DecisionReceiptLab
              initialScenario={isRefusedDemo ? demoRefusedScenario : prefilledScenario}
              initialReceipt={isRefusedDemo ? demoRefusedReceipt : null}
            />
          </div>
        </div>
      </section>

      <AboutSection />

      <footer className="border-t border-white/8 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <OvruleWordmark className="h-7 w-auto text-neutral-50" />
            <p className="mt-3 max-w-md text-sm leading-7 text-neutral-400">
              Auditable case files for AI agent decisions.
              <br />
              Refusals, evidence gaps, contests, and reviewer overrides in one record.
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Built with Codex for the OpenAI Creator Challenge, April 2026.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-2 sm:justify-items-end">
            <Link href="/ledger" className="transition hover:text-neutral-100">
              Ledger
            </Link>
            <Link href="/docs" className="transition hover:text-neutral-100">
              Docs
            </Link>
            <Link href="/demo?state=refused" className="transition hover:text-neutral-100">
              Demo
            </Link>
            <a
              href="https://github.com/elakumuk/decision-receipt-lab"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-neutral-100"
            >
              GitHub
            </a>
            <span className="sm:col-span-2 sm:justify-self-end">Made by Ela Kumuk.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
