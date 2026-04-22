"use client";

import { useState } from "react";

type ClassifyResponse = {
  label: "ship" | "rethink" | "escalate";
  confidence: number;
  summary: string;
  nextSteps: string[];
  source: "heuristic" | "openai";
};

type ContestResponse = {
  receiptId: string;
  message: string;
  stored: boolean;
};

const stakes = ["low", "medium", "high"] as const;

export function LabPanel() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [stakesValue, setStakesValue] = useState<(typeof stakes)[number]>("medium");
  const [rationale, setRationale] = useState("");
  const [email, setEmail] = useState("");
  const [classifyResult, setClassifyResult] = useState<ClassifyResponse | null>(null);
  const [contestResult, setContestResult] = useState<ContestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [contesting, setContesting] = useState(false);

  async function handleClassify() {
    setClassifying(true);
    setError(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          context,
          stakes: stakesValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Classification failed.");
      }

      setClassifyResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Classification failed.");
    } finally {
      setClassifying(false);
    }
  }

  async function handleContest() {
    setContesting(true);
    setError(null);

    try {
      const response = await fetch("/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          rationale,
          userEmail: email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Contest submission failed.");
      }

      setContestResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Contest submission failed.");
    } finally {
      setContesting(false);
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-receipt sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-dashed border-ink/15 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal">Decision Intake</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Create a decision receipt</h2>
          </div>
          <p className="font-mono text-sm text-ink/55">v0-lab</p>
        </div>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Decision</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              placeholder="Example: Roll out the pricing page redesign to all paid users next Monday."
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Context</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              placeholder="Constraints, assumptions, and timing."
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Stakes</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              value={stakesValue}
              onChange={(event) => setStakesValue(event.target.value as (typeof stakes)[number])}
            >
              {stakes.map((stake) => (
                <option key={stake} value={stake}>
                  {stake}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleClassify}
              disabled={classifying}
            >
              {classifying ? "Classifying..." : "Classify decision"}
            </button>
            <button
              className="rounded-full border border-ink/15 bg-sand px-5 py-3 text-sm font-medium text-ink transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleContest}
              disabled={contesting}
            >
              {contesting ? "Submitting..." : "Contest receipt"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-ink p-5 text-paper">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-paper/70">Contest Input</p>
            <p className="font-mono text-xs text-paper/50">Optional</p>
          </div>
          <div className="space-y-4">
            <textarea
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-paper outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              placeholder="Why should this receipt be challenged?"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-paper outline-none transition placeholder:text-paper/35 focus:border-coral focus:ring-2 focus:ring-coral/20"
              placeholder="Optional email for follow-up"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal">Response</p>
          {classifyResult ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold capitalize text-ink">{classifyResult.label}</h3>
                <p className="font-mono text-sm text-ink/55">
                  {Math.round(classifyResult.confidence * 100)}% / {classifyResult.source}
                </p>
              </div>
              <p className="text-sm leading-7 text-ink/75">{classifyResult.summary}</p>
              <ul className="space-y-2 text-sm text-ink/75">
                {classifyResult.nextSteps.map((step) => (
                  <li key={step} className="rounded-2xl bg-paper px-4 py-3">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-ink/60">
              Run `/api/classify` from the UI to generate a receipt label, confidence score, and next steps.
            </p>
          )}
        </div>

        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal">Contest Log</p>
          {contestResult ? (
            <div className="mt-4 space-y-3 text-sm text-ink/75">
              <p>{contestResult.message}</p>
              <p className="font-mono text-xs text-ink/50">{contestResult.receiptId}</p>
              <p>{contestResult.stored ? "Stored in Supabase." : "Supabase not configured, returned locally only."}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-ink/60">
              Contest submissions hash the decision and can persist metadata to Supabase when credentials are present.
            </p>
          )}
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
