import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { scenarioCards } from "@/lib/site-content";

function verdictTone(verdict: (typeof scenarioCards)[number]["verdict"]) {
  if (verdict === "ADMISSIBLE") {
    return {
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
    };
  }

  if (verdict === "AMBIGUOUS") {
    return {
      badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
      icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
    };
  }

  return {
    badge: "border-red-400/30 bg-red-400/10 text-red-200",
    icon: <ShieldAlert className="h-4 w-4 text-red-300" />,
  };
}

export function ScenarioShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
            Demo scenarios
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-50 sm:text-4xl">
            Six cases that show what gets approved, questioned, or stopped.
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
            These are the kinds of agent actions people actually argue about: customer refunds,
            deployment rollbacks, auto-purchases, personal commitments, emotional messaging, and
            privacy cleanup.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {scenarioCards.map((scenario) => {
            const tone = verdictTone(scenario.verdict);

            return (
              <article
                key={scenario.chipLabel}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-200">
                    {scenario.chipLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] ${tone.badge}`}
                  >
                    {tone.icon}
                    {scenario.verdict}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-neutral-300">{scenario.fullScenario}</p>
                <p className="mt-4 border-t border-white/8 pt-4 text-sm text-neutral-400">
                  <span className="text-neutral-200">Why:</span> {scenario.reason}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
