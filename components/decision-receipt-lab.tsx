"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeAlert,
  Check,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  FileWarning,
  Fingerprint,
  GitBranch,
  Loader2,
  Scale,
  ShieldAlert,
  Siren,
  Stamp,
  UserRoundCheck,
  Users,
  Waypoints,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CaseFileReceipt, HistoryEvent } from "@/lib/schemas";
import type { ReactNode } from "react";

type LegacyReceipt = {
  decision: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
  summary: string;
  ruleTrace: CaseFileReceipt["ruleTrace"];
  hash: string;
  timestamp: string;
  receiptId: string;
};

type ReceiptResponse = Partial<CaseFileReceipt> & LegacyReceipt;

type ContestResponse = {
  success: true;
  contestId: string;
};

type OverrideResponse = {
  success: true;
  overrideId: string;
  historyEventId: string;
  createdAt: string;
};

const githubUrl = "https://github.com/elakumuk/decision-receipt-lab";
const liveUrl = "https://decision-receipt-lab.vercel.app";

const exampleScenarios = [
  {
    label: "Bulk deletion",
    value:
      "An operations agent wants to delete inactive user accounts in bulk after guessing which accounts are abandoned, without sending a warning first.",
  },
  {
    label: "Price change",
    value:
      "A pricing agent wants to increase plan prices for all active customers overnight because conversion stayed strong last week.",
  },
  {
    label: "Send mass email",
    value:
      "A marketing agent wants to send a promotional email to all customers in California using last quarter's list, including users whose consent status is unclear.",
  },
] as const;

const contestCategories = [
  "incorrect_classification",
  "missing_context",
  "rule_disagreement",
  "other",
] as const;

const overrideOptions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "annotate", label: "Annotate" },
] as const;

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
        {index}
      </span>
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-sm font-medium tracking-[-0.01em] text-neutral-200">{title}</span>
    </div>
  );
}

function surfaceTone(decision: ReceiptResponse["decision"]) {
  if (decision === "ADMISSIBLE") {
    return {
      badge: "border-emerald-400/35 bg-emerald-400/8 text-emerald-200",
      lane: "bg-emerald-400",
      soft: "border-emerald-400/20 bg-emerald-400/8",
    };
  }

  if (decision === "AMBIGUOUS") {
    return {
      badge: "border-amber-400/35 bg-amber-400/8 text-amber-200",
      lane: "bg-amber-400",
      soft: "border-amber-400/20 bg-amber-400/8",
    };
  }

  return {
    badge: "border-red-400/35 bg-red-400/8 text-red-200",
    lane: "bg-red-400",
    soft: "border-red-400/20 bg-red-400/8",
  };
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

function severityTone(severity: CaseFileReceipt["severity"] | undefined) {
  if (severity === "low") {
    return "bg-emerald-400";
  }

  if (severity === "medium") {
    return "bg-amber-400";
  }

  return "bg-red-400";
}

function decisionIcon(decision: ReceiptResponse["decision"]) {
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

function eventIcon(eventType: HistoryEvent["eventType"]) {
  switch (eventType) {
    case "created":
      return <Fingerprint className="h-4 w-4 text-neutral-300" />;
    case "contested":
      return <GitBranch className="h-4 w-4 text-amber-300" />;
    case "overridden":
      return <Scale className="h-4 w-4 text-cyan-200" />;
    case "annotated":
      return <ClipboardList className="h-4 w-4 text-neutral-300" />;
    default:
      return <ArrowRightLeft className="h-4 w-4 text-neutral-300" />;
  }
}

function eventLabel(eventType: HistoryEvent["eventType"]) {
  switch (eventType) {
    case "created":
      return "Created";
    case "contested":
      return "Contested";
    case "overridden":
      return "Override";
    case "annotated":
      return "Annotation";
    default:
      return "Revision";
  }
}

function toTitle(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ReceiptRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3 text-left transition hover:border-white/14 hover:bg-white/[0.03]"
    >
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
        <p className="mt-1 break-all font-mono text-sm text-neutral-200">{value}</p>
      </div>
      <div className="shrink-0 rounded-full border border-white/8 p-2 text-neutral-400 transition group-hover:text-neutral-200">
        {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </div>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/8 bg-white/[0.02] px-8 text-center">
      <div className="rounded-full border border-white/8 bg-white/[0.03] p-3 text-neutral-300">{icon}</div>
      <p className="mt-4 text-sm font-medium text-neutral-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">{body}</p>
    </div>
  );
}

function LoadingSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`space-y-4 ${compact ? "pt-2" : "pt-4"}`}>
      <div className="h-4 w-24 animate-pulse rounded-full bg-white/[0.05]" />
      <div className="h-12 w-40 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="h-5 w-full animate-pulse rounded-full bg-white/[0.04]" />
      <div className="h-5 w-4/5 animate-pulse rounded-full bg-white/[0.04]" />
      <div className="space-y-3 pt-4">
        {[0, 1, 2].map((key) => (
          <div key={key} className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
            <div className="h-4 w-36 animate-pulse rounded-full bg-white/[0.05]" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/[0.04]" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeReceipt(receipt: ReceiptResponse | null) {
  if (!receipt) {
    return null;
  }

  return {
    ...receipt,
    scenario: receipt.scenario ?? "",
    proposedAction: receipt.proposedAction ?? receipt.scenario ?? "",
    claimedGoal: receipt.claimedGoal ?? "Outcome not separately specified in the submitted scenario.",
    affectedParties: receipt.affectedParties ?? [],
    authorityBasis: receipt.authorityBasis ?? "Authority basis not specified in the returned payload.",
    evidenceUsed: receipt.evidenceUsed ?? [],
    evidenceMissing: receipt.evidenceMissing ?? [],
    severity: receipt.severity ?? "medium",
    riskScore: receipt.riskScore ?? 50,
    whyOkay: receipt.whyOkay ?? [],
    whyFail: receipt.whyFail ?? [],
    missingInformation: receipt.missingInformation ?? [],
    receiptMetadata: receipt.receiptMetadata ?? {
      receiptId: receipt.receiptId,
      hash: receipt.hash,
      timestamp: receipt.timestamp,
    },
    history: receipt.history ?? [],
    challengeHistory: receipt.challengeHistory ?? [],
  };
}

export function DecisionReceiptLab({
  initialScenario = "",
  initialReceipt = null,
  showChrome = true,
}: {
  initialScenario?: string;
  initialReceipt?: ReceiptResponse | null;
  showChrome?: boolean;
}) {
  const [scenario, setScenario] = useState(initialScenario);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(initialReceipt);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContestOpen, setIsContestOpen] = useState(false);
  const [contestCategory, setContestCategory] =
    useState<(typeof contestCategories)[number]>("incorrect_classification");
  const [contestReason, setContestReason] = useState("");
  const [isContesting, setIsContesting] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [overrideDecision, setOverrideDecision] =
    useState<(typeof overrideOptions)[number]["value"]>("annotate");
  const [overrideAnnotation, setOverrideAnnotation] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const caseFile = normalizeReceipt(receipt);
  const tone = caseFile ? surfaceTone(caseFile.decision) : null;
  const combinedHistory = useMemo(() => {
    if (!caseFile) {
      return [];
    }

    const seen = new Set<string>();
    return [...caseFile.history, ...caseFile.challengeHistory]
      .filter((event) => {
        if (seen.has(event.id)) {
          return false;
        }
        seen.add(event.id);
        return true;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [caseFile]);

  const downloadHref = caseFile
    ? `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(caseFile, null, 2))}`
    : "";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setToastMessage(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to classify this action.");
      }

      setReceipt(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to classify this action.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleContestSubmit() {
    setIsContesting(true);
    setError(null);
    setToastMessage(null);

    try {
      if (!caseFile) {
        throw new Error("No case file is available to contest.");
      }

      const response = await fetch("/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId: caseFile.receiptId,
          reason: contestReason,
          category: contestCategory,
        }),
      });

      const data = (await response.json()) as ContestResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to contest this decision.");
      }

      const createdAt = new Date().toISOString();
      const contestEvent: HistoryEvent = {
        id: data.contestId,
        receiptId: caseFile.receiptId,
        eventType: "contested",
        actorType: "user",
        actorLabel: "contest",
        note: contestReason,
        payload: { category: contestCategory },
        createdAt,
      };

      setReceipt({
        ...caseFile,
        history: [contestEvent, ...caseFile.history],
        challengeHistory: [contestEvent, ...caseFile.challengeHistory],
      });
      setToastMessage(`Contest logged. Receipt ID: ${caseFile.receiptId}`);
      setIsContestOpen(false);
      setContestReason("");
      setContestCategory("incorrect_classification");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to contest this decision.");
    } finally {
      setIsContesting(false);
    }
  }

  async function handleOverrideSubmit() {
    setIsOverriding(true);
    setError(null);
    setToastMessage(null);

    try {
      if (!caseFile) {
        throw new Error("No case file is available to override.");
      }

      const response = await fetch("/api/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId: caseFile.receiptId,
          reviewerName,
          overrideDecision,
          annotation: overrideAnnotation,
        }),
      });

      const data = (await response.json()) as OverrideResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to log this override.");
      }

      const overrideEvent: HistoryEvent = {
        id: data.historyEventId,
        receiptId: caseFile.receiptId,
        eventType: "overridden",
        actorType: "human_reviewer",
        actorLabel: reviewerName,
        note: overrideAnnotation,
        payload: { overrideDecision, overrideId: data.overrideId },
        createdAt: data.createdAt,
      };

      setReceipt({
        ...caseFile,
        history: [overrideEvent, ...caseFile.history],
      });
      setToastMessage(`Override logged. Reviewer: ${reviewerName}`);
      setIsOverrideOpen(false);
      setReviewerName("");
      setOverrideDecision("annotate");
      setOverrideAnnotation("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to log this override.");
    } finally {
      setIsOverriding(false);
    }
  }

  async function handleCopy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    window.setTimeout(() => {
      setCopiedField((current) => (current === label ? null : current));
    }, 1200);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0b] text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.055),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        {showChrome ? (
          <header className="mb-6 flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.03em] text-neutral-50">Ovrule</p>
              <p className="mt-1 text-sm text-neutral-500">Auditable case files for AI agent decisions</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:text-neutral-100"
              >
                GitHub
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-400">
                Built with OpenAI Codex
              </div>
            </div>
          </header>
        ) : null}

        <div className="grid flex-1 gap-4 xl:grid-cols-[1.08fr_1.15fr_1fr_0.94fr]">
          <motion.section
            {...panelMotion}
            className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          >
            <SectionLabel index="01" title="Propose an action" />
            <div>
              <label className="text-sm font-medium text-neutral-100">Scenario input</label>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Describe the proposed AI action, the intended outcome, and any stated permission or policy basis.
              </p>
            </div>

            <textarea
              rows={11}
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
              placeholder="Example: Agent wants to send a promotional email to all customers in California using last quarter's list, including users whose consent status is unclear."
              className="mt-4 w-full rounded-[24px] border border-white/10 bg-[#0b0b0d] px-4 py-4 text-sm leading-6 text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {exampleScenarios.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setScenario(example.value)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-neutral-100"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || scenario.trim().length === 0}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-neutral-100 px-4 py-3.5 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
              {isSubmitting ? "Classifying…" : "Request case file"}
            </button>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Current framing</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-400">
                <p>
                  <span className="text-neutral-200">Claimed goal:</span>{" "}
                  {caseFile?.claimedGoal ?? "Will be extracted after classification."}
                </p>
                <p>
                  <span className="text-neutral-200">Authority basis:</span>{" "}
                  {caseFile?.authorityBasis ?? "Will be assessed from the submitted scenario."}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            {...panelMotion}
            transition={{ ...panelMotion.transition, delay: 0.04 }}
            className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          >
            <SectionLabel index="02" title="Decision" />

            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div key="decision-loading" {...panelMotion}>
                  <LoadingSkeleton />
                </motion.div>
              ) : caseFile ? (
                <motion.div
                  key={caseFile.receiptId}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <div className={`rounded-[28px] border p-5 ${tone?.soft}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.18em] ${tone?.badge}`}>
                          {decisionIcon(caseFile.decision)}
                          {caseFile.decision}
                        </div>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-200">{caseFile.summary}</p>
                      </div>

                      <div className="min-w-[168px] rounded-[22px] border border-white/8 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Risk score</p>
                        <div className="mt-2 flex items-end gap-3">
                          <span className="text-3xl font-semibold tracking-[-0.03em] text-neutral-50">
                            {caseFile.riskScore}
                          </span>
                          <span className="mb-1 text-sm text-neutral-500">/100</span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/[0.05]">
                          <div
                            className={`h-2 rounded-full ${severityTone(caseFile.severity)}`}
                            style={{ width: `${caseFile.riskScore}%` }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-neutral-500">
                          <span>Low</span>
                          <span className="text-neutral-300">{caseFile.severity}</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                        <Check className="h-4 w-4 text-emerald-300" />
                        Why this might be okay
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                        {caseFile.whyOkay.length > 0 ? (
                          caseFile.whyOkay.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>No affirmative basis was returned.</li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                        <Siren className="h-4 w-4 text-red-300" />
                        Why this might fail
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                        {caseFile.whyFail.length > 0 ? (
                          caseFile.whyFail.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>No negative basis was returned.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {caseFile.ruleTrace.map((item) => (
                      <div
                        key={item.rule}
                        className="rounded-[22px] border border-white/8 bg-black/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{ruleIcon(item.verdict)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-neutral-100">{item.rule}</p>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] ${ruleTone(item.verdict)}`}
                              >
                                {item.verdict}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="decision-empty" {...panelMotion}>
                  <EmptyState
                    icon={<Scale className="h-5 w-5" />}
                    title="Decision appears here"
                    body="The case file will show the verdict, risk score, rule trace, and competing reasoning once the action is classified."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            {...panelMotion}
            transition={{ ...panelMotion.transition, delay: 0.08 }}
            className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          >
            <SectionLabel index="03" title="Evidence" />

            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div key="evidence-loading" {...panelMotion}>
                  <LoadingSkeleton compact />
                </motion.div>
              ) : caseFile ? (
                <motion.div
                  key={`evidence-${caseFile.receiptId}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                      <Waypoints className="h-4 w-4 text-neutral-300" />
                      Proposed action
                    </div>
                    <p className="mt-3 text-sm leading-7 text-neutral-300">{caseFile.proposedAction}</p>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                      <Users className="h-4 w-4 text-neutral-300" />
                      Affected parties
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {caseFile.affectedParties.length > 0 ? (
                        caseFile.affectedParties.map((party) => (
                          <div
                            key={`${party.label}-${party.type}`}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300"
                          >
                            {party.label} · {party.type} · {party.impact}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No affected parties were extracted.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      Evidence used
                    </div>
                    <div className="mt-3 space-y-3">
                      {caseFile.evidenceUsed.length > 0 ? (
                        caseFile.evidenceUsed.map((item) => (
                          <div key={`${item.label}-${item.summary}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-neutral-200">{item.label}</p>
                              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                                {toTitle(item.kind)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">{item.summary}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No explicit evidence items were returned.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                      <FileWarning className="h-4 w-4 text-amber-300" />
                      Missing information
                    </div>
                    <div className="mt-3 space-y-3">
                      {caseFile.missingInformation.length > 0 ? (
                        caseFile.missingInformation.map((item) => (
                          <div key={`${item.field}-${item.couldFlip}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-neutral-200">{item.field}</p>
                              <span className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                Could flip {item.couldFlip}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">{item.whyItMatters}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No missing information items were flagged.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                      <BadgeAlert className="h-4 w-4 text-amber-300" />
                      Evidence still missing
                    </div>
                    <div className="mt-3 space-y-3">
                      {caseFile.evidenceMissing.length > 0 ? (
                        caseFile.evidenceMissing.map((item) => (
                          <div key={`${item.label}-${item.summary}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-neutral-200">{item.label}</p>
                              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                                {toTitle(item.kind)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">{item.summary}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No additional evidence gaps were returned.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="evidence-empty" {...panelMotion}>
                  <EmptyState
                    icon={<Users className="h-5 w-5" />}
                    title="Evidence panel appears here"
                    body="This panel separates what the classifier used from what it still needs, so borderline verdicts become legible."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            {...panelMotion}
            transition={{ ...panelMotion.transition, delay: 0.12 }}
            className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          >
            <SectionLabel index="04" title="Case file timeline" />

            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div key="timeline-loading" {...panelMotion}>
                  <LoadingSkeleton compact />
                </motion.div>
              ) : caseFile ? (
                <motion.div
                  key={`timeline-${caseFile.receiptId}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-full flex-col"
                >
                  <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-position:0_0] [background-size:14px_14px]">
                    <ReceiptRow
                      label="Receipt ID"
                      value={caseFile.receiptMetadata.receiptId}
                      copied={copiedField === "receiptId"}
                      onCopy={() => handleCopy("receiptId", caseFile.receiptMetadata.receiptId)}
                    />
                    <div className="mt-3">
                      <ReceiptRow
                        label="Hash"
                        value={caseFile.receiptMetadata.hash}
                        copied={copiedField === "hash"}
                        onCopy={() => handleCopy("hash", caseFile.receiptMetadata.hash)}
                      />
                    </div>
                    <div className="mt-3">
                      <ReceiptRow
                        label="Timestamp"
                        value={caseFile.receiptMetadata.timestamp}
                        copied={copiedField === "timestamp"}
                        onCopy={() => handleCopy("timestamp", caseFile.receiptMetadata.timestamp)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setIsContestOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.05]"
                    >
                      <GitBranch className="h-4 w-4" />
                      Contest this decision
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOverrideOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/[0.12]"
                    >
                      <UserRoundCheck className="h-4 w-4" />
                      Reviewer override
                    </button>
                    <a
                      href={downloadHref}
                      download={`ovrule-case-file-${caseFile.hash}.json`}
                      className="text-sm text-neutral-400 transition hover:text-neutral-200"
                    >
                      Download as JSON
                    </a>
                  </div>

                  <div className="mt-5 flex-1 rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Decision history</p>
                    <div className="mt-4 space-y-4">
                      {combinedHistory.length > 0 ? (
                        combinedHistory.map((event, index) => (
                          <div key={event.id} className="relative pl-8">
                            {index < combinedHistory.length - 1 ? (
                              <div className="absolute left-[7px] top-7 h-[calc(100%+16px)] w-px bg-white/10" />
                            ) : null}
                            <div className="absolute left-0 top-1.5 rounded-full border border-white/8 bg-white/[0.04] p-1.5">
                              {eventIcon(event.eventType)}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-neutral-200">
                                  {eventLabel(event.eventType)}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                                  {event.actorLabel ?? event.actorType}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-neutral-500">{event.createdAt}</p>
                              {event.note ? (
                                <p className="mt-2 text-sm leading-6 text-neutral-400">{event.note}</p>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No timeline events yet.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="timeline-empty" {...panelMotion}>
                  <EmptyState
                    icon={<Fingerprint className="h-5 w-5" />}
                    title="Receipt and history appear here"
                    body="Metadata, contests, reviewer overrides, and revisions will stack into a signed case timeline."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>

        {showChrome ? (
          <footer className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Built with Codex. Ela Kumuk · 2026.</p>
            <div className="flex gap-4">
              <a href={githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-neutral-200">
                GitHub
              </a>
              <a href={liveUrl} target="_blank" rel="noreferrer" className="transition hover:text-neutral-200">
                Live URL
              </a>
            </div>
          </footer>
        ) : null}

        {error ? (
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-red-400/30 bg-red-400/12 px-4 py-3 text-sm text-red-100 shadow-xl shadow-black/30">
            {error}
          </div>
        ) : null}
        {toastMessage ? (
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-4 py-3 text-sm text-emerald-100 shadow-xl shadow-black/30">
            {toastMessage}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isContestOpen && caseFile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Contest decision</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-neutral-100">
                    Open a challenge
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContestOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-400 transition hover:text-neutral-100"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Current summary</p>
                <p className="mt-2 text-sm leading-6 text-neutral-300">{caseFile.summary}</p>
              </div>

              <label className="mt-5 block text-sm font-medium text-neutral-200">Category</label>
              <select
                value={contestCategory}
                onChange={(event) =>
                  setContestCategory(event.target.value as (typeof contestCategories)[number])
                }
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0a0a0b] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
              >
                {contestCategories.map((category) => (
                  <option key={category} value={category}>
                    {toTitle(category)}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-sm font-medium text-neutral-200">Reason</label>
              <textarea
                rows={5}
                value={contestReason}
                onChange={(event) => setContestReason(event.target.value)}
                placeholder="Describe what the case file missed or why the audit should be challenged."
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0a0a0b] px-4 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
              />
              <p className="mt-2 text-xs text-neutral-500">{contestReason.length}/500</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsContestOpen(false)}
                  className="rounded-[18px] border border-white/10 px-4 py-3 text-sm text-neutral-300 transition hover:text-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContestSubmit}
                  disabled={isContesting || contestReason.trim().length < 1 || contestReason.length > 500}
                  className="rounded-[18px] bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isContesting ? "Submitting…" : "Submit contest"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOverrideOpen && caseFile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Reviewer override</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-neutral-100">
                    Record a human decision
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-neutral-400 transition hover:text-neutral-100"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Current verdict</p>
                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${tone?.badge}`}>
                  {decisionIcon(caseFile.decision)}
                  {caseFile.decision}
                </div>
              </div>

              <label className="mt-5 block text-sm font-medium text-neutral-200">Reviewer name</label>
              <input
                value={reviewerName}
                onChange={(event) => setReviewerName(event.target.value)}
                placeholder="Treasury lead"
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0a0a0b] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15"
              />

              <label className="mt-5 block text-sm font-medium text-neutral-200">Override action</label>
              <select
                value={overrideDecision}
                onChange={(event) =>
                  setOverrideDecision(event.target.value as (typeof overrideOptions)[number]["value"])
                }
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0a0a0b] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15"
              >
                {overrideOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-sm font-medium text-neutral-200">Annotation</label>
              <textarea
                rows={5}
                value={overrideAnnotation}
                onChange={(event) => setOverrideAnnotation(event.target.value)}
                placeholder="Explain the reviewer decision or required remediation."
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0a0a0b] px-4 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-cyan-400/45 focus:ring-2 focus:ring-cyan-400/15"
              />
              <p className="mt-2 text-xs text-neutral-500">{overrideAnnotation.length}/500</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="rounded-[18px] border border-white/10 px-4 py-3 text-sm text-neutral-300 transition hover:text-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOverrideSubmit}
                  disabled={
                    isOverriding ||
                    reviewerName.trim().length < 1 ||
                    overrideAnnotation.trim().length < 1 ||
                    overrideAnnotation.length > 500
                  }
                  className="rounded-[18px] bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isOverriding ? "Logging…" : "Record override"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
