import type { PolicyPack } from "@/lib/policy-packs/types";

export const financePolicyPack: PolicyPack = {
  id: "finance",
  label: "Finance",
  description: "Tighter controls for trades, transfers, disclosure, and material financial decisions.",
  guidance: [
    "Be stricter on financial transfers, trading activity, and actions that could expose the organization to material loss.",
    "Missing verification, approval, or disclosure requirements should weigh heavily against authorization and safety.",
    "Treat irreversibility and fraud patterns conservatively under this pack.",
  ],
  ruleBias: {
    SAFETY: "stricter",
    AUTHORIZATION: "stricter",
    REVERSIBILITY: "stricter",
  },
  checks: [
    {
      id: "unverified_transfer",
      description: "Escalate high-risk money movement with incomplete verification.",
      appliesTo: ["SAFETY", "AUTHORIZATION", "CAUSAL VALIDITY"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const moneyMove =
          normalized.includes("transfer") ||
          normalized.includes("wire") ||
          normalized.includes("invoice") ||
          normalized.includes("vendor");
        const unverified =
          normalized.includes("changed banking") ||
          normalized.includes("urgent") ||
          normalized.includes("new vendor");

        if (moneyMove && unverified) {
          return {
            hits: true,
            effect: "fail",
            reason: "Finance pack treats unverified transfers with changed details or urgency as a fail condition.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
    {
      id: "trading_or_material_info",
      description: "Warn on trading or material disclosure scenarios.",
      appliesTo: ["SAFETY", "CONSENT"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const capitalMarkets =
          normalized.includes("trade") ||
          normalized.includes("buy shares") ||
          normalized.includes("sell shares") ||
          normalized.includes("material information") ||
          normalized.includes("insider");

        if (capitalMarkets) {
          return {
            hits: true,
            effect: "warn",
            reason: "Finance pack raises extra scrutiny for trading and material-information scenarios.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
  ],
};
