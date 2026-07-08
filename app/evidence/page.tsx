import { StickyHeader } from "@/components/sticky-header";
import { EvidencePackView } from "@/components/evidence-pack";
import { sampleEvidencePack } from "@/lib/evidence";

export const metadata = {
  title: "Evidence Pack — Ovrule",
  description:
    "Export any governed AI-agent decision as EU AI Act Article 12 logbook evidence and an AI-liability dossier.",
};

export default function EvidencePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100">
      <StickyHeader />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              Evidence pack
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-neutral-50 sm:text-5xl">
              Proof, not just logs
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              Every governed decision exports two ways from the same signed receipt: a regulator-readable
              <span className="text-neutral-200"> EU AI Act Article 12</span> logbook, and an insurer-readable
              <span className="text-neutral-200"> AI-liability dossier</span>. Standard logs can be silently
              altered; these are tamper-evident.
            </p>
          </div>
          <EvidencePackView pack={sampleEvidencePack} />
        </div>
      </section>
    </main>
  );
}
