"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  BadgeAlert,
  Check,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileWarning,
  Fingerprint,
  GitBranch,
  Loader2,
  Scale,
  ShieldAlert,
  Siren,
  Stamp,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SimilarCasesSection } from "@/components/similar-cases-section";
import type {
  CaseFileReceipt,
  FixSuggestion,
  HistoryEvent,
  PolicyPackId,
  RevisionMetadata,
  RuleName,
  SimilarCase,
} from "@/lib/schemas";
import { inputScenarioChips } from "@/lib/site-content";

type LegacyReceipt = {
  decision: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
  summary: string;
  ruleTrace: CaseFileReceipt["ruleTrace"];
  hash: string;
  timestamp: string;
  receiptId: string;
};

type ReceiptResponse = Partial<CaseFileReceipt> & LegacyReceipt;
type ReceiptWithSuggestions = ReceiptResponse & {
  suggestedFixes?: FixSuggestion[];
};

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

type SuggestFixResponse = {
  suggestions: FixSuggestion[];
};

type StreamRuleState = {
  rule: RuleName;
  status: "pending" | "loading" | "done";
  verdict?: "PASS" | "WARN" | "FAIL";
  reason?: string;
};

type StreamState = {
  receiptId?: string;
  startedAt?: string;
  rules: StreamRuleState[];
};

type StreamEventPayload =
  | {
      type: "session.started";
      receiptId: string;
      startedAt: string;
      scenario: string;
    }
  | {
      type: "rule.started";
      rule: RuleName;
      index: number;
    }
  | {
      type: "rule.completed";
      rule: RuleName;
      index: number;
      verdict: "PASS" | "WARN" | "FAIL";
      reason: string;
    }
  | {
      type: "analysis.completed";
      receipt: CaseFileReceipt;
    }
  | {
      type: "session.error";
      message: string;
    };

const RULE_SEQUENCE: RuleName[] = [
  "SAFETY",
  "AUTHORIZATION",
  "CAUSAL VALIDITY",
  "REVERSIBILITY",
  "IMPACT SCOPE",
  "CONSENT",
];

const exampleScenarios = inputScenarioChips;

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

const policyPackOptions: Array<{ value: PolicyPackId; label: string }> = [
  { value: "general", label: "General" },
  { value: "customer_support", label: "Customer Support" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
];

function surfaceTone(decision: ReceiptResponse["decision"]) {
  if (decision === "ADMISSIBLE") {
    return {
      badge: "border-emerald-400/35 bg-emerald-400/8 text-emerald-200",
      soft: "border-emerald-400/20 bg-emerald-400/8",
    };
  }

  if (decision === "AMBIGUOUS") {
    return {
      badge: "border-amber-400/35 bg-amber-400/8 text-amber-200",
      soft: "border-amber-400/20 bg-amber-400/8",
    };
  }

  return {
    badge: "border-red-400/35 bg-red-400/8 text-red-200",
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

function decisionRank(decision: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED") {
  if (decision === "ADMISSIBLE") {
    return 0;
  }

  if (decision === "AMBIGUOUS") {
    return 1;
  }

  return 2;
}

function normalizeReceipt(receipt: ReceiptWithSuggestions | null) {
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
    policyPack: receipt.policyPack ?? "general",
    receiptMetadata: receipt.receiptMetadata ?? {
      receiptId: receipt.receiptId,
      hash: receipt.hash,
      timestamp: receipt.timestamp,
    },
    signature: receipt.signature ?? "",
    history: receipt.history ?? [],
    challengeHistory: receipt.challengeHistory ?? [],
    suggestedFixes: receipt.suggestedFixes ?? [],
  };
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

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-white/8 bg-white/[0.02] px-8 py-14 text-center">
      <div className="rounded-full border border-white/10 bg-white/[0.03] p-3 text-neutral-300">{icon}</div>
      <p className="mt-4 text-base font-medium text-neutral-100">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-7 text-neutral-500">{body}</p>
    </div>
  );
}

function InputComposer({
  scenario,
  policyPack,
  onChange,
  onPolicyPackChange,
  onSubmit,
  isSubmitting,
}: {
  scenario: string;
  policyPack: PolicyPackId;
  onChange: (value: string) => void;
  onPolicyPackChange: (value: PolicyPackId) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-[36px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Show the action you want reviewed</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-50 sm:text-[2.4rem]">
          What is the agent about to do, exactly?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
          Write the action the agent wants to take and anything it thinks gives it permission.
        </p>
      </div>

      <textarea
        rows={8}
        value={scenario}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g., 'Support agent wants to refund $500 without manager approval after a complaint thread escalated.'"
        className="mt-7 w-full rounded-[28px] border border-white/10 bg-[#0b0b0d] px-5 py-5 text-sm leading-7 text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
      />

      <div className="mt-5">
        <label className="block text-sm font-medium text-neutral-200">Policy pack</label>
        <select
          value={policyPack}
          onChange={(event) => onPolicyPackChange(event.target.value as PolicyPackId)}
          className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
        >
          {policyPackOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option disabled>Custom pack — coming soon</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {exampleScenarios.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => onChange(example.value)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-neutral-100"
          >
            {example.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || scenario.trim().length === 0}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-neutral-100 px-4 py-4 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
        {isSubmitting ? "Classifying…" : "Open the case file"}
      </button>
    </div>
  );
}

function StreamRuleRow({ item }: { item: StreamRuleState }) {
  if (item.status === "done" && item.verdict && item.reason) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-white/8 bg-black/20 p-4"
      >
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
      </motion.div>
    );
  }

  return (
    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-3 w-3 rounded-full bg-white/[0.14]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-neutral-200">{item.rule}</p>
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              {item.status === "loading" ? "Evaluating…" : "Queued"}
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-3 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent ${
                item.status === "loading" ? "animate-pulse" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function parseSseBlock(block: string): { event?: string; data?: string } | null {
  const lines = block.split("\n");
  let eventName: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!eventName || dataLines.length === 0) {
    return null;
  }

  return {
    event: eventName,
    data: dataLines.join("\n"),
  };
}

export function DecisionReceiptLab({
  initialScenario = "",
  initialReceipt = null,
}: {
  initialScenario?: string;
  initialReceipt?: ReceiptWithSuggestions | null;
}) {
  const [scenario, setScenario] = useState(initialScenario);
  const [receipt, setReceipt] = useState<ReceiptWithSuggestions | null>(initialReceipt);
  const [policyPack, setPolicyPack] = useState<PolicyPackId>(initialReceipt?.policyPack ?? "general");
  const [streamState, setStreamState] = useState<StreamState | null>(null);
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
  const [showFixes, setShowFixes] = useState(false);
  const [suggestions, setSuggestions] = useState<FixSuggestion[]>(initialReceipt?.suggestedFixes ?? []);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [decisionGlow, setDecisionGlow] = useState<"improved" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const receiptArrivedRef = useRef(false);

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

  const showWorkspace = Boolean(caseFile || streamState || isSubmitting);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!caseFile?.receiptId) {
      setSimilarCases([]);
      return;
    }

    let isActive = true;
    setIsLoadingSimilar(true);

    fetch(`/api/similar/${caseFile.receiptId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load similar cases.");
        }

        return response.json() as Promise<{ similar: SimilarCase[] }>;
      })
      .then((data) => {
        if (isActive) {
          setSimilarCases(data.similar ?? []);
        }
      })
      .catch(() => {
        if (isActive) {
          setSimilarCases([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingSimilar(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [caseFile?.receiptId]);

  async function handleSubmit(options?: {
    scenarioOverride?: string;
    revision?: RevisionMetadata;
    previousDecision?: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
  }) {
    const nextScenario = options?.scenarioOverride ?? scenario;

    setIsSubmitting(true);
    setError(null);
    setToastMessage(null);
    setSuggestionError(null);
    setReceipt(null);
    setSuggestions([]);
    setShowFixes(false);
    setDecisionGlow(null);
    receiptArrivedRef.current = false;
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setStreamState({
      rules: RULE_SEQUENCE.map((rule) => ({ rule, status: "pending" })),
    });

    try {
      let latestReceiptId: string | undefined;

      const clearFallbackTimer = () => {
        if (fallbackTimerRef.current) {
          window.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      };

      const scheduleFinalFallback = () => {
        clearFallbackTimer();
        fallbackTimerRef.current = window.setTimeout(async () => {
          if (receiptArrivedRef.current) {
            return;
          }

          if (!latestReceiptId) {
            if (receiptArrivedRef.current) {
              return;
            }
            setStreamState(null);
            setError("The audit finished rule checks but never delivered the final case file.");
            return;
          }

          try {
            const fallbackResponse = await fetch(`/api/receipts/${latestReceiptId}`);

            if (!fallbackResponse.ok) {
              throw new Error("Receipt fetch failed after stream completion timeout.");
            }

            const fallbackReceipt = (await fallbackResponse.json()) as CaseFileReceipt;
            console.info("[classify-client] fallback receipt fetch succeeded", {
              receiptId: fallbackReceipt.receiptId,
            });
            receiptArrivedRef.current = true;
            setReceipt(fallbackReceipt);
            setScenario(fallbackReceipt.scenario);
            setStreamState(null);
            setError(null);
          } catch (fallbackError) {
            if (receiptArrivedRef.current) {
              return;
            }
            console.error("[classify-client] fallback receipt fetch failed", fallbackError);
            setStreamState(null);
            setError(
              "The audit completed rule evaluation, but the final case file did not arrive. Please retry.",
            );
          }
        }, 90_000);
      };

      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: nextScenario,
          policyPack,
          revision: options?.revision,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to classify this action.");
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No response stream was returned.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const parsedBlock = parseSseBlock(block);

          if (!parsedBlock?.data) {
            continue;
          }

          const payload = JSON.parse(parsedBlock.data) as StreamEventPayload;

          if (payload.type === "session.started") {
            latestReceiptId = payload.receiptId;
            setStreamState((current) => ({
              receiptId: payload.receiptId,
              startedAt: payload.startedAt,
              rules: current?.rules ?? RULE_SEQUENCE.map((rule) => ({ rule, status: "pending" })),
            }));
            continue;
          }

          if (payload.type === "rule.started") {
            setStreamState((current) =>
              current
                ? {
                    ...current,
                    rules: current.rules.map((rule, index) =>
                      index === payload.index ? { ...rule, status: "loading" } : rule,
                    ),
                  }
                : current,
            );
            continue;
          }

          if (payload.type === "rule.completed") {
            setStreamState((current) =>
              current
                ? {
                    ...current,
                    rules: current.rules.map((rule, index) =>
                      index === payload.index
                        ? {
                            ...rule,
                            status: "done",
                            verdict: payload.verdict,
                            reason: payload.reason,
                          }
                        : rule,
                    ),
                  }
                : current,
            );
            if (payload.index === RULE_SEQUENCE.length - 1) {
              scheduleFinalFallback();
            }
            continue;
          }

          if (payload.type === "analysis.completed") {
            receiptArrivedRef.current = true;
            clearFallbackTimer();
            console.info("[classify-client] received analysis.completed", {
              receiptId: payload.receipt.receiptId,
              decision: payload.receipt.decision,
            });
            setReceipt(payload.receipt);
            setScenario(payload.receipt.scenario);
            setError(null);
            if (
              options?.previousDecision &&
              decisionRank(payload.receipt.decision) < decisionRank(options.previousDecision)
            ) {
              setDecisionGlow("improved");
              window.setTimeout(() => setDecisionGlow(null), 900);
            }
            setStreamState(null);
            continue;
          }

          if (payload.type === "session.error") {
            throw new Error(payload.message);
          }
        }
      }
    } catch (caughtError) {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setStreamState(null);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to classify this action.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSuggestFixes() {
    if (!caseFile) {
      return;
    }

    if (suggestions.length > 0 || caseFile.suggestedFixes.length > 0) {
      setSuggestions(suggestions.length > 0 ? suggestions : caseFile.suggestedFixes);
      setShowFixes(true);
      return;
    }

    setIsSuggesting(true);
    setSuggestionError(null);
    setShowFixes(true);

    try {
      const response = await fetch("/api/suggest-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: caseFile }),
      });

      const data = (await response.json()) as SuggestFixResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to suggest fixes right now.");
      }

      setSuggestions(data.suggestions);
      setReceipt({
        ...caseFile,
        suggestedFixes: data.suggestions,
      });
    } catch (caughtError) {
      setSuggestionError(
        caughtError instanceof Error ? caughtError.message : "Unable to suggest fixes right now.",
      );
    } finally {
      setIsSuggesting(false);
    }
  }

  async function handleApplyFix(suggestion: FixSuggestion) {
    if (!caseFile) {
      return;
    }

    setScenario(suggestion.rewrittenAction);
    await handleSubmit({
      scenarioOverride: suggestion.rewrittenAction,
      revision: {
        previousReceiptId: caseFile.receiptId,
        previousDecision: caseFile.decision,
        previousScenario: caseFile.scenario,
        appliedFix: suggestion.edit,
      },
      previousDecision: caseFile.decision,
    });
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
    <section id="tool" className="relative">
      <AnimatePresence mode="wait">
        {!showWorkspace ? (
          <motion.div key="empty-tool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InputComposer
              scenario={scenario}
              policyPack={policyPack}
              onChange={setScenario}
              onPolicyPackChange={setPolicyPack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <div className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-neutral-500">
              No case yet. Describe an agent action and Ovrule will open the file.
            </div>
          </motion.div>
        ) : (
          <motion.div key={caseFile?.receiptId ?? "streaming"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
              <motion.aside
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Case intake</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-50">
                  What is the agent about to do, exactly?
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  Rewrite the scenario or run a second case without leaving the current file.
                </p>

                <textarea
                  rows={9}
                  value={scenario}
                  onChange={(event) => setScenario(event.target.value)}
                  placeholder="e.g., 'Support agent wants to refund $500 without manager approval.'"
                  className="mt-6 w-full rounded-[26px] border border-white/10 bg-[#0b0b0d] px-4 py-4 text-sm leading-7 text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
                />

                <div className="mt-5">
                  <label className="block text-sm font-medium text-neutral-200">Policy pack</label>
                  <select
                    value={policyPack}
                    onChange={(event) => setPolicyPack(event.target.value as PolicyPackId)}
                    className="mt-2 w-full rounded-[20px] border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-amber-400/45 focus:ring-2 focus:ring-amber-400/15"
                  >
                    {policyPackOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option disabled>Custom pack — coming soon</option>
                  </select>
                </div>

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
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting || scenario.trim().length === 0}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-neutral-100 px-4 py-3.5 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
                  {isSubmitting ? "Classifying…" : "Re-audit this version"}
                </button>

                {caseFile ? (
                  <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Case framing</p>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-400">
                      <p>
                        <span className="text-neutral-200">Claimed goal:</span> {caseFile.claimedGoal}
                      </p>
                      <p>
                        <span className="text-neutral-200">Authority basis:</span> {caseFile.authorityBasis}
                      </p>
                    </div>
                  </div>
                ) : null}
              </motion.aside>

              <div className="space-y-5">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-7"
                >
                  {!caseFile ? (
                    <>
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">Live audit</p>
                      <h4 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-50">
                        Ovrule is evaluating the case rule by rule.
                      </h4>
                      <p className="mt-4 text-sm leading-7 text-neutral-400">
                        Verdict, summary, and risk score will appear after all six rule checks complete.
                      </p>

                      <div className="mt-6 space-y-3">
                        <AnimatePresence initial={false}>
                          {(streamState?.rules ?? RULE_SEQUENCE.map((rule) => ({ rule, status: "pending" as const }))).map((item) => (
                            <StreamRuleRow key={item.rule} item={item} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <>
                      {caseFile.decision === "REFUSED" ? (
                        <div className="pointer-events-none absolute right-6 top-8 rotate-[-12deg] rounded-full border border-red-400/35 bg-red-400/10 px-5 py-2 font-mono text-xs uppercase tracking-[0.42em] text-red-300 shadow-[0_0_40px_rgba(248,113,113,0.08)]">
                          Refused
                        </div>
                      ) : null}

                      <div
                        className={`rounded-[28px] border p-5 transition-shadow duration-500 ${
                          tone?.soft
                        } ${decisionGlow === "improved" ? "shadow-[0_0_36px_rgba(52,211,153,0.18)]" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-3xl">
                            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                              What Ovrule concluded
                            </p>
                            <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-[0.18em] ${tone?.badge}`}>
                              {decisionIcon(caseFile.decision)}
                              {caseFile.decision}
                            </div>
                            <div className="mt-3">
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-300">
                                Audited under: {toTitle(caseFile.policyPack)}
                              </span>
                            </div>
                            <p className="mt-5 text-base leading-8 text-neutral-200">{caseFile.summary}</p>
                          </div>

                          <div className="min-w-[188px] rounded-[22px] border border-white/8 bg-black/20 p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Risk score</p>
                            <div className="mt-2 flex items-end gap-3">
                              <span className="text-4xl font-semibold tracking-[-0.05em] text-neutral-50">
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

                        {caseFile.decision !== "ADMISSIBLE" ? (
                          <div className="mt-5">
                            <button
                              type="button"
                              onClick={handleSuggestFixes}
                              disabled={isSuggesting}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.05] disabled:opacity-60"
                            >
                              {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                              Suggest fixes
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {showFixes && caseFile.decision !== "ADMISSIBLE" ? (
                        <div className="mt-5 rounded-[28px] border border-white/8 bg-black/20 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                                Fix this
                              </p>
                              <p className="mt-2 text-sm leading-6 text-neutral-400">
                                Concrete changes that could move failing or warning rules toward PASS.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowFixes(false)}
                              className="text-sm text-neutral-500 transition hover:text-neutral-200"
                            >
                              Hide
                            </button>
                          </div>

                          {suggestionError ? (
                            <p className="mt-4 text-sm text-red-300">{suggestionError}</p>
                          ) : null}

                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            {(suggestions.length > 0 ? suggestions : caseFile.suggestedFixes ?? []).map((suggestion) => (
                              <div
                                key={`${suggestion.edit}-${suggestion.rewrittenAction}`}
                                className="rounded-[24px] border border-white/8 bg-white/[0.02] p-4"
                              >
                                <p className="text-sm font-medium text-neutral-100">{suggestion.edit}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {suggestion.flips.map((flip) => (
                                    <span
                                      key={flip}
                                      className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-400"
                                    >
                                      {flip}
                                    </span>
                                  ))}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-neutral-400">
                                  {suggestion.rewrittenAction}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleApplyFix(suggestion)}
                                  disabled={isSubmitting}
                                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-400/35 hover:bg-emerald-400/14 disabled:opacity-60"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  Apply and re-audit
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                                <Check className="h-4 w-4 text-emerald-300" />
                                Why this might be okay
                              </div>
                              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                                {caseFile.whyOkay.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                                <Siren className="h-4 w-4 text-red-300" />
                                Why this might fail
                              </div>
                              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                                {caseFile.whyFail.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {caseFile.ruleTrace.map((item) => (
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
                        </div>

                        <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">Case core</p>
                          <div className="mt-4 space-y-4">
                            <div>
                              <p className="text-sm font-medium text-neutral-100">Proposed action</p>
                              <p className="mt-2 text-sm leading-7 text-neutral-400">{caseFile.proposedAction}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-100">Affected parties</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {caseFile.affectedParties.map((party) => (
                                  <span
                                    key={`${party.label}-${party.type}`}
                                    className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300"
                                  >
                                    {party.label} · {party.type} · {party.impact}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.section>

                <div className="grid gap-5 lg:grid-cols-2">
                  <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">What the model used, and what it still needs</p>
                    {!caseFile ? (
                      <div className="mt-4">
                        <StatusCard
                          icon={<FileWarning className="h-5 w-5" />}
                          title="Evidence is being assembled."
                          body="Ovrule waits until the full audit is done before revealing supporting evidence, missing information, and affected parties."
                        />
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            Evidence used
                          </div>
                          <div className="mt-3 space-y-3">
                            {caseFile.evidenceUsed.map((item) => (
                              <div key={`${item.label}-${item.summary}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-neutral-200">{item.label}</p>
                                  <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                                    {toTitle(item.kind)}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-neutral-400">{item.summary}</p>
                              </div>
                            ))}
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
                      </div>
                    )}
                  </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">What got recorded</p>
                    {!caseFile ? (
                      <div className="mt-4">
                        <StatusCard
                          icon={<Fingerprint className="h-5 w-5" />}
                          title="Receipt metadata is pending."
                          body="Hash, timestamp, history, and receipt links appear after the final case file is generated and stored."
                        />
                      </div>
                    ) : (
                      <div className="mt-4 flex h-full flex-col">
                        <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:14px_14px]">
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
                          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">
                            <CheckCircle2 className="h-4 w-4" />
                            <span title={`Signature ${caseFile.signature.slice(0, 18)}...`}>
                              Verified by Ovrule
                            </span>
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

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsContestOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.05]"
                          >
                            <GitBranch className="h-4 w-4" />
                            Disagree? File a contest
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsOverrideOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/[0.12]"
                          >
                            <UserRoundCheck className="h-4 w-4" />
                            Human review override
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                "share-case",
                                `${window.location.origin}/case/${caseFile.receiptId}`,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.05]"
                          >
                            {copiedField === "share-case" ? (
                              <CheckCheck className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            Share case
                          </button>
                          <a
                            href={downloadHref}
                            download={`ovrule-case-file-${caseFile.hash}.json`}
                            className="inline-flex items-center gap-1.5 px-1 py-3 text-sm text-neutral-400 transition hover:text-neutral-200"
                          >
                            Download the full case file
                            <ArrowRight className="h-3.5 w-3.5" />
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
                              <p className="text-sm text-neutral-500">No follow-up actions yet. This case has not been challenged or revised.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.section>
                </div>

                {caseFile ? (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-5"
                  >
                    <SimilarCasesSection similarCases={similarCases} isLoading={isLoadingSimilar} />
                  </motion.div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !caseFile ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-red-400/30 bg-red-400/12 px-4 py-3 text-sm text-red-100 shadow-xl shadow-black/30">
          {error}
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-4 py-3 text-sm text-emerald-100 shadow-xl shadow-black/30">
          {toastMessage}
        </div>
      ) : null}

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
                  {isContesting ? "Submitting…" : "File the contest"}
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
                  <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Human review override</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-neutral-100">
                    Add a reviewer decision
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
    </section>
  );
}
