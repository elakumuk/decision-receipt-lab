"use client";

import { useState } from "react";

const PRESETS = [
  "DROP TABLE users;",
  "rm -rf /var/www",
  "git push --force origin main",
  "commit PROD_API_KEY to a public repo",
  "npm test",
];

type Decision = "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";

interface LogEntry {
  command: string;
  status: "running" | "done" | "error";
  decision?: Decision;
  reason?: string;
  failed?: string[];
  error?: string;
}

function verdict(decision: Decision) {
  if (decision === "REFUSED") return { label: "BLOCKED", cls: "border-red-400/40 bg-red-400/10 text-red-300" };
  if (decision === "AMBIGUOUS") return { label: "HOLD", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" };
  return { label: "ALLOWED", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" };
}

export function AgentConsole() {
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(command: string) {
    const c = command.trim();
    if (!c || busy) return;
    setBusy(true);
    setCmd("");
    const idx = log.length;
    setLog((l) => [...l, { command: c, status: "running" }]);
    try {
      const res = await fetch("/api/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `An autonomous AI coding agent with production, database, and shell access wants to run this command: ${c}`,
        }),
      });
      const d = await res.json();
      if (!d || !d.decision) throw new Error(d?.error || "The guard is unavailable.");
      const failed = (d.ruleTrace || [])
        .filter((r: { verdict: string }) => r.verdict === "FAIL")
        .map((r: { rule: string }) => r.rule);
      setLog((l) =>
        l.map((e, i) => (i === idx ? { ...e, status: "done", decision: d.decision, reason: d.reason, failed } : e)),
      );
    } catch (e) {
      setLog((l) => l.map((e2, i) => (i === idx ? { ...e2, status: "error", error: (e as Error).message } : e2)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="rounded-[24px] border border-white/10 bg-black/40 p-6 font-mono text-[13px] leading-7">
        <div className="text-neutral-500">$ ovrule guard --watch <span className="opacity-70"># your AI coding agent, on a leash</span></div>

        <div className="mt-4 space-y-4">
          {log.map((e, i) => (
            <div key={i}>
              <div>
                <span className="text-sky-300">agent ▸</span> <span className="text-neutral-200">run</span>{" "}
                <span className="font-semibold text-neutral-50">{e.command}</span>
              </div>
              {e.status === "running" ? (
                <div className="text-neutral-500">ovrule · reviewing the action…</div>
              ) : e.status === "error" ? (
                <div className="text-red-300">ovrule · {e.error}</div>
              ) : e.decision ? (
                <div>
                  <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-[0.12em] ${verdict(e.decision).cls}`}>
                    {verdict(e.decision).label}
                  </span>{" "}
                  {e.failed && e.failed.length > 0 ? (
                    <span className="text-red-300/90">{e.failed.map((f) => f.toLowerCase()).join(" · ")}</span>
                  ) : null}
                  {e.reason ? <div className="mt-1 text-neutral-400">{e.reason}</div> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            run(cmd);
          }}
          className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4"
        >
          <span className="text-sky-300">agent ▸</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="type a command your agent wants to run…"
            disabled={busy}
            className="flex-1 bg-transparent text-neutral-100 outline-none placeholder:text-neutral-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !cmd.trim()}
            className="rounded-full border border-white/10 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-950 transition hover:bg-white disabled:opacity-40"
          >
            {busy ? "…" : "Run"}
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">try:</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => run(p)}
            disabled={busy}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[12px] text-neutral-300 transition hover:border-white/20 hover:text-neutral-100 disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
