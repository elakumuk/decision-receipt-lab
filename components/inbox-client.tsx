"use client";

import { useState } from "react";
import type { InboxCase, InboxDecision } from "@/lib/inbox-data";

type Verdict = "approved" | "denied";

interface DecidedRecord {
  verdict: Verdict;
  rationale: string;
  at: string;
}

function decisionTone(decision: InboxDecision) {
  return decision === "REFUSED"
    ? "border-red-400/25 bg-red-400/10 text-red-200"
    : "border-amber-400/25 bg-amber-400/10 text-amber-200";
}

function shortId(id: string) {
  // deterministic short reference so decided cards read like a signed record
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0").slice(0, 8);
}

export function InboxClient({ cases }: { cases: InboxCase[] }) {
  const [decisions, setDecisions] = useState<Record<string, DecidedRecord>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const pending = cases.filter((c) => !decisions[c.id]);
  const decided = cases.filter((c) => decisions[c.id]);

  function decide(id: string, verdict: Verdict) {
    const rationale = (drafts[id] ?? "").trim();
    setDecisions((prev) => ({
      ...prev,
      [id]: { verdict, rationale, at: new Date().toISOString() },
    }));
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          <span className="text-neutral-100">{pending.length}</span> need your decision
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
          {decided.length} decided
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {pending.map((c) => (
          <article
            key={c.id}
            className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {c.context}
                </p>
                <h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-neutral-50">
                  {c.title}
                </h3>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.16em] ${decisionTone(
                  c.decision,
                )}`}
              >
                {c.decision}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-neutral-300">
              <span className="text-neutral-500">The agent wants to: </span>
              {c.proposedAction}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Who&apos;s affected
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  {c.affectedParties.join(" · ")}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Rules triggered
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.triggeredRules.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-neutral-300"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3 text-sm leading-6 text-neutral-400">
              {c.whyNeedsHuman}
            </p>

            <div className="mt-4">
              <label
                htmlFor={`rationale-${c.id}`}
                className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
              >
                Your reason (kept on the signed record)
              </label>
              <textarea
                id={`rationale-${c.id}`}
                value={drafts[c.id] ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                }
                rows={2}
                placeholder="Why are you approving or denying this?"
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-white/25"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => decide(c.id, "approved")}
                className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => decide(c.id, "denied")}
                className="rounded-full border border-red-400/30 bg-red-400/10 px-5 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-400/20"
              >
                Deny
              </button>
            </div>
          </article>
        ))}

        {pending.length === 0 ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-8 text-center text-sm text-neutral-400">
            Inbox clear. Every pending action has a decision on the record.
          </div>
        ) : null}
      </div>

      {decided.length > 0 ? (
        <div className="mt-12">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Decided — signed record
          </p>
          <div className="mt-5 space-y-4">
            {decided.map((c) => {
              const d = decisions[c.id];
              const approved = d.verdict === "approved";
              return (
                <div
                  key={c.id}
                  className="rounded-[20px] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-neutral-200">{c.title}</p>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.14em] ${
                        approved
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                          : "border-red-400/30 bg-red-400/10 text-red-200"
                      }`}
                    >
                      {approved ? "APPROVED" : "DENIED"}
                    </span>
                  </div>
                  {d.rationale ? (
                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      &ldquo;{d.rationale}&rdquo;
                    </p>
                  ) : (
                    <p className="mt-3 text-sm italic text-neutral-500">
                      No reason recorded.
                    </p>
                  )}
                  <p className="mt-3 font-mono text-[11px] text-neutral-500">
                    recorded &amp; signed · {shortId(c.id)} · {d.at}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
