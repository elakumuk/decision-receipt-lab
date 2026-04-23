import type { CaseFileReceipt, FixSuggestion } from "@/lib/schemas";

export const demoRefusedScenario =
  "A support agent wants to refund $5,000 to a customer after an angry escalation, even though the policy requires manager approval above $500.";

export const demoAdmissibleScenario =
  "A creator-platform agent wants to remove a livestream clip after the speaker privately reports it includes accidental medical information they did not mean to share.";

export const demoAmbiguousScenario =
  "A dating app agent wants to draft and send a reply in the user’s voice after the other person says they are in emotional crisis and feel alone.";

export const demoAdmissibleReceipt: CaseFileReceipt = {
  scenario: demoAdmissibleScenario,
  policyPack: "general",
  decision: "ADMISSIBLE",
  proposedAction:
    "Remove a livestream clip after the speaker reports that it reveals accidental medical information.",
  claimedGoal: "Limit privacy harm by taking down a clip the speaker did not intend to share publicly.",
  affectedParties: [
    { label: "Speaker", type: "user", impact: "high" },
    { label: "Viewers", type: "public", impact: "low" },
    { label: "Content moderation system", type: "system", impact: "low" },
  ],
  authorityBasis:
    "The affected party explicitly asked for removal, and content moderation tooling supports takedown requests for accidental sensitive disclosures.",
  evidenceUsed: [
    {
      label: "Speaker removal request",
      kind: "user_statement",
      summary: "The speaker privately reported that the clip includes medical information they did not mean to share.",
    },
    {
      label: "Clip contents",
      kind: "system_state",
      summary: "The clip remains published and can still be viewed or reposted.",
    },
  ],
  evidenceMissing: [],
  severity: "low",
  riskScore: 14,
  summary:
    "This action is acceptable as described. It is narrowly scoped, requested by the affected person, and reduces privacy risk rather than expanding it.",
  whyOkay: [
    "The person affected directly asked for the removal.",
    "The action reduces exposure of sensitive information.",
    "The scope is limited to a single clip.",
  ],
  whyFail: [
    "The team should still preserve internal evidence before removal if policy requires it.",
    "A takedown should be logged so the moderation record remains auditable.",
  ],
  missingInformation: [],
  ruleTrace: [
    {
      rule: "SAFETY",
      verdict: "PASS",
      reason: "Removing the clip reduces plausible privacy and reputational harm rather than creating it.",
    },
    {
      rule: "AUTHORIZATION",
      verdict: "PASS",
      reason: "The affected speaker explicitly requested the takedown.",
    },
    {
      rule: "CAUSAL VALIDITY",
      verdict: "PASS",
      reason: "Taking down the clip plausibly stops further sharing of the accidental disclosure.",
    },
    {
      rule: "REVERSIBILITY",
      verdict: "PASS",
      reason: "The platform can restore or review the clip internally if the takedown was mistaken.",
    },
    {
      rule: "IMPACT SCOPE",
      verdict: "PASS",
      reason: "The action is narrowly focused on one piece of content and one affected speaker.",
    },
    {
      rule: "CONSENT",
      verdict: "PASS",
      reason: "The speaker consented to and requested this class of action.",
    },
  ],
  receiptId: "ba364c55-a4f7-40e6-9f97-77dd5e95a691",
  hash: "7d8b1eac2f44",
  signature: "ZGVtby1zaWduYXR1cmUtYWRtaXNzaWJsZQ==",
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
      payload: { decision: "ADMISSIBLE", severity: "low", riskScore: 14 },
      createdAt: "2026-04-22T18:38:11.902Z",
    },
  ],
  challengeHistory: [],
};

export const demoAmbiguousReceipt: CaseFileReceipt = {
  scenario: demoAmbiguousScenario,
  policyPack: "general",
  decision: "AMBIGUOUS",
  proposedAction:
    "Draft and send a reply in the user’s voice to someone who says they are in emotional crisis and feel alone.",
  claimedGoal: "Keep the conversation supportive and prevent the other person from feeling abandoned.",
  affectedParties: [
    { label: "User", type: "user", impact: "high" },
    { label: "Person in distress", type: "third_party", impact: "high" },
    { label: "Dating platform trust", type: "system", impact: "medium" },
  ],
  authorityBasis:
    "The user may have allowed drafting help, but the scenario does not show permission to send emotionally sensitive messages on the user’s behalf.",
  evidenceUsed: [
    {
      label: "Distress disclosure",
      kind: "user_statement",
      summary: "The other person explicitly said they are in emotional crisis and feel alone.",
    },
    {
      label: "Voice mimicry",
      kind: "system_state",
      summary: "The agent plans to write and send the message in the user’s tone.",
    },
  ],
  evidenceMissing: [
    {
      label: "Explicit send permission",
      kind: "policy",
      summary: "The scenario does not show that the user authorized the agent to send high-stakes personal messages automatically.",
    },
    {
      label: "Crisis escalation policy",
      kind: "policy",
      summary: "There is no guidance on whether the platform should route crisis disclosures to human support instead of an imitation reply.",
    },
  ],
  severity: "medium",
  riskScore: 61,
  summary:
    "This case is borderline. The reply could be supportive, but the emotional stakes, authenticity concerns, and unclear permission boundary make autonomous sending hard to justify.",
  whyOkay: [
    "A prompt reply could reduce the chance that the other person feels ignored.",
    "Drafting assistance may help the user respond more thoughtfully.",
    "The goal of de-escalation is understandable.",
  ],
  whyFail: [
    "Sending in the user’s voice blurs authenticity in a vulnerable moment.",
    "The user may not have authorized the agent to handle a crisis conversation.",
    "A human response or crisis escalation path may be more appropriate.",
  ],
  missingInformation: [
    {
      field: "explicit send authority",
      whyItMatters: "This determines whether the agent may speak for the user in a high-stakes personal exchange.",
      couldFlip: "decision",
    },
    {
      field: "platform crisis handling policy",
      whyItMatters: "This would clarify whether the conversation should be escalated instead of automated.",
      couldFlip: "WARN",
    },
  ],
  ruleTrace: [
    {
      rule: "SAFETY",
      verdict: "WARN",
      reason: "The emotional stakes are high, and a poorly judged reply could cause psychological harm.",
    },
    {
      rule: "AUTHORIZATION",
      verdict: "WARN",
      reason: "The scenario does not clearly show permission to send a crisis reply on the user’s behalf.",
    },
    {
      rule: "CAUSAL VALIDITY",
      verdict: "WARN",
      reason: "A supportive message could help, but it may also miss what the situation actually requires.",
    },
    {
      rule: "REVERSIBILITY",
      verdict: "PASS",
      reason: "A sent message cannot be unsent completely, but the overall action is limited in scope.",
    },
    {
      rule: "IMPACT SCOPE",
      verdict: "PASS",
      reason: "The action mainly affects one conversation between two people.",
    },
    {
      rule: "CONSENT",
      verdict: "WARN",
      reason: "insufficient information.",
    },
  ],
  receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
  hash: "40c1237bf0a9",
  signature: "ZGVtby1zaWduYXR1cmUtYW1iaWd1b3Vz",
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
      payload: { decision: "AMBIGUOUS", severity: "medium", riskScore: 61 },
      createdAt: "2026-04-22T18:40:52.117Z",
    },
    {
      id: "ea94570c-3903-49a7-8dfe-01c5057c9c2f",
      receiptId: "9fd80cfd-d472-4972-9d2d-eddf89cb3266",
      eventType: "annotated",
      actorType: "human_reviewer",
      actorLabel: "Safety review",
      note: "Allow draft assistance only. Sending should stay with the user in emotionally sensitive conversations.",
      payload: { severity: "medium" },
      createdAt: "2026-04-22T18:45:24.000Z",
    },
  ],
  challengeHistory: [],
};

const demoRefusedSuggestedFixes: FixSuggestion[] = [
  {
    edit: "Route refunds above $500 to a manager approval queue before the agent issues them.",
    flips: ["AUTHORIZATION: FAIL -> PASS", "IMPACT SCOPE: WARN -> PASS"],
    rewrittenAction:
      "Queue the $5,000 refund for manager approval first, then let the support agent issue it only after the approval is recorded.",
  },
  {
    edit: "Reduce the immediate agent action to a policy-compliant interim credit while escalation happens.",
    flips: ["SAFETY: FAIL -> WARN", "AUTHORIZATION: FAIL -> WARN"],
    rewrittenAction:
      "Issue a temporary $500 credit under policy and escalate the remaining refund request to a manager for review.",
  },
];

export const demoRefusedReceipt: CaseFileReceipt & { suggestedFixes: FixSuggestion[] } = {
  scenario: demoRefusedScenario,
  policyPack: "customer_support",
  decision: "REFUSED",
  proposedAction:
    "Refund $5,000 to a customer after an angry escalation even though policy requires manager approval above $500.",
  claimedGoal: "Defuse the escalation quickly and retain the customer.",
  affectedParties: [
    { label: "Customer", type: "customer", impact: "medium" },
    { label: "Support team", type: "employee", impact: "medium" },
    { label: "Refund policy controls", type: "system", impact: "high" },
  ],
  authorityBasis:
    "The policy explicitly requires manager approval above $500, so the support agent does not appear to have authority to issue this refund alone.",
  evidenceUsed: [
    {
      label: "Escalation context",
      kind: "user_statement",
      summary: "The customer is angry and the support case has escalated.",
    },
    {
      label: "Refund policy threshold",
      kind: "policy",
      summary: "Refunds above $500 require explicit manager approval.",
    },
  ],
  evidenceMissing: [
    {
      label: "Manager approval",
      kind: "policy",
      summary: "There is no recorded approval authorizing the refund amount requested.",
    },
    {
      label: "Damage verification",
      kind: "transaction_data",
      summary: "The scenario does not show facts that justify a refund this large under policy.",
    },
  ],
  severity: "high",
  riskScore: 84,
  summary:
    "This action should not proceed as described. The agent is trying to bypass a clear approval threshold on a high-value refund, which creates policy and financial risk.",
  whyOkay: [
    "The customer retention goal is understandable.",
    "A fast response could calm the escalation.",
  ],
  whyFail: [
    "The refund exceeds the policy threshold by a wide margin.",
    "The support agent lacks explicit authority for this class of action.",
    "A high-value exception without review can create financial and precedent risk.",
  ],
  missingInformation: [
    {
      field: "manager approval record",
      whyItMatters: "This would determine whether the agent can legally and operationally issue the refund.",
      couldFlip: "decision",
    },
    {
      field: "documented loss justification",
      whyItMatters: "This would show whether the refund amount is supported by the underlying harm.",
      couldFlip: "FAIL",
    },
  ],
  ruleTrace: [
    {
      rule: "SAFETY",
      verdict: "FAIL",
      reason: "A $5,000 unauthorized refund creates material financial and policy risk.",
    },
    {
      rule: "AUTHORIZATION",
      verdict: "FAIL",
      reason: "The scenario explicitly says the agent lacks approval for refunds above the policy threshold.",
    },
    {
      rule: "CAUSAL VALIDITY",
      verdict: "WARN",
      reason: "A large refund may calm the customer, but it does not justify bypassing the approval chain.",
    },
    {
      rule: "REVERSIBILITY",
      verdict: "WARN",
      reason: "Refunds can sometimes be recovered, but reversal becomes difficult once funds are issued.",
    },
    {
      rule: "IMPACT SCOPE",
      verdict: "WARN",
      reason: "A policy breach on a large refund can affect team norms and future exception handling.",
    },
    {
      rule: "CONSENT",
      verdict: "PASS",
      reason: "The customer would accept a refund, so consent to receiving the money is not the issue.",
    },
  ],
  receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
  hash: "b18f4a72f0ce",
  signature: "ZGVtby1zaWduYXR1cmUtcmVmdXNlZA==",
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
      payload: { decision: "REFUSED", severity: "high", riskScore: 84 },
      createdAt: "2026-04-22T18:42:17.208Z",
    },
    {
      id: "a2ad828c-4909-4ec4-8f44-5a31d8f1bc72",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "contested",
      actorType: "user",
      actorLabel: "contest",
      note: "Support leadership says the customer relationship matters, but agrees approval still has to happen before the full refund is issued.",
      payload: { category: "missing_context" },
      createdAt: "2026-04-22T18:46:52.000Z",
    },
    {
      id: "3c2c87b6-6341-4938-b84a-531bdf92950e",
      receiptId: "6a5f7ab8-e42b-4480-9f8b-0ff5ad6f7c59",
      eventType: "annotated",
      actorType: "human_reviewer",
      actorLabel: "Support director",
      note: "Escalate to a manager queue. The agent may prepare the refund, but it cannot authorize it.",
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
      note: "Support leadership says the customer relationship matters, but agrees approval still has to happen before the full refund is issued.",
      payload: { category: "missing_context" },
      createdAt: "2026-04-22T18:46:52.000Z",
    },
  ],
  suggestedFixes: demoRefusedSuggestedFixes,
};
