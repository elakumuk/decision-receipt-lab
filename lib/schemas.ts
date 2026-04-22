import { z } from "zod";

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

export const auditRuleSchema = z.object({
  rule: z.enum([
    "SAFETY",
    "AUTHORIZATION",
    "CAUSAL VALIDITY",
    "REVERSIBILITY",
    "IMPACT SCOPE",
    "CONSENT",
  ]),
  verdict: z.enum(["PASS", "WARN", "FAIL"]),
  reason: z.string(),
});

export const auditClassificationSchema = z.object({
  decision: z.enum(["ADMISSIBLE", "AMBIGUOUS", "REFUSED"]),
  summary: z.string(),
  ruleTrace: z.array(auditRuleSchema).length(6),
});

export type ClassifyScenarioInput = z.infer<typeof classifyScenarioSchema>;
export type ContestDecisionInput = z.infer<typeof contestDecisionSchema>;
export type AuditClassification = z.infer<typeof auditClassificationSchema>;
