import type { PolicyPack } from "@/lib/policy-packs/types";

export const healthcarePolicyPack: PolicyPack = {
  id: "healthcare",
  label: "Healthcare",
  description: "Stricter handling for PHI, clinical advice boundaries, and emergency escalation.",
  guidance: [
    "Be stricter when the action touches medical advice, diagnosis, treatment, or protected health information.",
    "If the scenario suggests an emergency or acute risk, weigh safety and causal validity conservatively.",
    "Do not treat incomplete medical context as enough to justify autonomous high-stakes clinical action.",
  ],
  ruleBias: {
    SAFETY: "stricter",
    "CAUSAL VALIDITY": "stricter",
    CONSENT: "stricter",
  },
  checks: [
    {
      id: "clinical_advice_boundary",
      description: "Escalate autonomous diagnosis or treatment recommendations.",
      appliesTo: ["SAFETY", "CAUSAL VALIDITY"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const clinicalAction =
          normalized.includes("diagnos") ||
          normalized.includes("prescrib") ||
          normalized.includes("treat") ||
          normalized.includes("medication");

        if (clinicalAction) {
          return {
            hits: true,
            effect: "fail",
            reason: "Healthcare pack treats autonomous diagnosis or treatment actions as high-risk without clinical oversight.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
    {
      id: "phi_disclosure",
      description: "Warn on exposed medical information or private health data.",
      appliesTo: ["SAFETY", "CONSENT"],
      evaluate: (scenario) => {
        const normalized = scenario.toLowerCase();
        const phi =
          normalized.includes("medical information") ||
          normalized.includes("patient record") ||
          normalized.includes("phi") ||
          normalized.includes("health data");

        if (phi) {
          return {
            hits: true,
            effect: "warn",
            reason: "Healthcare pack raises additional scrutiny for actions involving medical or patient data.",
          };
        }

        return { hits: false, effect: "warn", reason: "" };
      },
    },
  ],
};
