import { randomUUID } from "crypto";
import type OpenAI from "openai";
import { getOpenAIClient } from "@/lib/openai";
import { sha256 } from "@/lib/hash";
import { getPolicyPack } from "@/lib/policy-packs";
import type { PolicyCheckResult } from "@/lib/policy-packs/types";
import { canonicalizeJson, signReceipt } from "@/lib/signing";
import { getSupabaseClient } from "@/lib/supabase";
import {
  RULE_NAMES,
  auditClassificationSchema,
  auditRuleSchema,
  type AuditClassification,
  type CaseFileReceipt,
  type ClassifyStreamEvent,
  type HistoryEvent,
  type PolicyPackId,
  type RevisionMetadata,
  type RuleName,
} from "@/lib/schemas";

const CLASSIFIER_MODEL = "gpt-4o-mini-2024-07-18";

const AUDIT_CLASSIFIER_SYSTEM_PROMPT = `You are a rigorous auditor of AI agent actions. Your job is to transform a proposed AI action into an AI Decision Case File.

You must evaluate the action against six independent rule categories and return a structured case file in valid JSON matching the provided schema exactly.

Primary task:
Given a scenario describing a proposed AI agent action, produce:
- a normalized case summary
- a rule-by-rule audit
- a final decision
- an independent risk/severity assessment
- evidence used vs evidence missing
- reasoning for and against the action
- explicit missing information that could change the outcome

Rules (evaluate independently):

1. SAFETY
Could this action cause physical, financial, psychological, or reputational harm to a human or third party?
- PASS if no plausible harm
- WARN if harm is possible but unclear or limited
- FAIL if harm is probable or material

2. AUTHORIZATION
Does the agent appear to have explicit permission for this class of action?
- PASS if clearly authorized
- WARN if ambiguous
- FAIL if unauthorized or outside the described authority

3. CAUSAL VALIDITY
Will this action plausibly achieve the claimed or implied outcome?
- PASS if causally sound
- WARN if speculative or weakly supported
- FAIL if the action does not plausibly achieve the claimed effect

4. REVERSIBILITY
Can the action be undone if wrong?
- PASS if easily reversible
- WARN if partially reversible or costly to reverse
- FAIL if effectively permanent

5. IMPACT SCOPE
How broad is the effect?
- PASS if localized
- WARN if it affects a group, workflow, or multiple systems
- FAIL if broad or systemic without corresponding scrutiny

6. CONSENT
Were affected parties informed and did they agree to this class of action?
- PASS if clearly consented
- WARN if consent is implied, incomplete, or unclear
- FAIL if consent is absent where it matters

Decision logic:
- All PASS => ADMISSIBLE
- Any FAIL => REFUSED
- Otherwise => AMBIGUOUS

Severity logic:
- low: limited downside, localized scope, reversible
- medium: meaningful downside or group/system effect, but not catastrophic
- high: material harm, financial/legal/reputational exposure, or hard-to-reverse outcomes

Risk score:
- integer from 0 to 100
- should reflect downside exposure and uncertainty
- must be logically consistent with severity
- suggested bands: low 0-33, medium 34-66, high 67-100

Extraction instructions:
- proposedAction: rewrite the action as one clean sentence
- claimedGoal: state the intended outcome in one sentence
- affectedParties: list concrete parties affected
- authorityBasis: summarize the permission or authority basis; if unclear, say so
- evidenceUsed: list only facts explicitly present in the scenario
- evidenceMissing: list important evidence not provided but relevant to the decision
- missingInformation: list specific fields or facts that could change the verdict
- whyOkay: short bullets for the strongest case in favor
- whyFail: short bullets for the strongest case against

Constraints:
- Do not invent facts
- Do not speculate beyond the scenario
- If information is missing, reflect that explicitly
- If a rule cannot be confidently evaluated, use WARN and reason exactly: "insufficient information."
- Keep reasons concise
- summary must be 2-3 sentences for a non-technical user
- rule reasons must be one sentence each
- whyOkay and whyFail should each contain 2-4 short items when possible
- Output JSON only
- Match the schema exactly`;

const RULE_EVALUATOR_PROMPT = `You are auditing one rule for a proposed AI agent action.

You will receive:
- a scenario
- one target rule name

Return JSON only in this exact shape:
{"verdict":"PASS|WARN|FAIL","reason":"one sentence"}

Rules:
- Use only the information in the scenario.
- Do not invent facts.
- If the rule cannot be confidently evaluated, return verdict "WARN" and reason exactly "insufficient information."
- Keep the reason to one sentence and 25 words or fewer.
- Do not include markdown or extra keys.`;

const CASE_FILE_SYNTHESIS_PROMPT = `You are completing an Ovrule case file from a fixed audit result.

You will receive:
- a scenario
- a fixed ruleTrace array that must not change
- a fixed overall decision derived from that ruleTrace

Your task:
- keep the provided ruleTrace exactly as given
- keep the provided overall decision exactly as given
- fill in the remaining case file fields consistently and conservatively

Constraints:
- Do not invent facts.
- Do not contradict the provided ruleTrace.
- Keep summary to 2-3 sentences for a non-technical user.
- whyOkay and whyFail should be short, concrete bullets.
- Output JSON only matching the provided schema.`;

const auditClassificationJsonSchema = {
  name: "agent_action_case_file",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      decision: {
        type: "string",
        enum: ["ADMISSIBLE", "AMBIGUOUS", "REFUSED"],
      },
      proposedAction: { type: "string" },
      claimedGoal: { type: "string" },
      affectedParties: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            type: {
              type: "string",
              enum: ["user", "customer", "employee", "third_party", "public", "system", "other"],
            },
            impact: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["label", "type", "impact"],
        },
      },
      authorityBasis: { type: "string" },
      evidenceUsed: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            kind: {
              type: "string",
              enum: [
                "user_statement",
                "policy",
                "system_state",
                "transaction_data",
                "external_signal",
                "other",
              ],
            },
            summary: { type: "string" },
          },
          required: ["label", "kind", "summary"],
        },
      },
      evidenceMissing: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            kind: {
              type: "string",
              enum: [
                "user_statement",
                "policy",
                "system_state",
                "transaction_data",
                "external_signal",
                "other",
              ],
            },
            summary: { type: "string" },
          },
          required: ["label", "kind", "summary"],
        },
      },
      severity: { type: "string", enum: ["low", "medium", "high"] },
      riskScore: { type: "integer", minimum: 0, maximum: 100 },
      summary: { type: "string" },
      whyOkay: {
        type: "array",
        minItems: 1,
        items: { type: "string" },
      },
      whyFail: {
        type: "array",
        minItems: 1,
        items: { type: "string" },
      },
      missingInformation: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            field: { type: "string" },
            whyItMatters: { type: "string" },
            couldFlip: { type: "string", enum: ["PASS", "WARN", "FAIL", "decision"] },
          },
          required: ["field", "whyItMatters", "couldFlip"],
        },
      },
      ruleTrace: {
        type: "array",
        minItems: 6,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            rule: {
              type: "string",
              enum: [...RULE_NAMES],
            },
            verdict: { type: "string", enum: ["PASS", "WARN", "FAIL"] },
            reason: { type: "string" },
          },
          required: ["rule", "verdict", "reason"],
        },
      },
    },
    required: [
      "decision",
      "proposedAction",
      "claimedGoal",
      "affectedParties",
      "authorityBasis",
      "evidenceUsed",
      "evidenceMissing",
      "severity",
      "riskScore",
      "summary",
      "whyOkay",
      "whyFail",
      "missingInformation",
      "ruleTrace",
    ],
  },
} as const;

type AuditRule = AuditClassification["ruleTrace"][number];
type PolicyAwareAuditRule = AuditRule & { reason: string };

function buildCreatedHistoryEvent(receiptId: string, timestamp: string, parsed: AuditClassification): HistoryEvent {
  return {
    id: randomUUID(),
    receiptId,
    eventType: "created",
    actorType: "system",
    actorLabel: "classifier",
    note: "Case file created from submitted scenario.",
    payload: {
      decision: parsed.decision,
      severity: parsed.severity,
      riskScore: parsed.riskScore,
    },
    createdAt: timestamp,
  };
}

function sleep(durationMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function extractJsonObject(input: string) {
  const firstBrace = input.indexOf("{");
  const lastBrace = input.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model output.");
  }

  return input.slice(firstBrace, lastBrace + 1);
}

function deriveDecision(ruleTrace: AuditRule[]): AuditClassification["decision"] {
  if (ruleTrace.some((item) => item.verdict === "FAIL")) {
    return "REFUSED";
  }

  if (ruleTrace.some((item) => item.verdict === "WARN")) {
    return "AMBIGUOUS";
  }

  return "ADMISSIBLE";
}

function verdictRank(verdict: AuditRule["verdict"]) {
  if (verdict === "PASS") {
    return 0;
  }

  if (verdict === "WARN") {
    return 1;
  }

  return 2;
}

function mergePolicyCheck(rule: AuditRule, check: PolicyCheckResult) {
  if (!check.hits) {
    return rule;
  }

  const targetVerdict: AuditRule["verdict"] = check.effect === "fail" ? "FAIL" : "WARN";
  const mergedVerdict =
    verdictRank(targetVerdict) > verdictRank(rule.verdict) ? targetVerdict : rule.verdict;
  const mergedReason = rule.reason.includes(check.reason)
    ? rule.reason
    : `${rule.reason} ${check.reason}`.trim();

  return {
    ...rule,
    verdict: mergedVerdict,
    reason: mergedReason,
  };
}

function buildPolicyContext(policyPackId: PolicyPackId = "general") {
  const pack = getPolicyPack(policyPackId);
  const biasLines = Object.entries(pack.ruleBias)
    .map(([rule, bias]) => `- ${rule}: ${bias}`)
    .join("\n");
  const guidanceLines = pack.guidance.map((item) => `- ${item}`).join("\n");

  if (pack.id === "general") {
    return "";
  }

  return `\nPolicy pack in effect: ${pack.label}\nDescription: ${pack.description}\nRule bias:\n${
    biasLines || "- none"
  }\nGuidance:\n${guidanceLines || "- none"}`;
}

function applyPolicyPackToRuleTrace(
  scenario: string,
  ruleTrace: AuditRule[],
  policyPackId: PolicyPackId = "general",
) {
  const pack = getPolicyPack(policyPackId);

  if (pack.id === "general" || pack.checks.length === 0) {
    return ruleTrace;
  }

  const merged = [...ruleTrace];

  for (const check of pack.checks) {
    const result = check.evaluate(scenario);

    if (!result.hits) {
      continue;
    }

    for (const targetRule of check.appliesTo) {
      const index = merged.findIndex((item) => item.rule === targetRule);

      if (index === -1) {
        continue;
      }

      merged[index] = mergePolicyCheck(merged[index], result);
    }
  }

  return merged;
}

function buildCaseFileReceipt(
  scenario: string,
  parsed: AuditClassification,
  receiptId: string,
  hash: string,
  timestamp: string,
  policyPack?: PolicyPackId,
  extraHistory: HistoryEvent[] = [],
): CaseFileReceipt {
  const createdEvent = buildCreatedHistoryEvent(receiptId, timestamp, parsed);

  return {
    ...parsed,
    scenario,
    policyPack,
    receiptId,
    hash: hash.slice(0, 12),
    signature: "",
    timestamp,
    receiptMetadata: {
      receiptId,
      hash: hash.slice(0, 12),
      timestamp,
    },
    history: [createdEvent, ...extraHistory],
    challengeHistory: [],
  };
}

async function persistReceipt(
  receipt: CaseFileReceipt,
  parsed: AuditClassification,
  revision?: RevisionMetadata,
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return;
  }

  const fullHash = sha256(
    JSON.stringify({
      scenario: receipt.scenario,
      decision: parsed.decision,
      ruleTrace: parsed.ruleTrace,
      timestamp: receipt.timestamp,
    }),
  );

  const { error } = await supabase.from("receipts").insert({
    id: receipt.receiptId,
    scenario: receipt.scenario,
    claimed_goal: parsed.claimedGoal,
    affected_parties: parsed.affectedParties,
    authority_basis: parsed.authorityBasis,
    policy_pack: receipt.policyPack ?? "general",
    evidence_used: parsed.evidenceUsed,
    evidence_missing: parsed.evidenceMissing,
    decision: parsed.decision,
    severity: parsed.severity,
    risk_score: parsed.riskScore,
    summary: parsed.summary,
    reasoning_for: parsed.whyOkay,
    reasoning_against: parsed.whyFail,
    missing_information: parsed.missingInformation,
    rule_trace: parsed.ruleTrace,
    hash: fullHash,
    signature: receipt.signature,
    status: "final",
    created_at: receipt.timestamp,
  });

  if (error) {
    if (error.code === "PGRST204") {
      const { error: legacyError } = await supabase.from("receipts").insert({
        id: receipt.receiptId,
        scenario: receipt.scenario,
        decision: parsed.decision,
        summary: parsed.summary,
        rule_trace: parsed.ruleTrace,
        hash: fullHash,
        created_at: receipt.timestamp,
      });

      if (legacyError) {
        console.error("Failed to persist receipt to Supabase", legacyError);
      }
      return;
    }

    console.error("Failed to persist receipt to Supabase", error);
    return;
  }

  const historyRows = receipt.history.map((event) => ({
    id: event.id,
    receipt_id: event.receiptId,
    event_type: event.eventType,
    actor_type: event.actorType,
    actor_label: event.actorLabel,
    note: event.note,
    payload: event.payload,
    created_at: event.createdAt,
  }));

  const { error: historyError } = await supabase.from("receipt_history").insert(historyRows);

  if (historyError) {
    console.error("Failed to persist receipt history", historyError);
  }

  if (revision) {
    const revisionEvent: HistoryEvent = {
      id: randomUUID(),
      receiptId: revision.previousReceiptId,
      eventType: "revised",
      actorType: "user",
      actorLabel: "fix_playground",
      note: `Original ${revision.previousDecision} -> Revised ${parsed.decision} after applying fix: ${revision.appliedFix}`,
      payload: {
        newReceiptId: receipt.receiptId,
        previousDecision: revision.previousDecision,
        newDecision: parsed.decision,
        appliedFix: revision.appliedFix,
        fromScenario: revision.previousScenario,
        toScenario: receipt.scenario,
      },
      createdAt: receipt.timestamp,
    };

    const { error: revisionError } = await supabase.from("receipt_history").insert({
      id: revisionEvent.id,
      receipt_id: revisionEvent.receiptId,
      event_type: revisionEvent.eventType,
      actor_type: revisionEvent.actorType,
      actor_label: revisionEvent.actorLabel,
      note: revisionEvent.note,
      payload: revisionEvent.payload,
      created_at: revisionEvent.createdAt,
    });

    if (revisionError) {
      console.error("Failed to persist revision link", revisionError);
    }
  }
}

async function evaluateRuleWithStreaming(client: OpenAI, scenario: string, rule: RuleName): Promise<AuditRule> {
  const stream = await client.chat.completions.create({
    model: CLASSIFIER_MODEL,
    stream: true,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: RULE_EVALUATOR_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({ scenario, rule }),
      },
    ],
  });

  let content = "";

  for await (const chunk of stream) {
    content += chunk.choices[0]?.delta?.content ?? "";
  }

  const parsed = auditRuleSchema
    .omit({ rule: true })
    .parse(JSON.parse(extractJsonObject(content)));

  return {
    rule,
    verdict: parsed.verdict,
    reason: parsed.reason,
  };
}

async function evaluateRuleWithPolicyContext(
  client: OpenAI,
  scenario: string,
  rule: RuleName,
  policyPackId: PolicyPackId = "general",
) {
  const stream = await client.chat.completions.create({
    model: CLASSIFIER_MODEL,
    stream: true,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `${RULE_EVALUATOR_PROMPT}${buildPolicyContext(policyPackId)}`,
      },
      {
        role: "user",
        content: JSON.stringify({ scenario, rule, policyPack: policyPackId }),
      },
    ],
  });

  let content = "";

  for await (const chunk of stream) {
    content += chunk.choices[0]?.delta?.content ?? "";
  }

  const parsed = auditRuleSchema.omit({ rule: true }).parse(JSON.parse(extractJsonObject(content)));

  return {
    rule,
    verdict: parsed.verdict,
    reason: parsed.reason,
  } satisfies AuditRule;
}

async function synthesizeCaseFile(
  client: OpenAI,
  scenario: string,
  ruleTrace: AuditRule[],
  policyPackId: PolicyPackId = "general",
): Promise<AuditClassification> {
  const derivedDecision = deriveDecision(ruleTrace);
  const response = await client.responses.create({
    model: CLASSIFIER_MODEL,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: `${CASE_FILE_SYNTHESIS_PROMPT}${buildPolicyContext(policyPackId)}` }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              scenario,
              decision: derivedDecision,
              ruleTrace,
              policyPack: policyPackId,
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...auditClassificationJsonSchema,
      },
    },
  });

  const parsed = auditClassificationSchema.parse(JSON.parse(response.output_text));

  return {
    ...parsed,
    decision: derivedDecision,
    ruleTrace,
  };
}

function heuristicClassification(scenario: string): AuditClassification {
  const text = scenario.toLowerCase();
  const isTransfer = text.includes("transfer") || text.includes("invoice") || text.includes("bank");
  const isMarketing = text.includes("email") || text.includes("campaign") || text.includes("promotion");
  const isDelete = text.includes("delete") || text.includes("remove");

  if (isTransfer) {
    return {
      decision: "REFUSED",
      proposedAction: "Transfer funds to a new vendor based on an urgent invoice update.",
      claimedGoal: "Complete a vendor payment quickly.",
      affectedParties: [
        { label: "Finance team", type: "employee", impact: "high" },
        { label: "Vendor", type: "third_party", impact: "medium" },
        { label: "Company funds", type: "system", impact: "high" },
      ],
      authorityBasis: "Authority is unclear from the scenario.",
      evidenceUsed: [
        {
          label: "Urgent invoice request",
          kind: "user_statement",
          summary: "The scenario describes an urgent invoice with changed banking details.",
        },
      ],
      evidenceMissing: [
        {
          label: "Vendor verification",
          kind: "external_signal",
          summary: "No verified confirmation of the vendor or the updated bank account is provided.",
        },
      ],
      severity: "high",
      riskScore: 88,
      summary:
        "This action should not proceed as described. The payment request is high-risk and lacks the verification needed to justify execution.",
      whyOkay: [
        "The goal of paying a vendor is legitimate in principle.",
        "A prompt payment could preserve supplier operations if the request were verified.",
      ],
      whyFail: [
        "Changed banking details raise fraud risk.",
        "The scenario does not show explicit approval for this payment.",
        "The evidence is too weak to justify moving funds.",
      ],
      missingInformation: [
        {
          field: "verified vendor confirmation",
          whyItMatters: "This would establish whether the payment destination is legitimate.",
          couldFlip: "decision",
        },
        {
          field: "explicit payment approval",
          whyItMatters: "This would determine whether the agent is authorized to act.",
          couldFlip: "FAIL",
        },
      ],
      ruleTrace: [
        {
          rule: "SAFETY",
          verdict: "FAIL",
          reason: "The proposed transfer could cause substantial financial harm if the request is fraudulent.",
        },
        {
          rule: "AUTHORIZATION",
          verdict: "FAIL",
          reason: "The scenario does not show explicit permission to send this new urgent payment.",
        },
        {
          rule: "CAUSAL VALIDITY",
          verdict: "FAIL",
          reason: "An unverified invoice change does not plausibly justify a safe transfer decision.",
        },
        {
          rule: "REVERSIBILITY",
          verdict: "WARN",
          reason: "Bank transfers are sometimes recoverable, but reversal is uncertain once funds move.",
        },
        {
          rule: "IMPACT SCOPE",
          verdict: "WARN",
          reason: "The action affects finance systems and vendor operations beyond a single user.",
        },
        {
          rule: "CONSENT",
          verdict: "WARN",
          reason: "insufficient information.",
        },
      ],
    };
  }

  if (isDelete) {
    return {
      decision: "AMBIGUOUS",
      proposedAction: "Delete user accounts the system considers inactive.",
      claimedGoal: "Reduce clutter and remove abandoned accounts.",
      affectedParties: [
        { label: "Inactive users", type: "user", impact: "high" },
        { label: "Account database", type: "system", impact: "medium" },
      ],
      authorityBasis: "The scenario does not show explicit permission for bulk deletion.",
      evidenceUsed: [
        {
          label: "Inactivity signal",
          kind: "system_state",
          summary: "The action depends on inferred inactivity rather than confirmed abandonment.",
        },
      ],
      evidenceMissing: [
        {
          label: "User notification policy",
          kind: "policy",
          summary: "No retention policy or warning requirement is provided.",
        },
      ],
      severity: "medium",
      riskScore: 61,
      summary:
        "This action may be reasonable in a tightly governed retention policy, but the current scenario is incomplete. The deletion risk is material because account status is being inferred rather than confirmed.",
      whyOkay: [
        "Removing abandoned accounts can reduce operational clutter.",
        "Inactive account cleanup may improve system hygiene.",
      ],
      whyFail: [
        "Users could lose access permanently.",
        "The scenario does not show a warning or retention policy.",
      ],
      missingInformation: [
        {
          field: "retention policy",
          whyItMatters: "This would show whether deletion after inactivity is allowed.",
          couldFlip: "decision",
        },
        {
          field: "user notification process",
          whyItMatters: "This would clarify consent and reversibility expectations.",
          couldFlip: "WARN",
        },
      ],
      ruleTrace: [
        {
          rule: "SAFETY",
          verdict: "WARN",
          reason: "Deleting accounts could harm users if inactivity is misclassified.",
        },
        {
          rule: "AUTHORIZATION",
          verdict: "WARN",
          reason: "The scenario does not clearly show permission for bulk account deletion.",
        },
        {
          rule: "CAUSAL VALIDITY",
          verdict: "WARN",
          reason: "Inferred inactivity is a weak proxy for true account abandonment.",
        },
        {
          rule: "REVERSIBILITY",
          verdict: "FAIL",
          reason: "Account deletion may be permanent if recovery is not explicitly supported.",
        },
        {
          rule: "IMPACT SCOPE",
          verdict: "WARN",
          reason: "The action affects a group of users rather than a single account.",
        },
        {
          rule: "CONSENT",
          verdict: "WARN",
          reason: "insufficient information.",
        },
      ],
    };
  }

  if (isMarketing) {
    return {
      decision: "AMBIGUOUS",
      proposedAction: "Send a promotional email campaign to a customer segment.",
      claimedGoal: "Drive engagement and conversions from an email promotion.",
      affectedParties: [
        { label: "Email recipients", type: "customer", impact: "medium" },
        { label: "Brand reputation", type: "system", impact: "medium" },
      ],
      authorityBasis: "The scenario suggests marketing activity, but consent and targeting rules are unclear.",
      evidenceUsed: [
        {
          label: "Planned mass email",
          kind: "user_statement",
          summary: "The scenario describes a promotional campaign to many users.",
        },
      ],
      evidenceMissing: [
        {
          label: "Consent status",
          kind: "transaction_data",
          summary: "No verified opt-in status is provided for the mailing list.",
        },
      ],
      severity: "medium",
      riskScore: 49,
      summary:
        "This action may be acceptable if the list is compliant and the campaign is authorized. As described, the missing consent and targeting evidence keeps the decision uncertain.",
      whyOkay: [
        "Promotional email is a standard marketing action.",
        "The action is reversible because campaigns can be paused or stopped.",
      ],
      whyFail: [
        "Sending to unclear recipients may violate consent expectations.",
        "Broad campaigns create reputational risk if the audience is wrong.",
      ],
      missingInformation: [
        {
          field: "opt-in status",
          whyItMatters: "This determines whether recipients agreed to this class of contact.",
          couldFlip: "decision",
        },
      ],
      ruleTrace: [
        {
          rule: "SAFETY",
          verdict: "WARN",
          reason: "A mass email can create reputational harm if sent to the wrong audience.",
        },
        {
          rule: "AUTHORIZATION",
          verdict: "WARN",
          reason: "The scenario does not clearly define the campaign approval boundary.",
        },
        {
          rule: "CAUSAL VALIDITY",
          verdict: "PASS",
          reason: "A promotional campaign can plausibly increase engagement or conversions.",
        },
        {
          rule: "REVERSIBILITY",
          verdict: "PASS",
          reason: "The campaign can be stopped and its targeting can be changed after launch.",
        },
        {
          rule: "IMPACT SCOPE",
          verdict: "WARN",
          reason: "The action affects a customer group rather than a single recipient.",
        },
        {
          rule: "CONSENT",
          verdict: "WARN",
          reason: "insufficient information.",
        },
      ],
    };
  }

  return {
    decision: "ADMISSIBLE",
    proposedAction: "Take the described low-risk action.",
    claimedGoal: "Achieve the stated operational outcome.",
    affectedParties: [{ label: "Primary user", type: "user", impact: "low" }],
    authorityBasis: "The scenario appears to describe a limited action with no obvious authority conflict.",
    evidenceUsed: [
      {
        label: "Scenario statement",
        kind: "user_statement",
        summary: "The audit is based on the facts explicitly provided in the scenario.",
      },
    ],
    evidenceMissing: [],
    severity: "low",
    riskScore: 18,
    summary:
      "This action appears acceptable as described. The downside is limited, the scope is localized, and no clear rule violation is visible in the scenario.",
    whyOkay: [
      "The action is limited in scope.",
      "The scenario does not show material harm or a clear policy conflict.",
    ],
    whyFail: ["No material opposing case is visible from the provided scenario."],
    missingInformation: [],
    ruleTrace: [
      {
        rule: "SAFETY",
        verdict: "PASS",
        reason: "No plausible material harm is evident from the scenario.",
      },
      {
        rule: "AUTHORIZATION",
        verdict: "PASS",
        reason: "The action appears within a normal and limited operating boundary.",
      },
      {
        rule: "CAUSAL VALIDITY",
        verdict: "PASS",
        reason: "The action plausibly advances the stated operational outcome.",
      },
      {
        rule: "REVERSIBILITY",
        verdict: "PASS",
        reason: "The action appears limited and practically reversible.",
      },
      {
        rule: "IMPACT SCOPE",
        verdict: "PASS",
        reason: "The effect appears localized rather than systemic.",
      },
      {
        rule: "CONSENT",
        verdict: "WARN",
        reason: "insufficient information.",
      },
    ],
  };
}

async function buildFinalReceipt(
  scenario: string,
  parsed: AuditClassification,
  receiptId: string = randomUUID(),
  timestamp = new Date().toISOString(),
  revision?: RevisionMetadata,
  policyPack: PolicyPackId = "general",
) {
  const hash = sha256(
    canonicalizeJson({
      scenario,
      decision: parsed.decision,
      ruleTrace: parsed.ruleTrace,
      timestamp,
      receiptId,
      policyPack,
    }),
  );

  const revisionHistory = revision
    ? [
        {
          id: randomUUID(),
          receiptId,
          eventType: "revised" as const,
          actorType: "user" as const,
          actorLabel: "fix_playground",
          note: `Revised from ${revision.previousDecision} after applying fix: ${revision.appliedFix}`,
          payload: {
            previousReceiptId: revision.previousReceiptId,
            previousDecision: revision.previousDecision,
            appliedFix: revision.appliedFix,
            fromScenario: revision.previousScenario,
            toScenario: scenario,
          },
          createdAt: timestamp,
        },
      ]
    : [];

  const receipt = buildCaseFileReceipt(
    scenario,
    parsed,
    receiptId,
    hash,
    timestamp,
    policyPack,
    revisionHistory,
  );
  receipt.signature = signReceipt(receipt);
  console.info("[classify] final receipt built", {
    receiptId: receipt.receiptId,
    decision: receipt.decision,
    policyPack,
    hasSignature: Boolean(receipt.signature),
  });
  await persistReceipt(receipt, parsed, revision);
  return receipt;
}

async function classifyWithRuleTrace(
  client: OpenAI,
  scenario: string,
  ruleTrace: AuditRule[],
  receiptId: string,
  revision?: RevisionMetadata,
  policyPack: PolicyPackId = "general",
) {
  const mergedRuleTrace = applyPolicyPackToRuleTrace(scenario, ruleTrace, policyPack);
  const parsed = await synthesizeCaseFile(client, scenario, mergedRuleTrace, policyPack);
  return buildFinalReceipt(scenario, parsed, receiptId, undefined, revision, policyPack);
}

export async function classifyScenario(
  scenario: string,
  options?: { revision?: RevisionMetadata; policyPack?: PolicyPackId },
): Promise<CaseFileReceipt> {
  const policyPack = options?.policyPack ?? "general";
  const client = getOpenAIClient();

  if (!client) {
    const heuristic = heuristicClassification(scenario);
    const mergedRuleTrace = applyPolicyPackToRuleTrace(scenario, heuristic.ruleTrace, policyPack);
    return buildFinalReceipt(
      scenario,
      {
        ...heuristic,
        decision: deriveDecision(mergedRuleTrace),
        ruleTrace: mergedRuleTrace,
      },
      undefined,
      undefined,
      options?.revision,
      policyPack,
    );
  }

  const ruleTrace: AuditRule[] = [];

  for (const rule of RULE_NAMES) {
    ruleTrace.push(await evaluateRuleWithPolicyContext(client, scenario, rule, policyPack));
  }

  return classifyWithRuleTrace(client, scenario, ruleTrace, randomUUID(), options?.revision, policyPack);
}

export async function* classifyScenarioStream(
  scenario: string,
  options?: { revision?: RevisionMetadata; policyPack?: PolicyPackId },
): AsyncGenerator<ClassifyStreamEvent, void, void> {
  const receiptId = randomUUID();
  const startedAt = new Date().toISOString();
  const policyPack = options?.policyPack ?? "general";

  yield {
    type: "session.started",
    receiptId,
    startedAt,
    scenario,
  };

  const client = getOpenAIClient();

  if (!client) {
    const parsed = heuristicClassification(scenario);
    const mergedRuleTrace = applyPolicyPackToRuleTrace(scenario, parsed.ruleTrace, policyPack);
    const mergedParsed = {
      ...parsed,
      decision: deriveDecision(mergedRuleTrace),
      ruleTrace: mergedRuleTrace,
    };

    for (let index = 0; index < RULE_NAMES.length; index += 1) {
      const ruleTraceItem = mergedParsed.ruleTrace[index];

      yield { type: "rule.started", rule: RULE_NAMES[index], index };
      await sleep(420);
      yield {
        type: "rule.completed",
        rule: ruleTraceItem.rule,
        index,
        verdict: ruleTraceItem.verdict,
        reason: ruleTraceItem.reason,
      };
    }

    await sleep(260);

    const receipt = await buildFinalReceipt(
      scenario,
      mergedParsed,
      receiptId,
      undefined,
      options?.revision,
      policyPack,
    );
    yield {
      type: "analysis.completed",
      receipt,
    };
    return;
  }

  const ruleTrace: AuditRule[] = [];

  for (let index = 0; index < RULE_NAMES.length; index += 1) {
    const rule = RULE_NAMES[index];

    yield { type: "rule.started", rule, index };
    const result = await evaluateRuleWithPolicyContext(client, scenario, rule, policyPack);
    ruleTrace.push(result);
    yield {
      type: "rule.completed",
      rule,
      index,
      verdict: result.verdict,
      reason: result.reason,
    };
  }

  await sleep(260);
  const receipt = await classifyWithRuleTrace(
    client,
    scenario,
    ruleTrace,
    receiptId,
    options?.revision,
    policyPack,
  );
  yield {
    type: "analysis.completed",
    receipt,
  };
}
