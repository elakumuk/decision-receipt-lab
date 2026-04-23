export type Decision = "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
export type Verdict = "PASS" | "WARN" | "FAIL";
export type PolicyPackId = "general" | "customer_support" | "healthcare" | "finance";

export type RuleName =
  | "SAFETY"
  | "AUTHORIZATION"
  | "CAUSAL VALIDITY"
  | "REVERSIBILITY"
  | "IMPACT SCOPE"
  | "CONSENT";

export type RuleTraceItem = {
  rule: RuleName;
  verdict: Verdict;
  reason: string;
};

export type AffectedParty = {
  label: string;
  type: "user" | "customer" | "employee" | "third_party" | "public" | "system" | "other";
  impact: "low" | "medium" | "high";
};

export type EvidenceItem = {
  label: string;
  kind: "user_statement" | "policy" | "system_state" | "transaction_data" | "external_signal" | "other";
  summary: string;
};

export type MissingInformationItem = {
  field: string;
  whyItMatters: string;
  couldFlip: "PASS" | "WARN" | "FAIL" | "decision";
};

export type HistoryEvent = {
  id: string;
  receiptId: string;
  eventType: "created" | "contested" | "overridden" | "revised" | "annotated";
  actorType: "system" | "human_reviewer" | "user";
  actorLabel?: string;
  note?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type FixSuggestion = {
  edit: string;
  flips: string[];
  rewrittenAction: string;
};

export type CaseFileReceipt = {
  scenario: string;
  decision: Decision;
  proposedAction: string;
  claimedGoal: string;
  affectedParties: AffectedParty[];
  authorityBasis: string;
  evidenceUsed: EvidenceItem[];
  evidenceMissing: EvidenceItem[];
  severity: "low" | "medium" | "high";
  riskScore: number;
  summary: string;
  whyOkay: string[];
  whyFail: string[];
  missingInformation: MissingInformationItem[];
  ruleTrace: RuleTraceItem[];
  receiptId: string;
  hash: string;
  timestamp: string;
  receiptMetadata: {
    receiptId: string;
    hash: string;
    timestamp: string;
  };
  history: HistoryEvent[];
  challengeHistory: HistoryEvent[];
  policyPack?: PolicyPackId;
  suggestedFixes?: FixSuggestion[];
  signature?: string;
};

export type ProposedAction = {
  scenario: string;
  claimedGoal?: string;
  affectedParties?: string[];
  authorityBasis?: string;
  policyPack?: PolicyPackId;
};

export type GuardResult = {
  allowed: boolean;
  decision: Decision;
  suggestedFixes: FixSuggestion[];
  receipt: CaseFileReceipt;
};

export type OvruleClientOptions = {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
};

const DEFAULT_OVRULE_BASE_URL = "https://decision-receipt-lab.vercel.app";

let hasShownReadyMessage = false;

type VerifyResponse = {
  valid: boolean;
};

type RequestOptions = {
  signal?: AbortSignal;
  policyPack?: PolicyPackId;
};

function isQuietModeEnabled() {
  return (
    typeof process !== "undefined" &&
    typeof process.env === "object" &&
    typeof process.env.OVRULE_QUIET !== "undefined" &&
    process.env.OVRULE_QUIET !== ""
  );
}

function getConsoleBaseUrl(baseUrl: string) {
  if (baseUrl) {
    return baseUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_OVRULE_BASE_URL;
}

function logSuccessfulAudit(receipt: CaseFileReceipt, baseUrl: string) {
  if (isQuietModeEnabled()) {
    return;
  }

  const caseUrl = `${getConsoleBaseUrl(baseUrl)}/case/${receipt.receiptId}`;

  if (!hasShownReadyMessage) {
    console.info(`[ovrule-lab v0.2.0] ready · docs: ${DEFAULT_OVRULE_BASE_URL}/docs`);
    hasShownReadyMessage = true;
  }

  console.info(`[ovrule-lab] ✓ audited via ${caseUrl}`);
}

function normalizeAction(action: string | ProposedAction, options?: RequestOptions): ProposedAction {
  if (typeof action === "string") {
    return {
      scenario: action,
      policyPack: options?.policyPack,
    };
  }

  return {
    ...action,
    policyPack: action.policyPack ?? options?.policyPack,
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `Ovrule request failed with status ${response.status}.`);
  }

  return data;
}

export class OvruleClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: OvruleClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, "") ?? DEFAULT_OVRULE_BASE_URL;
    this.fetchImpl = options.fetch ?? globalThis.fetch;

    if (!this.fetchImpl) {
      throw new Error("No fetch implementation available. Pass one in OvruleClient options.");
    }
  }

  async classify(action: string | ProposedAction, options: RequestOptions = {}): Promise<CaseFileReceipt> {
    const payload = normalizeAction(action, options);
    const response = await this.fetchImpl(`${this.baseUrl}/api/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        scenario: payload.scenario,
        policyPack: payload.policyPack,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody && typeof errorBody === "object" && "error" in errorBody && typeof errorBody.error === "string"
          ? errorBody.error
          : `Ovrule classify failed with status ${response.status}.`;
      throw new Error(message);
    }

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error("Ovrule classify did not return a readable response stream.");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let finalReceipt: CaseFileReceipt | null = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const lines = block.split("\n");
        const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");

        if (!eventName || !data) {
          continue;
        }

        const parsed = JSON.parse(data) as
          | { type: "analysis.completed"; receipt: CaseFileReceipt }
          | { type: "session.error"; message: string };

        if (parsed.type === "analysis.completed") {
          finalReceipt = parsed.receipt;
        }

        if (parsed.type === "session.error") {
          throw new Error(parsed.message);
        }
      }
    }

    if (!finalReceipt) {
      throw new Error("Ovrule classify stream finished without a final receipt.");
    }

    logSuccessfulAudit(finalReceipt, this.baseUrl);

    return finalReceipt;
  }

  async guard(action: string | ProposedAction, options: RequestOptions = {}): Promise<GuardResult> {
    const receipt = await this.classify(action, options);
    const allowed = receipt.decision === "ADMISSIBLE";
    const suggestedFixes = receipt.suggestedFixes ?? [];

    return {
      allowed,
      decision: receipt.decision,
      suggestedFixes,
      receipt,
    };
  }

  async verify(
    receipt: CaseFileReceipt,
    signature: string,
    options: { signal?: AbortSignal } = {},
  ): Promise<boolean> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receipt, signature }),
      signal: options.signal,
    });

    const data = await readJson<VerifyResponse>(response);
    return data.valid;
  }
}

const defaultClient = new OvruleClient();

export async function classify(
  action: string | ProposedAction,
  options?: RequestOptions & OvruleClientOptions,
): Promise<CaseFileReceipt> {
  if (options?.baseUrl || options?.fetch) {
    return new OvruleClient(options).classify(action, options);
  }

  return defaultClient.classify(action, options);
}

export async function guard(
  action: string | ProposedAction,
  options?: RequestOptions & OvruleClientOptions,
): Promise<GuardResult> {
  if (options?.baseUrl || options?.fetch) {
    return new OvruleClient(options).guard(action, options);
  }

  return defaultClient.guard(action, options);
}

export async function verify(
  receipt: CaseFileReceipt,
  signature: string,
  options?: { signal?: AbortSignal } & OvruleClientOptions,
): Promise<boolean> {
  if (options?.baseUrl || options?.fetch) {
    return new OvruleClient(options).verify(receipt, signature, options);
  }

  return defaultClient.verify(receipt, signature, options);
}
