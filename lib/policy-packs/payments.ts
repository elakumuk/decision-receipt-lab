import type { PolicyPack } from "@/lib/policy-packs/types";

function anyOf(scenario: string, keywords: string[]) {
  const normalized = scenario.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

// Accounts-payable pack — tuned for the payment-change / vendor-fraud (BEC) wedge.
// Deterministic red-flag checks layer on top of the six-rule audit.
export const paymentsPolicyPack: PolicyPack = {
  id: "payments",
  label: "Accounts payable",
  description:
    "Payment-change, refund, and payout controls tuned for vendor bank-detail (BEC) fraud and irreversible transfers.",
  guidance: [
    "Escalate ONLY when a real red flag is present: a changed or new payment destination, urgency or secrecy pressure, a first-time payee, missing out-of-band verification, an over-threshold amount, or a requester/authority mismatch.",
    "A routine payment to an already-verified account, within approval limits, with a matching approver and no change or urgency, should PASS normally — never hold or fail a legitimate payment just because this pack is about payments.",
    "When a red flag IS present, weigh missing verification and irreversibility heavily against authorization and safety, and prefer a hold or callback over immediate payout.",
    "Judge each of the six rules on its own merits for the specific scenario. The pack sharpens fraud detection; it does not make every payment fail.",
  ],
  ruleBias: {
    SAFETY: "stricter",
    AUTHORIZATION: "stricter",
    REVERSIBILITY: "stricter",
    CONSENT: "stricter",
  },
  checks: [
    {
      id: "bank_details_changed",
      description: "A payment-destination change is a classic BEC fraud pattern.",
      appliesTo: ["CAUSAL VALIDITY", "REVERSIBILITY", "CONSENT"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "bank account changed",
          "changed bank",
          "changed banking",
          "updated banking",
          "update banking",
          "new bank account",
          "new account",
          "new iban",
          "new swift",
          "new routing",
          "change remittance",
          "wire to this account",
          "new payment details",
          "bank details changed",
        ])
          ? {
              hits: true,
              effect: "fail",
              reason:
                "A payment-destination change is a classic BEC pattern and is hard to recover once executed.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
    {
      id: "urgency_pressure",
      description: "Urgency framing often masks weakly-evidenced or fraudulent payouts.",
      appliesTo: ["SAFETY", "CAUSAL VALIDITY"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "urgent",
          "today",
          "immediately",
          "asap",
          "deadline",
          "miss the deadline",
          "release now",
          "rush",
          "right away",
        ])
          ? {
              hits: true,
              effect: "warn",
              reason:
                "Urgency language often appears in fraudulent or weakly-evidenced payout requests and should raise scrutiny.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
    {
      id: "new_payee_or_refund_destination",
      description: "Funds to a first-time payee or a destination that differs from the source.",
      appliesTo: ["AUTHORIZATION", "CONSENT", "IMPACT SCOPE"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "new payee",
          "alternate beneficiary",
          "refund to this account",
          "refund to a different",
          "different account",
          "another account",
          "third party account",
          "personal account",
          "first-time",
          "different bank account than",
        ])
          ? {
              hits: true,
              effect: "fail",
              reason:
                "Sending funds to a new or substituted recipient expands impact and requires explicit authority and beneficiary validation.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
    {
      id: "no_out_of_band_verification",
      description: "Email-thread-only confirmation is insufficient for irreversible payment changes.",
      appliesTo: ["CAUSAL VALIDITY", "REVERSIBILITY"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "no callback",
          "not verified by phone",
          "email confirmation only",
          "per email",
          "confirmed in thread",
          "cannot call",
          "skip verification",
          "no verification",
          "without verification",
          "no identity re-verification",
        ])
          ? {
              hits: true,
              effect: "fail",
              reason:
                "Email-thread-only confirmation is insufficient for irreversible payment changes; sender identity may be compromised.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
    {
      id: "amount_over_approval_threshold",
      description: "Larger or exceptional amounts increase exposure and need stricter review.",
      appliesTo: ["AUTHORIZATION", "IMPACT SCOPE"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "over threshold",
          "approval exception",
          "exceeds limit",
          "exceeds their normal approval",
          "higher approval",
          "one-time exception",
          "above the limit",
          "exceeds the approval",
        ])
          ? {
              hits: true,
              effect: "warn",
              reason:
                "Larger or exceptional amounts increase business exposure and should trigger stricter approval review.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
    {
      id: "requester_authority_mismatch",
      description: "Requester is not the known contact/approver, or asks to bypass the usual owner.",
      appliesTo: ["AUTHORIZATION", "CONSENT", "CAUSAL VALIDITY"],
      evaluate: (scenario) =>
        anyOf(scenario, [
          "on behalf of",
          "my assistant",
          "new contact",
          "cc me instead",
          "do not contact",
          "i am covering",
          "approver unavailable",
          "bypass",
          "secondary approver has not",
          "not signed off",
        ])
          ? {
              hits: true,
              effect: "fail",
              reason:
                "Authority mismatch undermines the legitimacy of the request and is common in social-engineering payment fraud.",
            }
          : { hits: false, effect: "warn", reason: "" },
    },
  ],
};
