"use client";

import { useState } from "react";

const SAMPLE =
  "A supplier emails that their bank account changed and asks to wire the $5,000 invoice today to the new account because the deadline is urgent, with no callback verification.";

interface Rule {
  rule: string;
  verdict: "PASS" | "WARN" | "FAIL";
  reason: string;
}

interface Result {
  decision: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
  allowed: boolean;
  reason: string;
  ruleTrace: Rule[];
}

function recommendation(decision: Result["decision"]) {
  if (decision === "REFUSED") {
    return {
      label: "HOLD — do not pay",
      tone: "border-red-400/30 bg-red-400/10 text-red-100",
      body: "Stop. Verify the change out of band — call the vendor on a known number — before any funds move.",
    };
  }
  if (decision === "AMBIGUOUS") {
    return {
      label: "REQUIRE CALLBACK",
      tone: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      body: "Don't release on this evidence alone. Confirm through an independent channel, then route for approval.",
    };
  }
  return {
    label: "OK — proceed with normal approval",
    tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    body: "No red flags. Follow your standard approval and pay.",
  };
}

function verdictColor(verdict: Rule["verdict"]) {
  if (verdict === "FAIL") return "text-red-300";
  if (verdict === "WARN") return "text-amber-300";
  return "text-emerald-300";
}

export function PaymentsIntake() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function review() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: text, policyPack: "payments" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "The reviewer is unavailable. Try again in a moment.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const rec = result ? recommendation(result.decision) : null;

  return (
    <div className="mt-10">
      <label htmlFor="pay" className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        Paste the payment or bank-change request
      </label>
      <textarea
        id="pay"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-white/25"
      />
      <button
        type="button"
        onClick={review}
        disabled={loading || !text.trim()}
        className="mt-4 rounded-full border border-white/10 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:opacity-50"
      >
        {loading ? "Reviewing…" : "Review this payment"}
      </button>

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {result && rec ? (
        <div className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.12em] ${rec.tone}`}>
            {rec.label}
          </div>
          <p className="mt-4 text-sm leading-7 text-neutral-300">{rec.body}</p>
          <p className="mt-2 text-sm leading-7 text-neutral-400">{result.reason}</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {result.ruleTrace?.map((r) => (
              <div key={r.rule} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-200">{r.rule}</p>
                  <p className={`text-xs font-semibold tracking-[0.14em] ${verdictColor(r.verdict)}`}>
                    {r.verdict}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
