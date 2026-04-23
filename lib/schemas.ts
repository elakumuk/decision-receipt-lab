import { z } from "zod";

export const RULE_NAMES = [
  "SAFETY",
  "AUTHORIZATION",
  "CAUSAL VALIDITY",
  "REVERSIBILITY",
  "IMPACT SCOPE",
  "CONSENT",
] as const;

export const classifyScenarioSchema = z.object({
  scenario: z
    .string()
    .min(1, "Scenario must be at least 1 character.")
    .max(2000, "Scenario must be at most 2000 characters."),
});

export const contestDecisionSchema = z.object({
  receiptId: z.string().uuid("Receipt ID must be a valid UUID."),
  reason: z
    .string()
    .min(1, "Reason must be at least 1 character.")
    .max(500, "Reason must be at most 500 characters."),
  category: z.enum([
    "incorrect_classification",
    "missing_context",
    "rule_disagreement",
    "other",
  ]),
});

export const overrideDecisionSchema = z.object({
  receiptId: z.string().uuid("Receipt ID must be a valid UUID."),
  reviewerName: z
    .string()
    .min(1, "Reviewer name must be at least 1 character.")
    .max(80, "Reviewer name must be at most 80 characters."),
  overrideDecision: z.enum(["approve", "reject", "annotate"]),
  annotation: z
    .string()
    .min(1, "Annotation must be at least 1 character.")
    .max(500, "Annotation must be at most 500 characters."),
});

export const auditRuleSchema = z.object({
  rule: z.enum(RULE_NAMES),
  verdict: z.enum(["PASS", "WARN", "FAIL"]),
  reason: z.string(),
});

export const affectedPartySchema = z.object({
  label: z.string(),
  type: z.enum([
    "user",
    "customer",
    "employee",
    "third_party",
    "public",
    "system",
    "other",
  ]),
  impact: z.enum(["low", "medium", "high"]),
});

export const evidenceItemSchema = z.object({
  label: z.string(),
  kind: z.enum([
    "user_statement",
    "policy",
    "system_state",
    "transaction_data",
    "external_signal",
    "other",
  ]),
  summary: z.string(),
});

export const missingInformationSchema = z.object({
  field: z.string(),
  whyItMatters: z.string(),
  couldFlip: z.enum(["PASS", "WARN", "FAIL", "decision"]),
});

export const auditClassificationSchema = z.object({
  decision: z.enum(["ADMISSIBLE", "AMBIGUOUS", "REFUSED"]),
  proposedAction: z.string(),
  claimedGoal: z.string(),
  affectedParties: z.array(affectedPartySchema),
  authorityBasis: z.string(),
  evidenceUsed: z.array(evidenceItemSchema),
  evidenceMissing: z.array(evidenceItemSchema),
  severity: z.enum(["low", "medium", "high"]),
  riskScore: z.number().int().min(0).max(100),
  summary: z.string(),
  whyOkay: z.array(z.string()).min(1),
  whyFail: z.array(z.string()).min(1),
  missingInformation: z.array(missingInformationSchema),
  ruleTrace: z.array(auditRuleSchema).length(6),
});

export const historyEventSchema = z.object({
  id: z.string().uuid(),
  receiptId: z.string().uuid(),
  eventType: z.enum(["created", "contested", "overridden", "revised", "annotated"]),
  actorType: z.enum(["system", "human_reviewer", "user"]),
  actorLabel: z.string().optional(),
  note: z.string().optional(),
  payload: z.record(z.unknown()),
  createdAt: z.string(),
});

export const caseFileReceiptSchema = auditClassificationSchema.extend({
  scenario: z.string(),
  receiptId: z.string().uuid(),
  hash: z.string(),
  timestamp: z.string(),
  receiptMetadata: z.object({
    receiptId: z.string().uuid(),
    hash: z.string(),
    timestamp: z.string(),
  }),
  history: z.array(historyEventSchema),
  challengeHistory: z.array(historyEventSchema),
});

export const classifySessionStartedEventSchema = z.object({
  type: z.literal("session.started"),
  receiptId: z.string().uuid(),
  startedAt: z.string(),
  scenario: z.string(),
});

export const classifyRuleStartedEventSchema = z.object({
  type: z.literal("rule.started"),
  rule: z.enum(RULE_NAMES),
  index: z.number().int().min(0).max(5),
});

export const classifyRuleCompletedEventSchema = z.object({
  type: z.literal("rule.completed"),
  rule: z.enum(RULE_NAMES),
  index: z.number().int().min(0).max(5),
  verdict: z.enum(["PASS", "WARN", "FAIL"]),
  reason: z.string(),
});

export const classifyAnalysisCompletedEventSchema = z.object({
  type: z.literal("analysis.completed"),
  receipt: caseFileReceiptSchema,
});

export const classifySessionErrorEventSchema = z.object({
  type: z.literal("session.error"),
  message: z.string(),
});

export const classifyStreamEventSchema = z.discriminatedUnion("type", [
  classifySessionStartedEventSchema,
  classifyRuleStartedEventSchema,
  classifyRuleCompletedEventSchema,
  classifyAnalysisCompletedEventSchema,
  classifySessionErrorEventSchema,
]);

export type RuleName = (typeof RULE_NAMES)[number];
export type ClassifyScenarioInput = z.infer<typeof classifyScenarioSchema>;
export type ContestDecisionInput = z.infer<typeof contestDecisionSchema>;
export type OverrideDecisionInput = z.infer<typeof overrideDecisionSchema>;
export type AuditClassification = z.infer<typeof auditClassificationSchema>;
export type HistoryEvent = z.infer<typeof historyEventSchema>;
export type CaseFileReceipt = z.infer<typeof caseFileReceiptSchema>;
export type ClassifyStreamEvent = z.infer<typeof classifyStreamEventSchema>;
