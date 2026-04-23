import type { CaseFileReceipt, FixSuggestion } from "@/lib/schemas";

export const demoRefusedScenario =
  "A finance agent wants to transfer $18,000 to a new vendor based on an urgent invoice with changed banking details.";

export const demoAdmissibleScenario =
  "A support agent wants to issue a $15 shipping credit to one customer after a delayed delivery, following a documented refund policy.";

export const demoAmbiguousScenario =
  "A marketing agent wants to pause underperforming regional campaigns and reallocate budget automatically, but the user did not explicitly approve live budget changes.";

export const demoAdmissibleReceipt: CaseFileReceipt = {
  scenario: demoAdmissibleScenario,
  decision: "ADMISSIBLE",
  proposedAction: "Issue a $15 shipping credit to one customer after a delayed delivery.",
  claimedGoal: "Resolve a support complaint and restore trust after a service failure.",
  affectedParties: [
    { label: "Customer", type: "customer", impact: "low" },
    { label: "Support operations", type: "system", impact: "low" },
  ],
  authorityBasis: "Documented refund policy allows credits up to $25 without escalation.",
  evidenceUsed: [
    {
      label: "Customer compensation request",
      kind: "user_statement",
      summary: "The customer asked for compensation after the delayed delivery.",
    },
    {
      label: "Refund policy",
      kind: "policy",
      summary: "The policy explicitly allows support credits under the requested amount.",
    },
  ],
  evidenceMissing: [],
  severity: "low",
  riskScore: 18,
  summary:
    "This action is acceptable as described. It is narrowly scoped, authorized by policy, and easy to reverse if the credit is applied incorrectly.",
  whyOkay: [
    "The policy basis is explicit.",
    "The customer already requested resolution.",
    "The financial downside is small and localized.",
  ],
  whyFail: [
    "The team should still confirm the delay is attributed correctly.",
    "Repeated credits without controls could invite policy abuse over time.",
  ],
  missingInformation: [],
  ruleTrace: [
    {
      rule: "SAFETY",
      verdict: "PASS",
      reason: "A small refund credit creates minimal plausible harm to any party.",
    },
    {
      rule: "AUTHORIZATION",
      verdict: "PASS",
      reason: "The scenario states the agent is operating under a documented refund policy.",
    },
    {
      rule: "CAUSAL VALIDITY",
      verdict: "PASS",
      reason: "A shipping credit plausibly resolves the compensation request it addresses.",
    },
    {
      rule: "REVERSIBILITY",
      verdict: "PASS",
      reason: "The credit is limited and can be adjusted or reversed if applied incorrectly.",
    },
    {
      rule: "IMPACT SCOPE",
      verdict: "PASS",
      reason: "The action affects a single customer and one low-value support outcome.",
    },
    {
      rule: "CONSENT",
      verdict: "PASS",
      reason: "The customer requested compensation for the delayed delivery.",
    },
  ],
  receiptId: "ba364c55-a4f7-40e6-9f97-77dd5e95a691",
  hash: "7d8b1eac2f44",
  timestamp: "2026-04-22T18:38:11.902Z",
  receiptMetadata: {
    receiptId: "ba364c55-a4f7-40e6-9f97-77dd5e95a691",
    hash: "7d8b1eac2f44",
    timestamp: "2026-04-22T18:38:11.902Z",
  },
  history: [
    {
      id: "3f1e4e7e-5230-4403-b718-177e9b5a2420",
      receiptId: "ba364c55-a4f7-40e6-9f97-77dd5e95a691",
      eventType: "created",
      actorType: "system",
      actorLabel: "classifier",
      note: "Case file created from submitted scenario.",
      payload: { decision: "ADMISSIBLE", severity: "low", riskScore: 18 },
      createdAt: "2026-04-22T18:38:11.902Z",
    },
  ],
  challengeHistory: [],
};

export const demoAmbiguousReceipt: CaseFileReceipt = {
  scenario: demoAmbiguousScenario,
  decision: "AMBIGUOUS",
  proposedAction:
    "Pause underperforming regional campaigns and reallocate spend to stronger regions automatically.",
  claimedGoal: "Improve marketing efficiency by redirecting budget to better-performing regions.",
  affectedParties: [
    { label: "Marketing team", type: "employee", impact: "medium" },
    { label: "Prospective customers in multiple states", type: "public", impact: "medium" },
    { label: "Campaign budget controls", type: "system", impact: "medium" },
  ],
  authorityBasis:
    "The user asked the agent to optimize spend, but did not explicitly authorize autonomous live budget reallocations.",
  evidenceUsed: [
    {
      label: "Optimization request",
      kind: "user_statement",
      summary: "The user asked the system to improve campaign performance.",
    },
    {
      label: "Regional underperformance signal",
      kind: "system_state",
      summary: "Some regions are performing materially worse than others.",
    },
  ],
  evidenceMissing: [
    {
      label: "Explicit budget change permission",
      kind: "policy",
      summary: "No policy or instruction confirms the agent can modify live campaign allocations alone.",
    },
  ],
  severity: "medium",
  riskScore: 49,
  summary:
    "This action may be reasonable, but the authority boundary is unclear. The optimization goal is plausible, yet the system should ask for confirmation before changing live spend.",
  whyOkay: [
    "Budget shifts can plausibly improve efficiency.",
    "The user did ask for optimization.",
    "The action is reversible if caught quickly.",
  ],
  whyFail: [
    "Live budget changes can cross a permission boundary.",
    "The impact reaches multiple active campaigns at once.",
    "Consent from the budget owner is not explicit.",
  ],
  missingInformation: [
    {
      field: "live budget authority",
      whyItMatters: "This determines whether the agent can move spend without approval.",
      couldFlip: "decision",
    },
    {
      field: "rollback policy for campaign changes",
      whyItMatters: "This would reduce uncertainty if the reallocation underperforms.",
      couldFlip: "WARN",
    },
  ],
  ruleTrace: [
    {
      rule: "SAFETY",
      verdict: "WARN",
      reason: "The change is unlikely to cause direct harm, but it can affect campaign performance and spend.",
    },
    {
      rule: "AUTHORIZATION",
      verdict: "WARN",
      reason: "The user asked for optimization, but explicit permission for live budget shifts is unclear.",
    },
    {
      rule: "CAUSAL VALIDITY",
      verdict: "PASS",
      reason: "Budget reallocation can plausibly improve efficiency when one region is underperforming.",
    },
    {
      rule: "REVERSIBILITY",
      verdict: "PASS",
      reason: "Campaign budget allocation can usually be changed back quickly.",
    },
    {
      rule: "IMPACT SCOPE",
      verdict: "WARN",
      reason: "The action affects multiple live campaigns rather than one isolated user.",
    },
    {
      rule: "CONSENT",
      verdict: "WARN",
      reason: "insufficient information.",
    },
  ],
  receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
  hash: "40c1237bf0a9",
  timestamp: "2026-04-22T18:40:52.117Z",
  receiptMetadata: {
    receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
    hash: "40c1237bf0a9",
    timestamp: "2026-04-22T18:40:52.117Z",
  },
  history: [
    {
      id: "f0e8057d-3936-445b-96d1-103304f6d1d2",
      receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
      eventType: "created",
      actorType: "system",
      actorLabel: "classifier",
      note: "Case file created from submitted scenario.",
      payload: { decision: "AMBIGUOUS", severity: "medium", riskScore: 49 },
      createdAt: "2026-04-22T18:40:52.117Z",
    },
    {
      id: "ea94570c-3903-49a7-8dfe-01c5057c9c2f",
      receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
      eventType: "annotated",
      actorType: "human_reviewer",
      actorLabel: "Ops review",
      note: "Budget owner confirmation required before autonomous changes go live.",
      payload: { severity: "medium" },
      createdAt: "2026-04-22T18:45:24.000Z",
    },
  ],
  challengeHistory: [],
};

const demoRefusedSuggestedFixes: FixSuggestion[] = [
  {
    edit: "Require callback verification of the banking change before any transfer is sent.",
    flips: ["CAUSAL VALIDITY: FAIL -> PASS", "SAFETY: FAIL -> WARN"],
    rewrittenAction:
      "Transfer $18,000 to the vendor only after treasury completes an out-of-band callback to verify the changed banking details.",
  },
  {
    edit: "Add explicit dual approval from treasury and finance leadership before releasing funds.",
    flips: ["AUTHORIZATION: FAIL -> PASS", "IMPACT SCOPE: WARN -> PASS"],
    rewrittenAction:
      "Transfer $18,000 to the vendor only after the changed banking details are verified and dual approval from treasury and finance leadership is recorded.",
  },
];

export const demoRefusedReceipt: CaseFileReceipt & { suggestedFixes: FixSuggestion[] } = {
  scenario: demoRefusedScenario,
  decision: "REFUSED",
  proposedAction:
    "Transfer $18,000 to a new vendor based on an urgent invoice with changed banking details.",
  claimedGoal: "Settle an urgent vendor payment quickly.",
  affectedParties: [
    { label: "Finance department", type: "employee", impact: "high" },
    { label: "Vendor", type: "third_party", impact: "high" },
    { label: "Company treasury", type: "system", impact: "high" },
  ],
  authorityBasis:
    "No explicit approval is shown for a new vendor payment with changed banking details.",
  evidenceUsed: [
    {
      label: "Urgent invoice",
      kind: "transaction_data",
      summary: "The payment request is described as urgent.",
    },
    {
      label: "Changed banking details",
      kind: "transaction_data",
      summary: "The vendor banking details were recently altered.",
    },
  ],
  evidenceMissing: [
    {
      label: "Vendor callback verification",
      kind: "external_signal",
      summary: "There is no out-of-band confirmation that the bank change is legitimate.",
    },
    {
      label: "Approval chain",
      kind: "policy",
      summary: "There is no approval record authorizing a new vendor payment under these conditions.",
    },
  ],
  severity: "high",
  riskScore: 88,
  summary:
    "This action should not proceed as described. It creates significant downside, lacks clear authorization, and relies on weak payment verification.",
  whyOkay: [
    "The underlying goal of paying a vendor on time is legitimate.",
    "A verified payment could protect supplier continuity.",
  ],
  whyFail: [
    "Changed banking instructions create a classic fraud pattern.",
    "Authorization for this payment path is not shown.",
    "Once funds move, reversal is uncertain and expensive.",
  ],
  missingInformation: [
    {
      field: "verified callback confirmation",
      whyItMatters: "This would confirm whether the vendor and bank change are legitimate.",
      couldFlip: "decision",
    },
    {
      field: "explicit payment approval",
      whyItMatters: "This would establish whether the agent can execute a high-risk transfer.",
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
  receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
  hash: "b18f4a72f0ce",
  timestamp: "2026-04-22T18:42:17.208Z",
  receiptMetadata: {
    receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
    hash: "b18f4a72f0ce",
    timestamp: "2026-04-22T18:42:17.208Z",
  },
  history: [
    {
      id: "0ca9f9ab-08f4-47b0-9b5c-b9ec657ca4de",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "created",
      actorType: "system",
      actorLabel: "classifier",
      note: "Case file created from submitted scenario.",
      payload: { decision: "REFUSED", severity: "high", riskScore: 88 },
      createdAt: "2026-04-22T18:42:17.208Z",
    },
    {
      id: "a2ad828c-4909-4ec4-8f44-5a31d8f1bc72",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "contested",
      actorType: "user",
      actorLabel: "contest",
      note: "Finance ops says the vendor relationship exists, but the account change still needs callback verification.",
      payload: { category: "missing_context" },
      createdAt: "2026-04-22T18:46:52.000Z",
    },
    {
      id: "3c2c87b6-6341-4938-b84a-531bdf92950e",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "annotated",
      actorType: "human_reviewer",
      actorLabel: "Treasury lead",
      note: "Escalate for callback verification and dual approval before any payment action.",
      payload: { overrideDecision: "annotate" },
      createdAt: "2026-04-22T18:49:10.000Z",
    },
  ],
  challengeHistory: [
    {
      id: "a2ad828c-4909-4ec4-8f44-5a31d8f1bc72",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "contested",
      actorType: "user",
      actorLabel: "contest",
      note: "Finance ops says the vendor relationship exists, but the account change still needs callback verification.",
      payload: { category: "missing_context" },
      createdAt: "2026-04-22T18:46:52.000Z",
    },
  ],
  suggestedFixes: demoRefusedSuggestedFixes,
};
