"use client";

import type { EvidencePack } from "@/lib/evidence";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <div className="mt-2 text-sm leading-6 text-neutral-200">{children}</div>
    </div>
  );
}

export function EvidencePackView({ pack }: { pack: EvidencePack }) {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            {pack.context} · evidence pack
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-50">
            {pack.caseTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-white/12 bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-white"
        >
          Export PDF
        </button>
      </div>

      {/* EU AI Act Article 12 logbook */}
      <section className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-sky-200">
            EU AI ACT · ART. 12
          </span>
          <p className="text-sm text-neutral-400">Automatic, tamper-resistant record of the event</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Field label="Recorded at">
            <span className="font-mono text-[13px]">{pack.article12.recordedAt}</span>
          </Field>
          <Field label="System identity">{pack.article12.systemIdentity}</Field>
          <Field label="Actor">{pack.article12.actor}</Field>
          <Field label="Decision outcome">
            <span className="font-semibold text-red-200">{pack.article12.decisionOutcome}</span>{" "}
            <span className="text-neutral-500">({pack.article12.decidedBy})</span>
          </Field>
          <div className="md:col-span-2">
            <Field label="Input considered">{pack.article12.inputConsidered}</Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Human intervention">{pack.article12.humanIntervention}</Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Tamper-evidence">
              <p className="text-neutral-300">{pack.article12.tamperEvidence.algorithm}</p>
              <p className="mt-1 font-mono text-[12px] text-neutral-400">
                hash {pack.article12.tamperEvidence.hash} · sig {pack.article12.tamperEvidence.signature}
              </p>
            </Field>
          </div>
        </div>
      </section>

      {/* AI liability dossier */}
      <section className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-violet-200">
            AI LIABILITY · DOSSIER
          </span>
          <p className="text-sm text-neutral-400">Underwriting &amp; claims evidence</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Controls in place">
              <ul className="list-disc space-y-1 pl-4 text-neutral-300">
                {pack.liability.controlsInPlace.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Field>
          </div>
          <Field label="Action attempted">{pack.liability.actionAttempted}</Field>
          <Field label="Verdict">{pack.liability.verdict}</Field>
          <Field label="Policy basis">{pack.liability.policyBasis}</Field>
          <Field label="Human decision">{pack.liability.humanDecision}</Field>
          <Field label="Policy bypassed">
            <span className={pack.liability.bypassedPolicy ? "text-red-200" : "text-emerald-200"}>
              {pack.liability.bypassedPolicy ? "Yes" : "No"}
            </span>
          </Field>
          <Field label="Exposure assessment">{pack.liability.exposureAssessment}</Field>
        </div>
      </section>

      <p className="mt-6 text-xs leading-6 text-neutral-500">
        Generated from Ovrule&apos;s signed decision receipt. Maps to EU AI Act Article 12 automatic-logging
        obligations (in force Aug 2, 2026) and to AI-liability underwriting/claims evidence requests.
      </p>
    </div>
  );
}
