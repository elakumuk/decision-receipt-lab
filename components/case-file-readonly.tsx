"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCheck, CheckCircle2, Copy, ExternalLink, Fingerprint, Scale, ShieldAlert, XCircle } from "lucide-react";
import type { CaseFileReceipt, HistoryEvent } from "@/lib/schemas";

function surfaceTone(decision: CaseFileReceipt["decision"]) {
  if (decision === "ADMISSIBLE") {
    return "border-emerald-400/25 bg-emerald-400/8 text-emerald-200";
  }

  if (decision === "AMBIGUOUS") {
    return "border-amber-400/25 bg-amber-400/8 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/8 text-red-200";
}

function ruleTone(verdict: CaseFileReceipt["ruleTrace"][number]["verdict"]) {
  if (verdict === "PASS") {
    return "border-emerald-400/25 bg-emerald-400/8 text-emerald-200";
  }

  if (verdict === "WARN") {
    return "border-amber-400/25 bg-amber-400/8 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/8 text-red-200";
}

function decisionIcon(decision: CaseFileReceipt["decision"]) {
  if (decision === "ADMISSIBLE") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
  }

  if (decision === "AMBIGUOUS") {
    return <AlertTriangle className="h-5 w-5 text-amber-300" />;
  }

  return <ShieldAlert className="h-5 w-5 text-red-300" />;
}

function ruleIcon(verdict: CaseFileReceipt["ruleTrace"][number]["verdict"]) {
  if (verdict === "PASS") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }

  if (verdict === "WARN") {
    return <AlertTriangle className="h-4 w-4 text-amber-300" />;
  }

  return <XCircle className="h-4 w-4 text-red-300" />;
}

function eventLabel(event: HistoryEvent) {
  return event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
}

export function CaseFileReadonly({
  receipt,
  shared = false,
}: {
  receipt: CaseFileReceipt;
  shared?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const caseUrl = typeof window !== "undefined" ? `${window.location.origin}/case/${receipt.receiptId}` : "";

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1200);
  }

  return (
    <div className="space-y-5">
      {shared ? (
        <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Shared case</p>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.18em] ${surfaceTone(receipt.decision)}`}>
                {decisionIcon(receipt.decision)}
                {receipt.decision}
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-300">{receipt.summary}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copy(caseUrl, "share")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.05]"
              >
                {copied === "share" ? <CheckCheck className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                Share case
              </button>
              <a
                href={`/?scenario=${encodeURIComponent(receipt.scenario)}#tool`}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/14"
              >
                <ArrowRight className="h-4 w-4" />
                Re-audit this scenario
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Scenario</p>
          <p className="mt-4 text-sm leading-7 text-neutral-300">{receipt.scenario}</p>
          <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Claimed goal</p>
            <p className="mt-3 text-sm leading-6 text-neutral-300">{receipt.claimedGoal}</p>
          </div>
          <div className="mt-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Authority basis</p>
            <p className="mt-3 text-sm leading-6 text-neutral-300">{receipt.authorityBasis}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <section className="rounded-[34px] border border-white/8 bg-white/[0.03] p-6 sm:p-7">
            <div className={`rounded-[28px] border p-5 ${surfaceTone(receipt.decision)}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">What Ovrule concluded</p>
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.18em] ${surfaceTone(receipt.decision)}`}>
                    {decisionIcon(receipt.decision)}
                    {receipt.decision}
                  </div>
                  <p className="mt-5 text-base leading-8 text-neutral-200">{receipt.summary}</p>
                </div>
                <div className="min-w-[188px] rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Risk score</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-neutral-50">{receipt.riskScore}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">{receipt.severity}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {receipt.ruleTrace.map((item) => (
                <div key={item.rule} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{ruleIcon(item.verdict)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-neutral-100">{item.rule}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] ${ruleTone(item.verdict)}`}>
                          {item.verdict}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">{item.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">What the model used, and what it still needs</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-medium text-neutral-100">Evidence used</p>
                  <div className="mt-3 space-y-3">
                    {receipt.evidenceUsed.map((item) => (
                      <div key={`${item.label}-${item.summary}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                        <p className="text-sm font-medium text-neutral-200">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-neutral-400">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-medium text-neutral-100">Missing information</p>
                  <div className="mt-3 space-y-3">
                    {receipt.missingInformation.length > 0 ? (
                      receipt.missingInformation.map((item) => (
                        <div key={`${item.field}-${item.couldFlip}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                          <p className="text-sm font-medium text-neutral-200">{item.field}</p>
                          <p className="mt-2 text-sm leading-6 text-neutral-400">{item.whyItMatters}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500">No missing information items were recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">What got recorded</p>
              <div className="mt-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:14px_14px]">
                <button
                  type="button"
                  onClick={() => copy(receipt.receiptId, "id")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3 text-left"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Receipt ID</p>
                    <p className="mt-1 break-all font-mono text-sm text-neutral-200">{receipt.receiptId}</p>
                  </div>
                  {copied === "id" ? <CheckCheck className="h-4 w-4 text-neutral-200" /> : <Copy className="h-4 w-4 text-neutral-400" />}
                </button>
                <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Hash</p>
                  <p className="mt-1 font-mono text-sm text-neutral-200">{receipt.hash}</p>
                </div>
                <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Timestamp</p>
                  <p className="mt-1 font-mono text-sm text-neutral-200">{receipt.timestamp}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Decision history</p>
                <div className="mt-4 space-y-4">
                  {receipt.history.length > 0 ? (
                    receipt.history.map((event, index) => (
                      <div key={event.id} className="relative pl-8">
                        {index < receipt.history.length - 1 ? (
                          <div className="absolute left-[7px] top-7 h-[calc(100%+16px)] w-px bg-white/10" />
                        ) : null}
                        <div className="absolute left-0 top-1.5 rounded-full border border-white/8 bg-white/[0.04] p-1.5">
                          <Fingerprint className="h-4 w-4 text-neutral-300" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-neutral-200">{eventLabel(event)}</span>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                              {event.actorLabel ?? event.actorType}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">{event.createdAt}</p>
                          {event.note ? <p className="mt-2 text-sm leading-6 text-neutral-400">{event.note}</p> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">No follow-up actions recorded yet.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
