import Link from "next/link";
import { DecisionReceiptLab } from "@/components/decision-receipt-lab";
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
    <div className="min-h-screen bg-[#0a0a0b]">
      {presentationMode ? null : (
        <div className="mx-auto max-w-[1480px] px-4 pt-5 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-col gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-100">Demo states</p>
              <p className="mt-1 text-sm text-neutral-500">
                Open `/demo?mode=present&state=refused` for a clean Ovrule presentation view.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(states).map(([key, value]) => (
                <Link
                  key={key}
                  href={`/demo?state=${key}`}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
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
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 transition hover:border-cyan-400/35"
              >
                Presentation mode
              </Link>
            </div>
          </div>
        </div>
      )}

      <DecisionReceiptLab
        key={`${stateKey}-${presentationMode ? "present" : "full"}`}
        initialScenario={active.scenario}
        initialReceipt={active.receipt}
        showChrome={!presentationMode}
      />
    </div>
  );
}
