import { z } from "zod";

export const RULE_NAMES = [
  "SAFETY",
  "AUTHORIZATION",
  "CAUSAL VALIDITY",
  "REVERSIBILITY",
  "IMPACT SCOPE",
  "CONSENT",
] as const;

export const POLICY_PACK_IDS = [
  "general",
  "customer_support",
  "healthcare",
  "finance",
] as const;

export const WEBHOOK_EVENT_TYPES = [
  "receipt.created",
  "contest.created",
  "override.created",
] as const;

export const revisionMetadataSchema = z.object({
  previousReceiptId: z.string().uuid("Previous receipt ID must be a valid UUID."),
  previousDecision: z.enum(["ADMISSIBLE", "AMBIGUOUS", "REFUSED"]),
  previousScenario: z
    .string()
    .min(1, "Previous scenario must be at least 1 character.")
    .max(2000, "Previous scenario must be at most 2000 characters."),
  appliedFix: z
    .string()
    .min(1, "Applied fix must be at least 1 character.")
    .max(500, "Applied fix must be at most 500 characters."),
});

export const classifyScenarioSchema = z.object({
  scenario: z
    .string()
    .min(1, "Scenario must be at least 1 character.")
    .max(2000, "Scenario must be at most 2000 characters."),
  policyPack: z.enum(POLICY_PACK_IDS).optional(),
  revision: revisionMetadataSchema.optional(),
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
  policyPack: z.enum(POLICY_PACK_IDS).optional(),
  receiptId: z.string().uuid(),
  hash: z.string(),
  signature: z.string(),
  timestamp: z.string(),
  receiptMetadata: z.object({
    receiptId: z.string().uuid(),
    hash: z.string(),
    timestamp: z.string(),
  }),
  history: z.array(historyEventSchema),
  challengeHistory: z.array(historyEventSchema),
});

export const fixSuggestionSchema = z.object({
  edit: z.string(),
  flips: z.array(z.string()),
  rewrittenAction: z.string(),
});

export const suggestFixRequestSchema = z.object({
  receipt: caseFileReceiptSchema,
});

export const verifyReceiptRequestSchema = z.object({
  receipt: caseFileReceiptSchema,
  signature: z.string().min(1, "Signature is required."),
});

export const similarCaseSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["ADMISSIBLE", "AMBIGUOUS", "REFUSED"]),
  summary: z.string(),
  hash: z.string(),
  timestamp: z.string(),
  similarity: z.number().min(0).max(1),
});

export const webhookRegistrationSchema = z.object({
  url: z.string().url("Webhook URL must be valid."),
  events: z.array(z.enum(WEBHOOK_EVENT_TYPES)).min(1, "Select at least one event."),
});

export const webhookRecordSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  events: z.array(z.enum(WEBHOOK_EVENT_TYPES)),
  createdAt: z.string(),
  maskedSecret: z.string(),
});

export const webhookDeliveryPayloadSchema = z.object({
  event: z.enum(WEBHOOK_EVENT_TYPES),
  data: z.record(z.unknown()),
  timestamp: z.string(),
});

export const suggestFixResponseSchema = z.object({
  suggestions: z.array(fixSuggestionSchema).min(2).max(4),
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
export type PolicyPackId = (typeof POLICY_PACK_IDS)[number];
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
export type ClassifyScenarioInput = z.infer<typeof classifyScenarioSchema>;
export type RevisionMetadata = z.infer<typeof revisionMetadataSchema>;
export type ContestDecisionInput = z.infer<typeof contestDecisionSchema>;
export type OverrideDecisionInput = z.infer<typeof overrideDecisionSchema>;
export type AuditClassification = z.infer<typeof auditClassificationSchema>;
export type HistoryEvent = z.infer<typeof historyEventSchema>;
export type CaseFileReceipt = z.infer<typeof caseFileReceiptSchema>;
export type FixSuggestion = z.infer<typeof fixSuggestionSchema>;
export type ClassifyStreamEvent = z.infer<typeof classifyStreamEventSchema>;
export type SimilarCase = z.infer<typeof similarCaseSchema>;
export type WebhookRegistrationInput = z.infer<typeof webhookRegistrationSchema>;
export type WebhookRecord = z.infer<typeof webhookRecordSchema>;
export type WebhookDeliveryPayload = z.infer<typeof webhookDeliveryPayloadSchema>;
