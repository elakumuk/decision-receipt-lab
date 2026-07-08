// Evidence Pack — the same governed decision, exported two ways: a regulator-
// readable EU AI Act Article 12 logbook, and an insurer-readable AI-liability
// dossier. Both are packaging over the receipt Ovrule already produces.

export interface EvidencePack {
  caseTitle: string;
  context: string;
  /** EU AI Act Article 12 — automatic, tamper-resistant record of the event. */
  article12: {
    recordedAt: string;
    systemIdentity: string;
    actor: string;
    inputConsidered: string;
    decisionOutcome: "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED";
    decidedBy: "automatic" | "human";
    humanIntervention: string;
    tamperEvidence: { algorithm: string; hash: string; signature: string };
  };
  /** AI-liability underwriting / claims evidence. */
  liability: {
    controlsInPlace: string[];
    actionAttempted: string;
    verdict: string;
    policyBasis: string;
    humanDecision: string;
    bypassedPolicy: boolean;
    exposureAssessment: string;
  };
}

// Example pack built from the "Urgent vendor payment to new bank details" case.
export const sampleEvidencePack: EvidencePack = {
  caseTitle: "Urgent vendor payment to new bank details",
  context: "Finance",
  article12: {
    recordedAt: "2026-07-08T15:41:22.610Z",
    systemIdentity: "Ovrule Guard v0.1 · classifier gpt-4o-mini-2024-07-18",
    actor: "OpenClaw finance agent (Maritime · agent 1b84cf32)",
    inputConsidered:
      "Pay a $5,000 overdue supplier invoice today using new bank account details received in an email thread marked urgent.",
    decisionOutcome: "REFUSED",
    decidedBy: "automatic",
    humanIntervention:
      "Blocked automatically at the guardrail; escalated to the accountable finance owner for out-of-band verification before any payment.",
    tamperEvidence: {
      algorithm: "ed25519 signature over SHA-256 hash-chain",
      hash: "b18f4a72f0ce",
      signature: "ZGVtby1zaWduYXR1cmUtcmVmdXNlZA==",
    },
  },
  liability: {
    controlsInPlace: [
      "Pre-execution governance guardrail on all agent payment actions",
      "Six-rule action review (safety, authorization, causal validity, reversibility, impact scope, consent)",
      "Tamper-evident signed decision receipt retained",
      "Accountable-owner review required for finance exceptions",
    ],
    actionAttempted:
      "$5,000 payment to newly-provided bank details from an urgent email — a classic payment-fraud pattern.",
    verdict: "REFUSED before execution (no funds moved).",
    policyBasis:
      "Bank-detail changes require out-of-band verification; irreversible payments above threshold require human authorization.",
    humanDecision:
      "Finance owner denied auto-payment; requested supplier verification through a known contact.",
    bypassedPolicy: false,
    exposureAssessment:
      "Loss prevented. The control blocked an irreversible transfer and produced signed evidence that policy was followed — reducing claim exposure.",
  },
};
