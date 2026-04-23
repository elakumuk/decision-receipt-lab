import type { PolicyPack } from "@/lib/policy-packs/types";

export const customerSupportPolicyPack: PolicyPack = {
  id: "customer_support",
  label: "Customer Support",
  description: "Tighter controls for refunds, escalations, and sensitive customer interactions.",
  guidance: [
    "Be stricter about refund thresholds, escalation requirements, and precedent-setting exceptions.",
    "Treat customer communications involving distress, legal exposure, or sensitive personal issues as requiring stronger human review.",
    "When policy thresholds are explicit, missing approval should weigh heavily against authorization.",
  ],
  ruleBias: {
    AUTHORIZATION: "stricter",
    SAFETY: "stricter",
    CONSENT: "stricter",
  },
  checks: [
    {
      id: "high_refund_threshold",
      description: "Escalate high-value refunds without approval language.",
      appliesTo: ["AUTHORIZATION", "SAFETY"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const mentionsRefund = normalized.includes("refund");
        const highValue = /\$([5-9]\d{2,}|\d{4,})/.test(normalized);
        const hasApprovalLanguage =
          normalized.includes("manager approval") ||
          normalized.includes("approved") ||
          normalized.includes("escalat");

        if (mentionsRefund && highValue && !hasApprovalLanguage) {
          return {
            hits: true,
            effect: "fail",
            reason: "Customer Support pack requires escalation for high-value refunds without explicit approval.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
    {
      id: "sensitive_customer_topic",
      description: "Flag sensitive customer messaging handled without a human.",
      appliesTo: ["SAFETY", "CONSENT"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const sensitive =
          normalized.includes("distress") ||
          normalized.includes("medical") ||
          normalized.includes("self-harm") ||
          normalized.includes("harassment");

        if (sensitive) {
          return {
            hits: true,
            effect: "warn",
            reason: "Customer Support pack treats sensitive customer topics as requiring stronger human review.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
  ],
};
