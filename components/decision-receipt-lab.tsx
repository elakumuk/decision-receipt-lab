"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type RuleTraceItem = {
  rule: string;
  verdict: "PASS" | "WARN" | "FAIL";
  reason: string;
};

type ReceiptResponse = {
  decision: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
  summary: string;
  ruleTrace: RuleTraceItem[];
  hash: string;
  timestamp: string;
  receiptId: string;
};

type ContestResponse = {
  success: true;
  contestId: string;
};

const exampleScenarios = [
  "Agent wants to send a promotional email to all customers in California.",
  "Agent plans to delete inactive user accounts after guessing they are abandoned.",
  "Agent wants to publish a public leaderboard of employee productivity scores.",
];

const contestCategories = [
  "incorrect_classification",
  "missing_context",
  "rule_disagreement",
  "other",
] as const;

const panelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

function verdictTone(verdict: ReceiptResponse["decision"] | RuleTraceItem["verdict"]) {
  if (verdict === "ADMISSIBLE" || verdict === "PASS") {
    return "border-emerald-500/40 bg-emerald-500/12 text-emerald-300";
  }

  if (verdict === "AMBIGUOUS" || verdict === "WARN") {
    return "border-amber-500/40 bg-amber-500/12 text-amber-300";
  }

  return "border-red-500/40 bg-red-500/12 text-red-300";
}

function ruleDot(verdict: RuleTraceItem["verdict"]) {
  if (verdict === "PASS") {
    return "bg-emerald-400";
  }

  if (verdict === "WARN") {
    return "bg-amber-400";
  }

  return "bg-red-400";
}

export function DecisionReceiptLab() {
  const [scenario, setScenario] = useState("");
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContestOpen, setIsContestOpen] = useState(false);
  const [contestCategory, setContestCategory] =
    useState<(typeof contestCategories)[number]>("incorrect_classification");
  const [contestReason, setContestReason] = useState("");
  const [isContesting, setIsContesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const downloadHref = receipt
    ? `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(receipt, null, 2))}`
    : "";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setToastMessage(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to request a decision.");
      }

      setReceipt(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to request a decision.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleContestSubmit() {
    setIsContesting(true);
    setError(null);
    setToastMessage(null);

    try {
      if (!receipt) {
        throw new Error("No receipt is available to contest.");
      }

      const response = await fetch("/api/contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId: receipt.receiptId,
          reason: contestReason,
          category: contestCategory,
        }),
      });

      const data = (await response.json()) as ContestResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to contest this decision.");
      }

      setToastMessage(`Contest logged. Receipt ID: ${receipt.receiptId}`);
      setIsContestOpen(false);
      setContestReason("");
      setContestCategory("incorrect_classification");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to contest this decision.");
    } finally {
      setIsContesting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Decision Receipt Lab</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
              Decision Receipt Lab
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Auditable refusal and decision receipts for AI agents.
            </p>
          </div>
        </header>

        <section className="flex flex-1 py-6">
          <div className="grid w-full gap-4 lg:grid-cols-3">
            <motion.section
              {...panelMotion}
              className="flex min-h-[28rem] flex-col rounded-3xl border border-white/10 bg-neutral-900/60 p-5 shadow-2xl shadow-black/20 backdrop-blur"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Scenario Input</p>
                <label className="mt-5 block text-sm font-medium text-neutral-100">
                  Describe the AI agent action
                </label>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Example: Agent wants to send a promotional email to all customers in California
                </p>
              </div>

              <textarea
                rows={8}
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                placeholder="Describe the proposed action, affected parties, user permission, and expected outcome."
                className="mt-4 w-full flex-1 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Requesting..." : "Request Decision"}
              </button>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Examples</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {exampleScenarios.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setScenario(example)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-neutral-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section
              {...panelMotion}
              transition={{ ...panelMotion.transition, delay: 0.05 }}
              className="flex min-h-[28rem] flex-col rounded-3xl border border-white/10 bg-neutral-900/60 p-5 shadow-2xl shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Decision</p>

              <AnimatePresence mode="wait">
                {receipt ? (
                  <motion.div
                    key={receipt.receiptId}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 flex h-full flex-col"
                  >
                    <div
                      className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.18em] ${verdictTone(receipt.decision)}`}
                    >
                      {receipt.decision}
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-300">{receipt.summary}</p>
                    <ul className="mt-6 space-y-3">
                      {receipt.ruleTrace.map((item) => (
                        <li
                          key={item.rule}
                          className="rounded-2xl border border-white/10 bg-neutral-950/70 px-4 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${ruleDot(item.verdict)}`} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-neutral-100">{item.rule}</span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] ${verdictTone(item.verdict)}`}
                                >
                                  {item.verdict}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-neutral-400">{item.reason}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ghost"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-neutral-950/50 px-6 text-center text-sm text-neutral-500"
                  >
                    Decision appears here
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.section
              {...panelMotion}
              transition={{ ...panelMotion.transition, delay: 0.1 }}
              className="flex min-h-[28rem] flex-col rounded-3xl border border-white/10 bg-neutral-900/60 p-5 shadow-2xl shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Receipt</p>

              <AnimatePresence mode="wait">
                {receipt ? (
                  <motion.div
                    key={`receipt-${receipt.receiptId}`}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 flex h-full flex-col"
                  >
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-neutral-950/70 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Receipt ID</p>
                        <p className="mt-1 break-all font-mono text-sm text-neutral-200">{receipt.receiptId}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Hash</p>
                        <p className="mt-1 font-mono text-sm text-neutral-200">{receipt.hash}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Timestamp</p>
                        <p className="mt-1 text-sm text-neutral-300">{receipt.timestamp}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsContestOpen(true)}
                      className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-400/15"
                    >
                      Contest this decision
                    </button>

                    <a
                      href={downloadHref}
                      download={`decision-receipt-${receipt.hash}.json`}
                      className="mt-3 inline-flex w-fit text-sm text-cyan-300 transition hover:text-cyan-200"
                    >
                      Download as JSON
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key="receipt-empty"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-neutral-950/50 px-6 text-center text-sm text-neutral-600"
                  >
                    Receipt metadata will appear after a decision is generated.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>
        </section>

        {error ? (
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-red-500/30 bg-red-500/12 px-4 py-3 text-sm text-red-200 shadow-xl shadow-black/30">
            {error}
          </div>
        ) : null}
        {toastMessage ? (
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-200 shadow-xl shadow-black/30">
            {toastMessage}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isContestOpen && receipt ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Contest Decision</p>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-100">Open a challenge</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContestOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-400 transition hover:text-neutral-100"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Current Summary</p>
                <p className="mt-2 text-sm leading-6 text-neutral-300">{receipt.summary}</p>
              </div>

              <label className="mt-6 block text-sm font-medium text-neutral-200">Category</label>
              <select
                value={contestCategory}
                onChange={(event) =>
                  setContestCategory(event.target.value as (typeof contestCategories)[number])
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              >
                {contestCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-sm font-medium text-neutral-200">Reason</label>
              <textarea
                rows={5}
                value={contestReason}
                onChange={(event) => setContestReason(event.target.value)}
                placeholder="Explain why this receipt should be challenged."
                className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p className="mt-2 text-xs text-neutral-500">{contestReason.length}/500</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsContestOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-neutral-300 transition hover:text-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContestSubmit}
                  disabled={
                    isContesting ||
                    contestReason.trim().length < 1 ||
                    contestReason.trim().length > 500
                  }
                  className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isContesting ? "Submitting..." : "Submit Contest"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
