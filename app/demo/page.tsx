import Link from "next/link";
import { DecisionReceiptLab } from "@/components/decision-receipt-lab";
import { StickyHeader } from "@/components/sticky-header";
import { TrustBand } from "@/components/trust-band";
import {
  demoAdmissibleReceipt,
  demoAdmissibleScenario,
  demoAmbiguousReceipt,
  demoAmbiguousScenario,
  demoRefusedReceipt,
  demoRefusedScenario,
} from "@/lib/demo-data";

type DemoPageProps = {
  searchParams?: {
    state?: string;
    mode?: string;
  };
};

const states = {
  admissible: {
    label: "ADMISSIBLE",
    scenario: demoAdmissibleScenario,
    receipt: demoAdmissibleReceipt,
  },
  ambiguous: {
    label: "AMBIGUOUS",
    scenario: demoAmbiguousScenario,
    receipt: demoAmbiguousReceipt,
  },
  refused: {
    label: "REFUSED",
    scenario: demoRefusedScenario,
    receipt: demoRefusedReceipt,
  },
} as const;

export default function DemoPage({ searchParams }: DemoPageProps) {
  const stateKey =
    searchParams?.state && searchParams.state in states
      ? (searchParams.state as keyof typeof states)
      : "refused";
  const presentationMode = searchParams?.mode === "present";
  const active = states[stateKey];

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      {presentationMode ? null : <StickyHeader />}

      <section className={`${presentationMode ? "pt-10" : "pt-14"} pb-16 sm:pb-20`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {presentationMode ? null : (
            <>
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Demo state</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
                  Walk the product with seeded case files.
                </h1>
                <p className="mt-4 text-base leading-8 text-neutral-400">
                  Switch between admissible, ambiguous, and refused examples to preview the Ovrule workspace without running a live classification request.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {Object.entries(states).map(([key, value]) => (
                  <Link
                    key={key}
                    href={`/demo?state=${key}`}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      key === stateKey
                        ? "border-white/20 bg-white/[0.08] text-neutral-50"
                        : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200"
                    }`}
                  >
                    {value.label}
                  </Link>
                ))}
                <Link
                  href={`/demo?state=${stateKey}&mode=present`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:border-cyan-400/35"
                >
                  Presentation mode
                </Link>
              </div>

              <div className="mt-8">
                <TrustBand />
              </div>
            </>
          )}

          <div className={`${presentationMode ? "" : "mt-12"}`}>
            <DecisionReceiptLab
              key={`${stateKey}-${presentationMode ? "present" : "full"}`}
              initialScenario={active.scenario}
              initialReceipt={active.receipt}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
